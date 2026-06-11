package main

import (
	"context"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"

	"github.com/imammaulanaa/jarvis/api/internal/auth"
	"github.com/imammaulanaa/jarvis/api/internal/database"
	"github.com/imammaulanaa/jarvis/api/internal/handler"
	"github.com/imammaulanaa/jarvis/api/internal/k8s"
	"github.com/imammaulanaa/jarvis/api/internal/repository"
	"github.com/imammaulanaa/jarvis/api/internal/worker"
)

func main() {
	_ = godotenv.Load("../../.env")

	db, err := database.New()
	if err != nil {
		log.Fatalf("Database error: %v", err)
	}
	defer db.Close()

	dsn := os.Getenv("DATABASE_URL")
	if err := database.RunMigrations(dsn); err != nil {
		log.Fatalf("Migration error: %v", err)
	}

	userRepo    := repository.NewUserRepository(db)
	serviceRepo := repository.NewServiceRepository(db)
	auditRepo   := repository.NewAuditRepository(db)
	teamRepo    := repository.NewTeamRepository(db)

	k8sClient, err := k8s.New()
	if err != nil {
		log.Printf("WARN: k8s client unavailable: %v", err)
		log.Printf("      k8s endpoints will return 503. Continue without k8s.")
		k8sClient = nil
	}

	healthSync := worker.NewHealthSync(k8sClient, serviceRepo, auditRepo)
	healthSync.Start(context.Background())
	
	authHandler    := handler.NewAuthHandler(userRepo)
	serviceHandler := handler.NewServiceHandler(serviceRepo, auditRepo)
	importHandler  := handler.NewImportHandler(serviceRepo, teamRepo, auditRepo)
	teamHandler    := handler.NewTeamHandler(teamRepo, auditRepo)
	auditHandler   := handler.NewAuditHandler(auditRepo, serviceRepo)
	githubHandler  := handler.NewGitHubHandler(serviceRepo, auditRepo)
	webhookHandler := handler.NewWebhookHandler(serviceRepo, auditRepo)
	k8sHandler 	   := handler.NewK8sHandler(k8sClient, serviceRepo, auditRepo, healthSync)

	app := fiber.New(fiber.Config{AppName: "JARVIS API"})
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Authorization",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		if err := db.Ping(); err != nil {
			return c.Status(503).JSON(fiber.Map{"status": "degraded"})
		}
		return c.JSON(fiber.Map{"status": "ok", "app": "JARVIS"})
	})

	api := api_setup(app)

	api.Post("/webhooks/github", webhookHandler.HandleGitHub)

	authGroup := api.Group("/auth")
	authGroup.Post("/github", authHandler.GithubLogin)
	authGroup.Get("/me", auth.Protected(), authHandler.Me)

	api.Get("/audit-logs",       auth.Protected(), auditHandler.ListGlobal)
	api.Get("/github/rate-limit", auth.Protected(), githubHandler.RateLimit)

	services := api.Group("/services", auth.Protected())
	services.Get("/",                       serviceHandler.List)
	services.Post("/",                      serviceHandler.Create)
	services.Get("/stats",   				serviceHandler.Stats)
	services.Post("/import",                importHandler.ImportYAML)
	services.Get("/:slug",                  serviceHandler.Get)
	services.Put("/:slug",                  serviceHandler.Update)
	services.Patch("/:slug/status",         serviceHandler.UpdateStatus)
	services.Delete("/:slug",               serviceHandler.Delete)
	services.Get("/:slug/audit-logs",       auditHandler.ListByService)
	services.Post("/:slug/sync-github",     githubHandler.SyncRepo)
	services.Get("/:slug/branch-protection", githubHandler.BranchProtection)
	services.Get("/:slug/deployment",       k8sHandler.GetServiceDeployment)
	services.Post("/:slug/link-deployment", k8sHandler.LinkDeployment)
	services.Get("/:slug/pods", 			k8sHandler.GetServicePods)
	services.Get("/:slug/events", 			k8sHandler.GetServiceEvents)

	teams := api.Group("/teams", auth.Protected())
	teams.Get("/",                         teamHandler.List)
	teams.Post("/",                        teamHandler.Create)
	teams.Get("/:slug",                    teamHandler.Get)
	teams.Post("/:slug/members",           teamHandler.AddMember)
	teams.Delete("/:slug/members/:userID", teamHandler.RemoveMember)

	k8sGroup := api.Group("/k8s", auth.Protected())
	k8sGroup.Get("/health",     k8sHandler.Health)
	k8sGroup.Get("/namespaces", k8sHandler.ListNamespaces)
	k8sGroup.Post("/sync-health", k8sHandler.SyncHealth)
	k8sGroup.Get("/overview", k8sHandler.ClusterOverview)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("JARVIS API running on :%s", port)
	log.Fatal(app.Listen(":" + port))
}

func api_setup(app *fiber.App) fiber.Router {
	return app.Group("/api")
}
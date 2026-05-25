package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"

	"github.com/imammaulanaa/jarvis/api/internal/auth"
	"github.com/imammaulanaa/jarvis/api/internal/database"
	"github.com/imammaulanaa/jarvis/api/internal/handler"
	"github.com/imammaulanaa/jarvis/api/internal/repository"
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

	// Repositories
	userRepo    := repository.NewUserRepository(db)
	serviceRepo := repository.NewServiceRepository(db)
	auditRepo   := repository.NewAuditRepository(db)
	teamRepo := repository.NewTeamRepository(db)

	// Handlers
	authHandler    := handler.NewAuthHandler(userRepo)
	serviceHandler := handler.NewServiceHandler(serviceRepo, auditRepo)
	importHandler := handler.NewImportHandler(serviceRepo, teamRepo, auditRepo)
	teamHandler := handler.NewTeamHandler(teamRepo, auditRepo)

	app := fiber.New(fiber.Config{AppName: "JARVIS API"})
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Authorization",
	}))

	// Public routes
	app.Get("/health", func(c *fiber.Ctx) error {
		if err := db.Ping(); err != nil {
			return c.Status(503).JSON(fiber.Map{"status": "degraded"})
		}
		return c.JSON(fiber.Map{"status": "ok", "app": "JARVIS"})
	})

	api := app.Group("/api")

	// Auth routes — public
	authGroup := api.Group("/auth")
	authGroup.Post("/github", authHandler.GithubLogin)

	// Auth routes — protected
	authGroup.Get("/me", auth.Protected(), authHandler.Me)

	// Service routes — semua protected
	services := api.Group("/services", auth.Protected())
	services.Get("/",          serviceHandler.List)
	services.Post("/",         serviceHandler.Create)
	services.Get("/:slug",     serviceHandler.Get)
	services.Put("/:slug",     serviceHandler.Update)
	services.Delete("/:slug",  serviceHandler.Delete)
	services.Patch("/:slug/status", serviceHandler.UpdateStatus)
	services.Post("/import", importHandler.ImportYAML)

	// Teams routes — semua protected
	teams := api.Group("/teams", auth.Protected())
	teams.Get("/",                          teamHandler.List)
	teams.Post("/",                         teamHandler.Create)
	teams.Get("/:slug",                     teamHandler.Get)
	teams.Post("/:slug/members",            teamHandler.AddMember)
	teams.Delete("/:slug/members/:userID",  teamHandler.RemoveMember)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("JARVIS API running on :%s", port)
	log.Fatal(app.Listen(":" + port))
}

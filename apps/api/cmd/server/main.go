package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/imammaulanaa/jarvis/api/internal/database"
)

func main() {
	// Connect database
	db, err := database.New()
	if err != nil {
		log.Fatalf("Database error: %v", err)
	}
	defer db.Close()
	dsn := os.Getenv("DATABASE_URL")
	if err := database.RunMigrations(dsn); err != nil {
		log.Fatalf("Migration error: %v", err)
	}
	app := fiber.New(fiber.Config{
		AppName: "JARVIS API",
	})

	app.Use(logger.New())
	app.Use(cors.New())

	// Health check: cek DB sekaligus
	app.Get("/health", func(c *fiber.Ctx) error {
		if err := db.Ping(); err != nil {
			return c.Status(503).JSON(fiber.Map{
				"status": "degraded",
				"db":     "unreachable",
			})
		}
		return c.JSON(fiber.Map{
			"status": "ok",
			"db":     "connected",
			"app":    "JARVIS",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("JARVIS API running on :%s", port)
	log.Fatal(app.Listen(":" + port))
}
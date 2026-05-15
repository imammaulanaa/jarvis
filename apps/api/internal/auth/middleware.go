package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

const ContextKeyUser = "user"

// Protected — middleware untuk route yang butuh login
func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{
				"error": "missing Authorization header",
			})
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(401).JSON(fiber.Map{
				"error": "invalid Authorization format, use: Bearer ",
			})
		}

		claims, err := ValidateToken(parts[1])
		if err != nil {
			return c.Status(401).JSON(fiber.Map{
				"error": "invalid or expired token",
			})
		}

		// Inject claims ke context — bisa diambil di handler
		c.Locals(ContextKeyUser, claims)
		return c.Next()
	}
}

// AdminOnly — hanya user dengan role admin
func AdminOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {
		claims, ok := c.Locals(ContextKeyUser).(*Claims)
		if !ok || claims.Role != "admin" {
			return c.Status(403).JSON(fiber.Map{
				"error": "admin access required",
			})
		}
		return c.Next()
	}
}

// GetUser — helper untuk ambil claims dari context di handler
func GetUser(c *fiber.Ctx) *Claims {
	claims, _ := c.Locals(ContextKeyUser).(*Claims)
	return claims
}

package handler

import (
	"context"

	"github.com/gofiber/fiber/v2"
	gogithub "github.com/google/go-github/v60/github"
	"golang.org/x/oauth2"

	"github.com/imammaulanaa/jarvis/api/internal/auth"
	"github.com/imammaulanaa/jarvis/api/internal/repository"
)

type AuthHandler struct {
	userRepo *repository.UserRepository
}

func NewAuthHandler(userRepo *repository.UserRepository) *AuthHandler {
	return &AuthHandler{userRepo: userRepo}
}

type githubLoginRequest struct {
	AccessToken string `json:"access_token" validate:"required"`
}

// POST /api/auth/github
func (h *AuthHandler) GithubLogin(c *fiber.Ctx) error {
	var req githubLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}
	if req.AccessToken == "" {
		return c.Status(400).JSON(fiber.Map{"error": "access_token required"})
	}

	// Verify token ke GitHub API — ambil user info
	ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: req.AccessToken})
	tc := oauth2.NewClient(context.Background(), ts)
	ghClient := gogithub.NewClient(tc)

	ghUser, _, err := ghClient.Users.Get(context.Background(), "")
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "invalid GitHub token"})
	}

	// Ambil email primary (bisa kosong kalau private di GitHub settings)
	email := ""
	if ghUser.Email != nil {
		email = *ghUser.Email
	}
	if email == "" {
		// Fallback: pakai noreply GitHub email
		email = ghUser.GetLogin() + "@users.noreply.github.com"
	}

	name := ghUser.GetName()
	if name == "" {
		name = ghUser.GetLogin()
	}

	// Upsert user ke database
	user, err := h.userRepo.UpsertFromGitHub(
		c.Context(),
		ghUser.GetID(),
		ghUser.GetLogin(),
		email,
		name,
		ghUser.GetAvatarURL(),
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to save user"})
	}

	// Generate JWT
	token, err := auth.GenerateToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to generate token"})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id":         user.ID,
			"username":   user.Username,
			"name":       user.Name,
			"avatar_url": user.AvatarURL,
			"role":       user.Role,
		},
	})
}

// GET /api/auth/me — siapa yang sedang login
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	claims := auth.GetUser(c)
	return c.JSON(fiber.Map{
		"user_id":  claims.UserID,
		"username": claims.Username,
		"role":     claims.Role,
	})
}

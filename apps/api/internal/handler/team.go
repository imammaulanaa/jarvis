package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/imammaulanaa/jarvis/api/internal/auth"
	"github.com/imammaulanaa/jarvis/api/internal/repository"
)

type TeamHandler struct {
	teamRepo  *repository.TeamRepository
	auditRepo *repository.AuditRepository
}

func NewTeamHandler(teamRepo *repository.TeamRepository, auditRepo *repository.AuditRepository) *TeamHandler {
	return &TeamHandler{teamRepo: teamRepo, auditRepo: auditRepo}
}

// GET /api/teams
func (h *TeamHandler) List(c *fiber.Ctx) error {
	teams, err := h.teamRepo.List(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch teams"})
	}
	return c.JSON(fiber.Map{"data": teams, "total": len(teams)})
}

// GET /api/teams/:slug
func (h *TeamHandler) Get(c *fiber.Ctx) error {
	team, err := h.teamRepo.GetBySlug(c.Context(), c.Params("slug"))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "team not found"})
	}

	members, err := h.teamRepo.GetMembers(c.Context(), team.ID)
	if err != nil {
		members = nil
	}

	services, err := h.teamRepo.GetServices(c.Context(), team.ID)
	if err != nil {
		services = nil
	}

	return c.JSON(fiber.Map{
		"team":     team,
		"members":  members,
		"services": services,
	})
}

// POST /api/teams
func (h *TeamHandler) Create(c *fiber.Ctx) error {
	var body struct {
		Slug        string `json:"slug"`
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}
	if body.Slug == "" || body.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "slug and name are required"})
	}

	team, err := h.teamRepo.Create(c.Context(), body.Slug, body.Name, body.Description)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create team", "detail": err.Error()})
	}

	claims := auth.GetUser(c)
	_ = h.auditRepo.Log(c.Context(), &claims.UserID,
		"team.created", "team", &team.ID,
		fiber.Map{"slug": team.Slug},
	)

	return c.Status(201).JSON(team)
}

// POST /api/teams/:slug/members
func (h *TeamHandler) AddMember(c *fiber.Ctx) error {
	team, err := h.teamRepo.GetBySlug(c.Context(), c.Params("slug"))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "team not found"})
	}

	var body struct {
		UserID string `json:"user_id"`
		Role   string `json:"role"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}

	userID, err := uuid.Parse(body.UserID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid user_id"})
	}

	role := body.Role
	if role == "" {
		role = "member"
	}

	if err := h.teamRepo.AddMember(c.Context(), team.ID, userID, role); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to add member", "detail": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "member added"})
}

// DELETE /api/teams/:slug/members/:userID
func (h *TeamHandler) RemoveMember(c *fiber.Ctx) error {
	team, err := h.teamRepo.GetBySlug(c.Context(), c.Params("slug"))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "team not found"})
	}

	userID, err := uuid.Parse(c.Params("userID"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid user_id"})
	}

	if err := h.teamRepo.RemoveMember(c.Context(), team.ID, userID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to remove member"})
	}

	return c.JSON(fiber.Map{"message": "member removed"})
}
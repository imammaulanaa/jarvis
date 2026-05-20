package handler

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/imammaulanaa/jarvis/api/internal/auth"
	"github.com/imammaulanaa/jarvis/api/internal/model"
	"github.com/imammaulanaa/jarvis/api/internal/repository"
)

type ServiceHandler struct {
	serviceRepo *repository.ServiceRepository
	auditRepo   *repository.AuditRepository
}

func NewServiceHandler(
	serviceRepo *repository.ServiceRepository,
	auditRepo   *repository.AuditRepository,
) *ServiceHandler {
	return &ServiceHandler{serviceRepo: serviceRepo, auditRepo: auditRepo}
}

// GET /api/services
func (h *ServiceHandler) List(c *fiber.Ctx) error {
	filter := repository.ListServicesFilter{
		Search:    c.Query("search"),
		Status:    c.Query("status"),
		Lifecycle: c.Query("lifecycle", "active"),
		Tier:      c.Query("tier"),
		Language:  c.Query("language"),
		Limit:     c.QueryInt("limit", 20),
		Offset:    c.QueryInt("offset", 0),
	}

	if tags := c.Query("tags"); tags != "" {
		filter.Tags = strings.Split(tags, ",")
	}

	services, total, err := h.serviceRepo.List(c.Context(), filter)
	if err != nil {
		c.Context().Logger().Printf("List services error: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error":  "failed to fetch services",
			"detail": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"data":   services,
		"total":  total,
		"limit":  filter.Limit,
		"offset": filter.Offset,
	})
}

// GET /api/services/:slug
func (h *ServiceHandler) Get(c *fiber.Ctx) error {
	slug := c.Params("slug")
	svc, err := h.serviceRepo.GetBySlug(c.Context(), slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "service not found"})
	}
	return c.JSON(svc)
}

// POST /api/services
func (h *ServiceHandler) Create(c *fiber.Ctx) error {
	var input model.CreateServiceInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}
	if input.Slug == "" || input.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "slug and name are required"})
	}

	claims := auth.GetUser(c)
	svc, err := h.serviceRepo.Create(c.Context(), input, claims.UserID)
	if err != nil {
		c.Context().Logger().Printf("Create service error: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error":  "failed to create service",
			"detail": err.Error(),
		})
	}

	_ = h.auditRepo.Log(c.Context(), &claims.UserID,
		model.ActionServiceCreated, "service", &svc.ID,
		fiber.Map{"slug": svc.Slug, "name": svc.Name},
	)

	return c.Status(201).JSON(svc)
}

// PUT /api/services/:slug
func (h *ServiceHandler) Update(c *fiber.Ctx) error {
	slug := c.Params("slug")

	var input model.CreateServiceInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}

	svc, err := h.serviceRepo.Update(c.Context(), slug, input)
	if err != nil {
		c.Context().Logger().Printf("Update service error: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error":  "failed to update service",
			"detail": err.Error(),
		})
	}

	claims := auth.GetUser(c)
	_ = h.auditRepo.Log(c.Context(), &claims.UserID,
		model.ActionServiceUpdated, "service", &svc.ID,
		fiber.Map{"slug": svc.Slug},
	)

	return c.JSON(svc)
}

// DELETE /api/services/:slug
func (h *ServiceHandler) Delete(c *fiber.Ctx) error {
	slug := c.Params("slug")

	svc, err := h.serviceRepo.GetBySlug(c.Context(), slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "service not found"})
	}

	if err := h.serviceRepo.Delete(c.Context(), slug); err != nil {
		c.Context().Logger().Printf("Delete service error: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error":  "failed to delete service",
			"detail": err.Error(),
		})
	}

	claims := auth.GetUser(c)
	svcID := svc.ID
	_ = h.auditRepo.Log(c.Context(), &claims.UserID,
		model.ActionServiceDeleted, "service", &svcID,
		fiber.Map{"slug": slug},
	)

	return c.JSON(fiber.Map{"message": "service archived successfully"})
}

// parseUUID — helper parse UUID dari string
func parseUUID(s string) *uuid.UUID {
	if s == "" {
		return nil
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return nil
	}
	return &id
}
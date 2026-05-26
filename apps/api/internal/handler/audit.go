package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/imammaulanaa/jarvis/api/internal/repository"
)

type AuditHandler struct {
	auditRepo   *repository.AuditRepository
	serviceRepo *repository.ServiceRepository
}

func NewAuditHandler(
	auditRepo   *repository.AuditRepository,
	serviceRepo *repository.ServiceRepository,
) *AuditHandler {
	return &AuditHandler{auditRepo: auditRepo, serviceRepo: serviceRepo}
}

// GET /api/services/:slug/audit-logs
func (h *AuditHandler) ListByService(c *fiber.Ctx) error {
	slug := c.Params("slug")

	// Ambil service ID dari slug
	svc, err := h.serviceRepo.GetBySlug(c.Context(), slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "service not found"})
	}

	limit := c.QueryInt("limit", 20)
	entries, err := h.auditRepo.ListByResource(
		c.Context(), "service", svc.ID.String(), limit,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch audit logs"})
	}

	return c.JSON(fiber.Map{
		"data":  entries,
		"total": len(entries),
	})
}

// GET /api/audit-logs
func (h *AuditHandler) ListGlobal(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	entries, err := h.auditRepo.ListGlobal(c.Context(), limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch audit logs"})
	}

	return c.JSON(fiber.Map{
		"data":  entries,
		"total": len(entries),
	})
}
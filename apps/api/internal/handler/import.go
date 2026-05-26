package handler

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"gopkg.in/yaml.v3"

	"github.com/imammaulanaa/jarvis/api/internal/auth"
	"github.com/imammaulanaa/jarvis/api/internal/model"
	"github.com/imammaulanaa/jarvis/api/internal/repository"
)

// CatalogInfo — struktur catalog-info.yaml
type CatalogInfo struct {
	APIVersion string          `yaml:"apiVersion"`
	Kind       string          `yaml:"kind"`
	Metadata   CatalogMetadata `yaml:"metadata"`
	Spec       CatalogSpec     `yaml:"spec"`
}

type CatalogMetadata struct {
	Name string `yaml:"name"`
	Slug string `yaml:"slug"`
}

type CatalogSpec struct {
	Description  string       `yaml:"description"`
	Language     string       `yaml:"language"`
	Tier         string       `yaml:"tier"`
	Lifecycle    string       `yaml:"lifecycle"`
	RepoURL      string       `yaml:"repo_url"`
	DocsURL      string       `yaml:"docs_url"`
	DashboardURL string       `yaml:"dashboard_url"`
	OncallURL    string       `yaml:"oncall_url"`
	Owner        CatalogOwner `yaml:"owner"`
	Tags         []string     `yaml:"tags"`
}

type CatalogOwner struct {
	Team string `yaml:"team"`
}

type ImportHandler struct {
	serviceRepo *repository.ServiceRepository
	teamRepo    *repository.TeamRepository
	auditRepo   *repository.AuditRepository
}

func NewImportHandler(
	serviceRepo *repository.ServiceRepository,
	teamRepo    *repository.TeamRepository,
	auditRepo   *repository.AuditRepository,
) *ImportHandler {
	return &ImportHandler{
		serviceRepo: serviceRepo,
		teamRepo:    teamRepo,
		auditRepo:   auditRepo,
	}
}

// POST /api/services/import
// Body: { "yaml": "" }
func (h *ImportHandler) ImportYAML(c *fiber.Ctx) error {
	var body struct {
		YAML string `json:"yaml"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}
	if strings.TrimSpace(body.YAML) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "yaml content is required"})
	}

	// Parse YAML
	var info CatalogInfo
	if err := yaml.Unmarshal([]byte(body.YAML), &info); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":  "invalid YAML format",
			"detail": err.Error(),
		})
	}

	// Validasi
	if info.Metadata.Slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "metadata.slug is required"})
	}
	if info.Metadata.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "metadata.name is required"})
	}
	if info.Kind != "Service" {
		return c.Status(400).JSON(fiber.Map{"error": "kind must be 'Service'"})
	}

	// Set defaults
	tier := model.ServiceTier(info.Spec.Tier)
	if tier == "" {
		tier = model.TierThree
	}

	// Cek apakah service sudah ada (update) atau buat baru (create)
	existing, _ := h.serviceRepo.GetBySlug(c.Context(), info.Metadata.Slug)
	claims      := auth.GetUser(c)

	optStr := func(s string) *string {
		if s == "" {
			return nil
		}
		return &s
	}

	input := model.CreateServiceInput{
		Slug:        info.Metadata.Slug,
		Name:        info.Metadata.Name,
		Description: optStr(info.Spec.Description),
		Language:    optStr(info.Spec.Language),
		Tier:        tier,
		RepoURL:     optStr(info.Spec.RepoURL),
		DocsURL:     optStr(info.Spec.DocsURL),
		Tags:        info.Spec.Tags,
	}

	var svc *model.Service
	var err error
	var action string

	if existing != nil {
		// Update existing
		svc, err = h.serviceRepo.Update(c.Context(), info.Metadata.Slug, input)
		action = model.ActionServiceUpdated
	} else {
		// Create new
		svc, err = h.serviceRepo.Create(c.Context(), input, claims.UserID)
		action = model.ActionServiceCreated
	}

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":  "failed to import service",
			"detail": err.Error(),
		})
	}

	// Audit log
	_ = h.auditRepo.Log(c.Context(), &claims.UserID, action, "service", &svc.ID,
		fiber.Map{"slug": svc.Slug, "source": "yaml_import"},
	)

	status := "created"
	if existing != nil {
		status = "updated"
	}

	return c.Status(201).JSON(fiber.Map{
		"status":  status,
		"service": svc,
		"message": "Service " + status + " successfully from catalog-info.yaml",
	})
}
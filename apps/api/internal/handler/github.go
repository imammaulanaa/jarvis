package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/imammaulanaa/jarvis/api/internal/auth"
	ghclient "github.com/imammaulanaa/jarvis/api/internal/github"
	"github.com/imammaulanaa/jarvis/api/internal/repository"
)

type GitHubHandler struct {
	serviceRepo *repository.ServiceRepository
	auditRepo   *repository.AuditRepository
	gh          *ghclient.Client
}

func NewGitHubHandler(
	serviceRepo *repository.ServiceRepository,
	auditRepo   *repository.AuditRepository,
) *GitHubHandler {
	return &GitHubHandler{
		serviceRepo: serviceRepo,
		auditRepo:   auditRepo,
		gh:          ghclient.New(),
	}
}

// POST /api/services/:slug/sync-github
func (h *GitHubHandler) SyncRepo(c *fiber.Ctx) error {
	slug := c.Params("slug")

	svc, err := h.serviceRepo.GetBySlug(c.Context(), slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "service not found"})
	}

	repoURL := ""
	if svc.RepoURL != nil {
		repoURL = *svc.RepoURL
	}
	if repoURL == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "service has no repo_url — set it first via Edit",
		})
	}

	owner, repo, err := ghclient.ParseURL(repoURL)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid GitHub repo URL"})
	}

	// Fetch FULL metadata
	meta, err := h.gh.FetchFullMetadata(c.Context(), owner, repo)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{
			"error":  "failed to fetch from GitHub",
			"detail": err.Error(),
		})
	}

	// Simpan ke JSONB metadata
	updated, err := h.serviceRepo.SyncMetadata(
		c.Context(), slug, meta.RepoName, meta.Language, meta,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":  "failed to sync metadata",
			"detail": err.Error(),
		})
	}

	claims := auth.GetUser(c)
	_ = h.auditRepo.Log(c.Context(), &claims.UserID,
		"service.github_synced", "service", &updated.ID,
		fiber.Map{
			"slug":         slug,
			"stars":        meta.Stars,
			"contributors": meta.Contributors,
		},
	)

	return c.JSON(fiber.Map{
		"message":  "GitHub metadata synced successfully",
		"metadata": meta,
		"service":  updated,
	})
}
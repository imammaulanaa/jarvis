package handler

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/imammaulanaa/jarvis/api/internal/auth"
	"github.com/imammaulanaa/jarvis/api/internal/k8s"
	"github.com/imammaulanaa/jarvis/api/internal/repository"
)

type K8sHandler struct {
	client      *k8s.Client
	serviceRepo *repository.ServiceRepository
	auditRepo   *repository.AuditRepository
}

func NewK8sHandler(
	client *k8s.Client,
	serviceRepo *repository.ServiceRepository,
	auditRepo *repository.AuditRepository,
) *K8sHandler {
	return &K8sHandler{
		client:      client,
		serviceRepo: serviceRepo,
		auditRepo:   auditRepo,
	}
}

// GET /api/k8s/health
func (h *K8sHandler) Health(c *fiber.Ctx) error {
	if h.client == nil {
		return c.JSON(fiber.Map{
			"connected": false,
			"error":     "k8s client not configured",
		})
	}
	info := h.client.Health(c.Context())
	return c.JSON(info)
}

// GET /api/k8s/namespaces
func (h *K8sHandler) ListNamespaces(c *fiber.Ctx) error {
	if h.client == nil {
		return c.Status(503).JSON(fiber.Map{"error": "k8s not available"})
	}

	ns, err := h.client.Clientset().
		CoreV1().
		Namespaces().
		List(c.Context(), metav1.ListOptions{})
	if err != nil {
		return c.Status(502).JSON(fiber.Map{
			"error":  "failed to list namespaces",
			"detail": err.Error(),
		})
	}

	type NamespaceInfo struct {
		Name      string `json:"name"`
		Status    string `json:"status"`
		CreatedAt string `json:"created_at"`
	}

	out := make([]NamespaceInfo, 0, len(ns.Items))
	for _, n := range ns.Items {
		out = append(out, NamespaceInfo{
			Name:      n.Name,
			Status:    string(n.Status.Phase),
			CreatedAt: n.CreationTimestamp.Format("2006-01-02T15:04:05Z"),
		})
	}

	return c.JSON(fiber.Map{
		"namespaces": out,
		"total":      len(out),
	})
}

// GET /api/k8s/deployments?namespace=default
func (h *K8sHandler) ListDeployments(c *fiber.Ctx) error {
	if h.client == nil {
		return c.Status(503).JSON(fiber.Map{"error": "k8s not available"})
	}
	ns := c.Query("namespace", "default")
	deps, err := h.client.ListDeployments(c.Context(), ns)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"deployments": deps, "total": len(deps)})
}

// GET /api/services/:slug/deployment
func (h *K8sHandler) GetServiceDeployment(c *fiber.Ctx) error {
	if h.client == nil {
		return c.Status(503).JSON(fiber.Map{"error": "k8s not available"})
	}

	slug := c.Params("slug")
	svc, err := h.serviceRepo.GetBySlug(c.Context(), slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "service not found"})
	}

	var meta struct {
		K8s struct {
			Namespace  string `json:"namespace"`
			Deployment string `json:"deployment"`
		} `json:"k8s"`
	}
	if svc.Metadata != nil {
		data, err := json.Marshal(svc.Metadata)
		if err == nil {
			_ = json.Unmarshal(data, &meta)
		}
	}

	if meta.K8s.Namespace == "" || meta.K8s.Deployment == "" {
		return c.Status(404).JSON(fiber.Map{
			"error":  "service not linked to deployment",
			"hint":   "use POST /api/services/:slug/link-deployment to set",
			"linked": false,
		})
	}

	info, err := h.client.GetDeployment(c.Context(), meta.K8s.Namespace, meta.K8s.Deployment)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(info)
}

func (h *K8sHandler) LinkDeployment(c *fiber.Ctx) error {
	slug := c.Params("slug")

	var body struct {
		Namespace  string `json:"namespace"`
		Deployment string `json:"deployment"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	if body.Namespace == "" || body.Deployment == "" {
		return c.Status(400).JSON(fiber.Map{"error": "namespace and deployment required"})
	}

	updated, err := h.serviceRepo.SetK8sRef(c.Context(), slug, body.Namespace, body.Deployment)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	claims := auth.GetUser(c)
	_ = h.auditRepo.Log(c.Context(), &claims.UserID,
		"service.k8s_linked", "service", &updated.ID,
		fiber.Map{
			"slug":       slug,
			"namespace":  body.Namespace,
			"deployment": body.Deployment,
		},
	)

	return c.JSON(fiber.Map{
		"message": "deployment linked",
		"service": updated,
	})
}

func (h *K8sHandler) GetServicePods(c *fiber.Ctx) error {
	if h.client == nil {
		return c.Status(503).JSON(fiber.Map{"error": "k8s not available"})
	}

	slug := c.Params("slug")
	svc, err := h.serviceRepo.GetBySlug(c.Context(), slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "service not found"})
	}

	var meta struct {
		K8s struct {
			Namespace  string `json:"namespace"`
			Deployment string `json:"deployment"`
		} `json:"k8s"`
	}
	if svc.Metadata != nil {
		_ = json.Unmarshal(svc.Metadata, &meta)
	}

	if meta.K8s.Namespace == "" || meta.K8s.Deployment == "" {
		return c.JSON(fiber.Map{"pods": []interface{}{}, "total": 0, "linked": false})
	}

	pods, err := h.client.ListPodsForDeployment(
		c.Context(), meta.K8s.Namespace, meta.K8s.Deployment,
	)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"pods":   pods,
		"total":  len(pods),
		"linked": true,
	})
}
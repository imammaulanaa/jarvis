package handler

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/imammaulanaa/jarvis/api/internal/repository"
)

type WebhookHandler struct {
	serviceRepo *repository.ServiceRepository
	auditRepo   *repository.AuditRepository
}

func NewWebhookHandler(
	serviceRepo *repository.ServiceRepository,
	auditRepo   *repository.AuditRepository,
) *WebhookHandler {
	return &WebhookHandler{serviceRepo: serviceRepo, auditRepo: auditRepo}
}

func verifySignature(payload []byte, signature, secret string) bool {
	if secret == "" || signature == "" {
		return false
	}
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}

func (h *WebhookHandler) HandleGitHub(c *fiber.Ctx) error {
	payload   := c.Body()
	signature := c.Get("X-Hub-Signature-256")
	event     := c.Get("X-GitHub-Event")
	secret    := os.Getenv("GITHUB_WEBHOOK_SECRET")

	if !verifySignature(payload, signature, secret) {
		return c.Status(401).JSON(fiber.Map{"error": "invalid signature"})
	}

	var base struct {
		Repository struct {
			FullName string `json:"full_name"`
			HTMLURL  string `json:"html_url"`
		} `json:"repository"`
	}
	_ = json.Unmarshal(payload, &base)

	svc, err := h.serviceRepo.GetByRepoURL(c.Context(), base.Repository.HTMLURL)
	if err != nil || svc == nil {
		return c.JSON(fiber.Map{"status": "ignored", "reason": "repo not registered"})
	}

	switch event {
	case "push":
		h.handlePush(c, svc.ID, payload)
	case "pull_request":
		h.handlePullRequest(c, svc.ID, payload)
	case "release":
		h.handleRelease(c, svc.ID, payload)
	case "workflow_run":
		h.handleWorkflowRun(c, svc.ID, payload)
	}

	return c.JSON(fiber.Map{"status": "processed", "event": event})
}

func (h *WebhookHandler) handlePush(c *fiber.Ctx, svcID uuid.UUID, payload []byte) {
	var p struct {
		Ref    string `json:"ref"`
		Pusher struct {
			Name string `json:"name"`
		} `json:"pusher"`
		Commits []struct {
			Message string `json:"message"`
		} `json:"commits"`
	}
	if err := json.Unmarshal(payload, &p); err != nil {
		return
	}

	branch := p.Ref
	if len(branch) > 11 && branch[:11] == "refs/heads/" {
		branch = branch[11:]
	}

	msg := ""
	if len(p.Commits) > 0 {
		msg = p.Commits[0].Message
	}

	_ = h.auditRepo.Log(context.Background(), nil,
		"github.push", "service", &svcID,
		map[string]interface{}{
			"branch":  branch,
			"pusher":  p.Pusher.Name,
			"commits": len(p.Commits),
			"message": msg,
		},
	)
}

func (h *WebhookHandler) handlePullRequest(c *fiber.Ctx, svcID uuid.UUID, payload []byte) {
	var p struct {
		Action      string `json:"action"`
		PullRequest struct {
			Number int    `json:"number"`
			Title  string `json:"title"`
			User   struct {
				Login string `json:"login"`
			} `json:"user"`
		} `json:"pull_request"`
	}
	if err := json.Unmarshal(payload, &p); err != nil {
		return
	}

	_ = h.auditRepo.Log(context.Background(), nil,
		"github.pull_request."+p.Action, "service", &svcID,
		map[string]interface{}{
			"number": p.PullRequest.Number,
			"title":  p.PullRequest.Title,
			"author": p.PullRequest.User.Login,
			"action": p.Action,
		},
	)
}

func (h *WebhookHandler) handleRelease(c *fiber.Ctx, svcID uuid.UUID, payload []byte) {
	var p struct {
		Action  string `json:"action"`
		Release struct {
			TagName string `json:"tag_name"`
			Name    string `json:"name"`
		} `json:"release"`
	}
	if err := json.Unmarshal(payload, &p); err != nil {
		return
	}

	if p.Action != "published" {
		return
	}

	_ = h.auditRepo.Log(context.Background(), nil,
		"github.release.published", "service", &svcID,
		map[string]interface{}{
			"tag":  p.Release.TagName,
			"name": p.Release.Name,
		},
	)
}

func (h *WebhookHandler) handleWorkflowRun(c *fiber.Ctx, svcID uuid.UUID, payload []byte) {
	var p struct {
		Action      string `json:"action"`
		WorkflowRun struct {
			Name       string `json:"name"`
			Status     string `json:"status"`
			Conclusion string `json:"conclusion"`
			HeadBranch string `json:"head_branch"`
		} `json:"workflow_run"`
	}
	if err := json.Unmarshal(payload, &p); err != nil {
		return
	}

	if p.Action != "completed" {
		return
	}

	_ = h.auditRepo.Log(context.Background(), nil,
		"github.ci."+p.WorkflowRun.Conclusion, "service", &svcID,
		map[string]interface{}{
			"workflow":   p.WorkflowRun.Name,
			"conclusion": p.WorkflowRun.Conclusion,
			"branch":     p.WorkflowRun.HeadBranch,
		},
	)
}
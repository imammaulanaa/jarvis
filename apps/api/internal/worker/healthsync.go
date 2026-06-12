package worker

import (
	"context"
	"log"
	"time"

	"github.com/imammaulanaa/jarvis/api/internal/k8s"
	"github.com/imammaulanaa/jarvis/api/internal/repository"
)

type HealthSync struct {
	k8sClient   *k8s.Client
	serviceRepo *repository.ServiceRepository
	auditRepo   *repository.AuditRepository
	interval    time.Duration
}

func NewHealthSync(
	k8sClient *k8s.Client,
	serviceRepo *repository.ServiceRepository,
	auditRepo *repository.AuditRepository,
) *HealthSync {
	return &HealthSync{
		k8sClient:   k8sClient,
		serviceRepo: serviceRepo,
		auditRepo:   auditRepo,
		interval:    60 * time.Second,
	}
}

func (w *HealthSync) Start(ctx context.Context) {
	if w.k8sClient == nil {
		log.Println("[healthsync] k8s client nil — worker disabled")
		return
	}

	go func() {
		w.syncAll(ctx)

		ticker := time.NewTicker(w.interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				log.Println("[healthsync] worker stopped")
				return
			case <-ticker.C:
				w.syncAll(ctx)
			}
		}
	}()

	log.Printf("[healthsync] worker started (interval %s)", w.interval)
}

// SyncAll — exported untuk manual trigger via endpoint
func (w *HealthSync) SyncAll(ctx context.Context) (int, int) {
	return w.syncAll(ctx)
}

// syncAll — cek semua linked services. Return (checked, changed).
func (w *HealthSync) syncAll(ctx context.Context) (int, int) {
	services, err := w.serviceRepo.ListWithK8sRef(ctx)
	if err != nil {
		log.Printf("[healthsync] list services error: %v", err)
		return 0, 0
	}

	changed := 0
	for _, svc := range services {
		newStatus := w.computeStatus(ctx, svc.Namespace, svc.Deployment)

		if newStatus == svc.Status {
			continue 
		}

		_, err := w.serviceRepo.UpdateStatus(ctx, svc.Slug, newStatus)
		if err != nil {
			log.Printf("[healthsync] update %s error: %v", svc.Slug, err)
			continue
		}

		_ = w.auditRepo.Log(ctx, nil,
			"service.status_updated", "service", &svc.ID,
			map[string]interface{}{
				"slug":   svc.Slug,
				"from":   svc.Status,
				"to":     newStatus,
				"source": "k8s_auto_sync",
			},
		)

		log.Printf("[healthsync] %s: %s → %s", svc.Slug, svc.Status, newStatus)
		changed++
	}

	if changed > 0 {
		log.Printf("[healthsync] checked %d services, %d status changed", len(services), changed)
	}
	return len(services), changed
}

func (w *HealthSync) computeStatus(ctx context.Context, namespace, deployment string) string {
	info, err := w.k8sClient.GetDeployment(ctx, namespace, deployment)
	if err != nil {
		return "down" 
	}

	if info.DesiredReplicas == 0 {
		return "down" 
	}
	if info.ReadyReplicas == 0 {
		return "down"
	}
	if info.ReadyReplicas < info.DesiredReplicas {
		return "degraded"
	}
	return "healthy"
}
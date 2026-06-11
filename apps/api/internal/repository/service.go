package repository

import (
	"context"
	"encoding/json"  
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"

	"github.com/imammaulanaa/jarvis/api/internal/model"
)

type ServiceRepository struct {
	db *sqlx.DB
}

func NewServiceRepository(db *sqlx.DB) *ServiceRepository {
	return &ServiceRepository{db: db}
}

type ListServicesFilter struct {
	Search    string
	TeamID    *uuid.UUID
	Status    string
	Lifecycle string
	Tier      string
	Language  string  
	Tags      []string
	Limit     int
	Offset    int
}

func (r *ServiceRepository) List(ctx context.Context, f ListServicesFilter) ([]model.Service, int, error) {
	if f.Limit == 0 {
		f.Limit = 20
	}

	where := []string{"lifecycle != 'archived'"}
	args  := []interface{}{}
	idx   := 1

	if f.Search != "" {
		where = append(where, fmt.Sprintf(
			"(name ILIKE $%d OR slug ILIKE $%d OR description ILIKE $%d)",
			idx, idx+1, idx+2,
		))
		q := "%" + f.Search + "%"
		args = append(args, q, q, q)
		idx += 3
	}
	if f.Status != "" {
		where = append(where, fmt.Sprintf("status = $%d", idx))
		args = append(args, f.Status)
		idx++
	}
	if f.Lifecycle != "" {
		where = append(where, fmt.Sprintf("lifecycle = $%d", idx))
		args = append(args, f.Lifecycle)
		idx++
	}
	if f.Tier != "" {
		where = append(where, fmt.Sprintf("tier = $%d", idx))
		args = append(args, f.Tier)
		idx++
	}
	if f.Language != "" {
    where = append(where, fmt.Sprintf("language = $%d", idx))
    args = append(args, f.Language)
    idx++
}
	if f.TeamID != nil {
		where = append(where, fmt.Sprintf("team_id = $%d", idx))
		args = append(args, f.TeamID)
		idx++
	}
	if len(f.Tags) > 0 {
		where = append(where, fmt.Sprintf("tags @> $%d", idx))
		args = append(args, pq.Array(f.Tags))
		idx++
	}

	whereSQL := "WHERE " + strings.Join(where, " AND ")

	var total int
	countSQL := "SELECT COUNT(*) FROM services " + whereSQL
	if err := r.db.GetContext(ctx, &total, countSQL, args...); err != nil {
		return nil, 0, fmt.Errorf("count services: %w", err)
	}

	args = append(args, f.Limit, f.Offset)
	query := fmt.Sprintf(
		"SELECT * FROM services %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d",
		whereSQL, idx, idx+1,
	)

	var services []model.Service
	if err := r.db.SelectContext(ctx, &services, query, args...); err != nil {
		return nil, 0, fmt.Errorf("list services: %w", err)
	}

	return services, total, nil
}

func (r *ServiceRepository) GetBySlug(ctx context.Context, slug string) (*model.Service, error) {
	var s model.Service
	err := r.db.GetContext(ctx, &s, "SELECT * FROM services WHERE slug = $1", slug)
	if err != nil {
		return nil, fmt.Errorf("get service by slug: %w", err)
	}
	return &s, nil
}

func (r *ServiceRepository) Create(ctx context.Context, in model.CreateServiceInput, createdBy uuid.UUID) (*model.Service, error) {
	query := `
		INSERT INTO services
			(slug, name, description, team_id, created_by, repo_url, language, tier, docs_url, tags)
		VALUES
			($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING *
	`

	tier := in.Tier
	if tier == "" {
		tier = model.TierThree
	}

	var s model.Service
	err := r.db.GetContext(ctx, &s, query,
		in.Slug, in.Name, in.Description, in.TeamID, createdBy,
		in.RepoURL, in.Language, tier, in.DocsURL,
		pq.Array(in.Tags),
	)
	if err != nil {
		return nil, fmt.Errorf("create service: %w", err)
	}
	return &s, nil
}

func (r *ServiceRepository) Update(ctx context.Context, slug string, in model.CreateServiceInput) (*model.Service, error) {
	query := `
		UPDATE services SET
			name        = $2,
			description = $3,
			team_id     = $4,
			repo_url    = $5,
			language    = $6,
			tier        = $7,
			docs_url    = $8,
			tags        = $9,
			updated_at  = NOW()
		WHERE slug = $1
		RETURNING *
	`

	var s model.Service
	err := r.db.GetContext(ctx, &s, query,
		slug, in.Name, in.Description, in.TeamID,
		in.RepoURL, in.Language, in.Tier, in.DocsURL,
		pq.Array(in.Tags),
	)
	if err != nil {
		return nil, fmt.Errorf("update service: %w", err)
	}
	return &s, nil
}

func (r *ServiceRepository) UpdateStatus(ctx context.Context, slug, status string) (*model.Service, error) {
	var s model.Service
	err := r.db.GetContext(ctx, &s, `
		UPDATE services SET
			status            = $2,
			status_checked_at = NOW(),
			updated_at        = NOW()
		WHERE slug = $1
		RETURNING *
	`, slug, status)
	if err != nil {
		return nil, fmt.Errorf("update service status: %w", err)
	}
	return &s, nil
}

func (r *ServiceRepository) Delete(ctx context.Context, slug string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE services SET lifecycle = 'archived', updated_at = NOW() WHERE slug = $1", slug,
	)
	if err != nil {
		return fmt.Errorf("delete service: %w", err)
	}
	return nil
}

func (r *ServiceRepository) SyncFromGitHub(
	ctx context.Context,
	slug, repoName, language string,
) (*model.Service, error) {
	var s model.Service

	query := `
		UPDATE services SET
			repo_name  = CASE WHEN $2 != '' THEN $2 ELSE repo_name END,
			language   = CASE WHEN $3 != '' THEN $3 ELSE language  END,
			updated_at = NOW()
		WHERE slug = $1
		RETURNING *
	`

	err := r.db.GetContext(ctx, &s, query, slug, repoName, language)
	if err != nil {
		return nil, fmt.Errorf("sync github metadata: %w", err)
	}
	return &s, nil
}

func (r *ServiceRepository) SyncMetadata(
	ctx context.Context,
	slug, repoName, language string,
	githubMeta interface{},
) (*model.Service, error) {
	metaJSON, err := json.Marshal(map[string]interface{}{
		"github": githubMeta,
	})
	if err != nil {
		return nil, fmt.Errorf("marshal metadata: %w", err)
	}

	var s model.Service
	query := `
		UPDATE services SET
			repo_name  = CASE WHEN $2 != '' THEN $2 ELSE repo_name END,
			language   = CASE WHEN $3 != '' THEN $3 ELSE language  END,
			metadata   = COALESCE(metadata, '{}'::jsonb) || $4::jsonb,
			updated_at = NOW()
		WHERE slug = $1
		RETURNING *
	`
	err = r.db.GetContext(ctx, &s, query, slug, repoName, language, metaJSON)
	if err != nil {
		return nil, fmt.Errorf("sync metadata: %w", err)
	}
	return &s, nil
}

func (r *ServiceRepository) GetByRepoURL(ctx context.Context, repoURL string) (*model.Service, error) {
	if repoURL == "" {
		return nil, fmt.Errorf("empty repo url")
	}
	var s model.Service
	err := r.db.GetContext(ctx, &s,
		"SELECT * FROM services WHERE repo_url = $1 LIMIT 1", repoURL,
	)
	if err != nil {
		return nil, fmt.Errorf("get service by repo url: %w", err)
	}
	return &s, nil
}

func (r *ServiceRepository) SetK8sRef(
	ctx context.Context,
	slug, namespace, deployment string,
) (*model.Service, error) {
	k8sRef := map[string]string{
		"namespace":  namespace,
		"deployment": deployment,
	}
	metaJSON, err := json.Marshal(map[string]interface{}{
		"k8s": k8sRef,
	})
	if err != nil {
		return nil, fmt.Errorf("marshal k8s ref: %w", err)
	}

	var s model.Service
	err = r.db.GetContext(ctx, &s, `
		UPDATE services SET
			metadata   = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
			updated_at = NOW()
		WHERE slug = $1
		RETURNING *
	`, slug, metaJSON)
	if err != nil {
		return nil, fmt.Errorf("set k8s ref: %w", err)
	}
	return &s, nil
}

type K8sLinkedService struct {
	ID         uuid.UUID `db:"id"`
	Slug       string    `db:"slug"`
	Status     string    `db:"status"`
	Namespace  string    `db:"namespace"`
	Deployment string    `db:"deployment"`
}

func (r *ServiceRepository) ListWithK8sRef(ctx context.Context) ([]K8sLinkedService, error) {
	var out []K8sLinkedService
	err := r.db.SelectContext(ctx, &out, `
		SELECT
			id, slug, status,
			metadata->'k8s'->>'namespace'  AS namespace,
			metadata->'k8s'->>'deployment' AS deployment
		FROM services
		WHERE jsonb_exists(metadata, 'k8s')
		  AND metadata->'k8s'->>'namespace'  IS NOT NULL
		  AND metadata->'k8s'->>'deployment' IS NOT NULL
		  AND lifecycle != 'archived'
	`)
	if err != nil {
		return nil, fmt.Errorf("list k8s linked services: %w", err)
	}
	return out, nil
}

func (r *ServiceRepository) K8sRefMap(ctx context.Context) (map[string]string, error) {
	linked, err := r.ListWithK8sRef(ctx)
	if err != nil {
		return nil, err
	}
	out := make(map[string]string, len(linked))
	for _, s := range linked {
		out[s.Namespace+"/"+s.Deployment] = s.Slug
	}
	return out, nil
}
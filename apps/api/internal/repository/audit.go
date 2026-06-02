package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type AuditRepository struct {
	db *sqlx.DB
}

type AuditLogEntry struct {
	ID           string     `db:"id"            json:"id"`
	UserID       *string    `db:"user_id"       json:"user_id,omitempty"`
	Username     *string    `db:"username"      json:"username,omitempty"`
	AvatarURL    *string    `db:"avatar_url"    json:"avatar_url,omitempty"`
	Action       string     `db:"action"        json:"action"`
	ResourceType string     `db:"resource_type" json:"resource_type"`
	ResourceID   *string    `db:"resource_id"   json:"resource_id,omitempty"`
	Metadata     []byte     `db:"metadata"      json:"metadata,omitempty"`
	CreatedAt    time.Time  `db:"created_at"    json:"created_at"`
}

func NewAuditRepository(db *sqlx.DB) *AuditRepository {
	return &AuditRepository{db: db}
}

func (r *AuditRepository) Log(
	ctx context.Context,
	userID *uuid.UUID,
	action, resourceType string,
	resourceID *uuid.UUID,
	metadata interface{},
) error {
	var metaJSON []byte
	if metadata != nil {
		var err error
		metaJSON, err = json.Marshal(metadata)
		if err != nil {
			metaJSON = []byte("{}")
		}
	} else {
		metaJSON = []byte("{}")
	}

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
		VALUES ($1, $2, $3, $4, $5)
	`, userID, action, resourceType, resourceID, metaJSON)

	if err != nil {
		return fmt.Errorf("write audit log: %w", err)
	}
	return nil
}

func (r *AuditRepository) ListByResource(
	ctx context.Context,
	resourceType string,
	resourceID string,
	limit int,
) ([]AuditLogEntry, error) {
	if limit == 0 {
		limit = 20
	}
	var entries []AuditLogEntry
	err := r.db.SelectContext(ctx, &entries, `
		SELECT
			al.id, al.action, al.resource_type, al.resource_id,
			al.metadata, al.created_at,
			al.user_id::text,
			u.username, u.avatar_url
		FROM audit_logs al
		LEFT JOIN users u ON u.id = al.user_id
		WHERE al.resource_type = $1 AND al.resource_id::text = $2
		ORDER BY al.created_at DESC
		LIMIT $3
	`, resourceType, resourceID, limit)
	if err != nil {
		return nil, fmt.Errorf("list audit logs by resource: %w", err)
	}
	return entries, nil
}

func (r *AuditRepository) ListGlobal(ctx context.Context, limit int) ([]AuditLogEntry, error) {
	if limit == 0 {
		limit = 50
	}
	var entries []AuditLogEntry
	err := r.db.SelectContext(ctx, &entries, `
		SELECT
			al.id, al.action, al.resource_type, al.resource_id,
			al.metadata, al.created_at,
			al.user_id::text,
			u.username, u.avatar_url
		FROM audit_logs al
		LEFT JOIN users u ON u.id = al.user_id
		ORDER BY al.created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, fmt.Errorf("list global audit logs: %w", err)
	}
	return entries, nil
}
package repository

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type AuditRepository struct {
	db *sqlx.DB
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
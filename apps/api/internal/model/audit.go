package model

import (
	"time"

	"github.com/google/uuid"
)

type AuditLog struct {
	ID           uuid.UUID  `db:"id"            json:"id"`
	UserID       *uuid.UUID `db:"user_id"       json:"user_id,omitempty"`
	Action       string     `db:"action"        json:"action"`
	ResourceType string     `db:"resource_type" json:"resource_type"`
	ResourceID   *uuid.UUID `db:"resource_id"   json:"resource_id,omitempty"`
	Metadata     map[string]interface{} `db:"metadata" json:"metadata,omitempty"`
	IPAddress    *string    `db:"ip_address"    json:"ip_address,omitempty"`
	CreatedAt    time.Time  `db:"created_at"    json:"created_at"`
}

// Action constants — supaya tidak typo di mana-mana
const (
	ActionServiceCreated  = "service.created"
	ActionServiceUpdated  = "service.updated"
	ActionServiceDeleted  = "service.deleted"
	ActionDeployTriggered = "deployment.triggered"
	ActionDeployRolledBack = "deployment.rolled_back"
	ActionTeamMemberAdded = "team.member_added"
	ActionTeamMemberRemoved = "team.member_removed"
)

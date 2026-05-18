package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type ServiceStatus    string
type ServiceLifecycle string
type ServiceTier      string

const (
	StatusHealthy  ServiceStatus = "healthy"
	StatusDegraded ServiceStatus = "degraded"
	StatusDown     ServiceStatus = "down"
	StatusUnknown  ServiceStatus = "unknown"

	LifecycleActive     ServiceLifecycle = "active"
	LifecycleDeprecated ServiceLifecycle = "deprecated"
	LifecycleArchived   ServiceLifecycle = "archived"

	TierOne   ServiceTier = "tier-1"
	TierTwo   ServiceTier = "tier-2"
	TierThree ServiceTier = "tier-3"
)

// JSONB — custom type untuk handle PostgreSQL JSONB
type JSONB map[string]interface{}

func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return "{}", nil
	}
	b, err := json.Marshal(j)
	return string(b), err
}

func (j *JSONB) Scan(src interface{}) error {
	if src == nil {
		*j = JSONB{}
		return nil
	}
	var b []byte
	switch v := src.(type) {
	case []byte:
		b = v
	case string:
		b = []byte(v)
	default:
		return fmt.Errorf("unsupported type: %T", src)
	}
	return json.Unmarshal(b, j)
}

type Service struct {
	ID          uuid.UUID        `db:"id"          json:"id"`
	Slug        string           `db:"slug"         json:"slug"`
	Name        string           `db:"name"         json:"name"`
	Description *string          `db:"description"  json:"description,omitempty"`
	TeamID      *uuid.UUID       `db:"team_id"      json:"team_id,omitempty"`
	CreatedBy   *uuid.UUID       `db:"created_by"   json:"created_by,omitempty"`

	RepoURL  *string `db:"repo_url"   json:"repo_url,omitempty"`
	RepoName *string `db:"repo_name"  json:"repo_name,omitempty"`

	Language  *string          `db:"language"   json:"language,omitempty"`
	Tier      ServiceTier      `db:"tier"        json:"tier"`
	Lifecycle ServiceLifecycle `db:"lifecycle"   json:"lifecycle"`
	Status    ServiceStatus    `db:"status"      json:"status"`

	// ← tambahkan ini
	StatusCheckedAt *time.Time `db:"status_checked_at" json:"status_checked_at,omitempty"`
	
	DashboardURL *string `db:"dashboard_url" json:"dashboard_url,omitempty"`
	DocsURL      *string `db:"docs_url"      json:"docs_url,omitempty"`
	OncallURL    *string `db:"oncall_url"    json:"oncall_url,omitempty"`

	Tags     pq.StringArray `db:"tags"     json:"tags"`
	Metadata JSONB          `db:"metadata" json:"metadata,omitempty"`

	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type CreateServiceInput struct {
	Slug        string      `json:"slug"        validate:"required"`
	Name        string      `json:"name"        validate:"required"`
	Description *string     `json:"description"`
	TeamID      *uuid.UUID  `json:"team_id"`
	Language    *string     `json:"language"`
	Tier        ServiceTier `json:"tier"`
	RepoURL     *string     `json:"repo_url"`
	DocsURL     *string     `json:"docs_url"`
	Tags        []string    `json:"tags"`
}
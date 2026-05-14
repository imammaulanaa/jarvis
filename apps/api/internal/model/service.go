package model

import (
	"time"

	"github.com/google/uuid"
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

	DashboardURL *string `db:"dashboard_url" json:"dashboard_url,omitempty"`
	DocsURL      *string `db:"docs_url"      json:"docs_url,omitempty"`
	OncallURL    *string `db:"oncall_url"    json:"oncall_url,omitempty"`

	Tags     []string               `db:"tags"     json:"tags"`
	Metadata map[string]interface{} `db:"metadata" json:"metadata,omitempty"`

	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

// CreateServiceInput — payload dari API request
type CreateServiceInput struct {
	Slug        string      `json:"slug"        validate:"required,slug"`
	Name        string      `json:"name"        validate:"required,min=2"`
	Description *string     `json:"description"`
	TeamID      *uuid.UUID  `json:"team_id"`
	Language    *string     `json:"language"`
	Tier        ServiceTier `json:"tier"`
	RepoURL     *string     `json:"repo_url"`
	DocsURL     *string     `json:"docs_url"`
	Tags        []string    `json:"tags"`
}

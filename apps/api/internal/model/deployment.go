package model

import (
	"time"

	"github.com/google/uuid"
)

type DeployStatus      string
type DeployEnvironment string

const (
	DeployPending    DeployStatus = "pending"
	DeployRunning    DeployStatus = "running"
	DeploySuccess    DeployStatus = "success"
	DeployFailed     DeployStatus = "failed"
	DeployRolledBack DeployStatus = "rolled_back"
	DeployCancelled  DeployStatus = "cancelled"

	EnvDevelopment DeployEnvironment = "development"
	EnvStaging     DeployEnvironment = "staging"
	EnvProduction  DeployEnvironment = "production"
)

type Deployment struct {
	ID          uuid.UUID         `db:"id"           json:"id"`
	ServiceID   uuid.UUID         `db:"service_id"   json:"service_id"`
	TriggeredBy *uuid.UUID        `db:"triggered_by" json:"triggered_by,omitempty"`

	ImageTag    string            `db:"image_tag"    json:"image_tag"`
	Environment DeployEnvironment `db:"environment"  json:"environment"`
	Status      DeployStatus      `db:"status"       json:"status"`
	StatusMsg   *string           `db:"status_message" json:"status_message,omitempty"`

	StartedAt  *time.Time `db:"started_at"  json:"started_at,omitempty"`
	FinishedAt *time.Time `db:"finished_at" json:"finished_at,omitempty"`

	ExternalID  *string `db:"external_id"  json:"external_id,omitempty"`
	ExternalURL *string `db:"external_url" json:"external_url,omitempty"`

	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

type TriggerDeployInput struct {
	ServiceID   uuid.UUID         `json:"service_id"  validate:"required"`
	ImageTag    string            `json:"image_tag"   validate:"required"`
	Environment DeployEnvironment `json:"environment" validate:"required"`
}

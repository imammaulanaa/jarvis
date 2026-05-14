package model

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	RoleMember UserRole = "member"
	RoleAdmin  UserRole = "admin"
)

type User struct {
	ID        uuid.UUID `db:"id"         json:"id"`
	GithubID  int64     `db:"github_id"  json:"github_id"`
	Username  string    `db:"username"   json:"username"`
	Email     string    `db:"email"      json:"email"`
	Name      *string   `db:"name"       json:"name,omitempty"`
	AvatarURL *string   `db:"avatar_url" json:"avatar_url,omitempty"`
	Role      UserRole  `db:"role"       json:"role"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type Team struct {
	ID          uuid.UUID `db:"id"          json:"id"`
	Slug        string    `db:"slug"         json:"slug"`
	Name        string    `db:"name"         json:"name"`
	Description *string   `db:"description"  json:"description,omitempty"`
	CreatedAt   time.Time `db:"created_at"   json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"   json:"updated_at"`
}

type TeamMember struct {
	TeamID   uuid.UUID `db:"team_id"  json:"team_id"`
	UserID   uuid.UUID `db:"user_id"  json:"user_id"`
	Role     string    `db:"role"     json:"role"`
	JoinedAt time.Time `db:"joined_at" json:"joined_at"`
}

package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	"github.com/imammaulanaa/jarvis/api/internal/model"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

// UpsertFromGitHub — insert atau update user dari data GitHub
func (r *UserRepository) UpsertFromGitHub(ctx context.Context,
	githubID int64, username, email, name, avatarURL string,
) (*model.User, error) {

	query := `
		INSERT INTO users (github_id, username, email, name, avatar_url)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (github_id) DO UPDATE SET
			username   = EXCLUDED.username,
			email      = EXCLUDED.email,
			name       = EXCLUDED.name,
			avatar_url = EXCLUDED.avatar_url,
			updated_at = NOW()
		RETURNING *
	`

	var user model.User
	err := r.db.GetContext(ctx, &user, query,
		githubID, username, email, name, avatarURL,
	)
	if err != nil {
		return nil, fmt.Errorf("upsert user: %w", err)
	}

	return &user, nil
}

// GetByID — ambil user by UUID
func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	var user model.User
	err := r.db.GetContext(ctx, &user,
		"SELECT * FROM users WHERE id = $1", id,
	)
	if err != nil {
		return nil, fmt.Errorf("get user by id: %w", err)
	}
	return &user, nil
}

// GetByGithubID — ambil user by GitHub ID
func (r *UserRepository) GetByGithubID(ctx context.Context, githubID int64) (*model.User, error) {
	var user model.User
	err := r.db.GetContext(ctx, &user,
		"SELECT * FROM users WHERE github_id = $1", githubID,
	)
	if err != nil {
		return nil, fmt.Errorf("get user by github_id: %w", err)
	}
	return &user, nil
}

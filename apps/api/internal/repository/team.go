package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	"github.com/imammaulanaa/jarvis/api/internal/model"
)

type TeamRepository struct {
	db *sqlx.DB
}

func NewTeamRepository(db *sqlx.DB) *TeamRepository {
	return &TeamRepository{db: db}
}

func (r *TeamRepository) List(ctx context.Context) ([]model.Team, error) {
	var teams []model.Team
	err := r.db.SelectContext(ctx, &teams,
		"SELECT * FROM teams ORDER BY name ASC",
	)
	if err != nil {
		return nil, fmt.Errorf("list teams: %w", err)
	}
	return teams, nil
}

func (r *TeamRepository) GetBySlug(ctx context.Context, slug string) (*model.Team, error) {
	var t model.Team
	err := r.db.GetContext(ctx, &t,
		"SELECT * FROM teams WHERE slug = $1", slug,
	)
	if err != nil {
		return nil, fmt.Errorf("get team: %w", err)
	}
	return &t, nil
}

func (r *TeamRepository) Create(ctx context.Context, slug, name, description string) (*model.Team, error) {
	var t model.Team
	err := r.db.GetContext(ctx, &t, `
		INSERT INTO teams (slug, name, description)
		VALUES ($1, $2, $3)
		RETURNING *
	`, slug, name, description)
	if err != nil {
		return nil, fmt.Errorf("create team: %w", err)
	}
	return &t, nil
}

func (r *TeamRepository) GetMembers(ctx context.Context, teamID uuid.UUID) ([]model.User, error) {
	var users []model.User
	err := r.db.SelectContext(ctx, &users, `
		SELECT u.* FROM users u
		JOIN team_members tm ON tm.user_id = u.id
		WHERE tm.team_id = $1
		ORDER BY u.username ASC
	`, teamID)
	if err != nil {
		return nil, fmt.Errorf("get members: %w", err)
	}
	return users, nil
}

func (r *TeamRepository) AddMember(ctx context.Context, teamID, userID uuid.UUID, role string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO team_members (team_id, user_id, role)
		VALUES ($1, $2, $3)
		ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role
	`, teamID, userID, role)
	if err != nil {
		return fmt.Errorf("add member: %w", err)
	}
	return nil
}

func (r *TeamRepository) RemoveMember(ctx context.Context, teamID, userID uuid.UUID) error {
	_, err := r.db.ExecContext(ctx,
		"DELETE FROM team_members WHERE team_id = $1 AND user_id = $2",
		teamID, userID,
	)
	if err != nil {
		return fmt.Errorf("remove member: %w", err)
	}
	return nil
}

func (r *TeamRepository) GetServices(ctx context.Context, teamID uuid.UUID) ([]model.Service, error) {
	var services []model.Service
	err := r.db.SelectContext(ctx, &services,
		"SELECT * FROM services WHERE team_id = $1 AND lifecycle = 'active' ORDER BY name ASC",
		teamID,
	)
	if err != nil {
		return nil, fmt.Errorf("get team services: %w", err)
	}
	return services, nil
}
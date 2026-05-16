package auth_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/imammaulanaa/jarvis/api/internal/auth"
)

func TestGenerateAndValidateToken(t *testing.T) {
	userID   := uuid.New()
	username := "testuser"
	role     := "member"

	token, err := auth.GenerateToken(userID, username, role)
	if err != nil {
		t.Fatalf("GenerateToken() error = %v", err)
	}
	if token == "" {
		t.Fatal("GenerateToken() returned empty token")
	}

	claims, err := auth.ValidateToken(token)
	if err != nil {
		t.Fatalf("ValidateToken() error = %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("UserID = %v, want %v", claims.UserID, userID)
	}
	if claims.Username != username {
		t.Errorf("Username = %v, want %v", claims.Username, username)
	}
	if claims.Role != role {
		t.Errorf("Role = %v, want %v", claims.Role, role)
	}
	if time.Until(claims.ExpiresAt.Time) < 6*24*time.Hour {
		t.Error("Token expiry should be ~7 days")
	}
}

func TestValidateToken_Invalid(t *testing.T) {
	_, err := auth.ValidateToken("invalid.token.here")
	if err == nil {
		t.Fatal("ValidateToken() should return error for invalid token")
	}
}

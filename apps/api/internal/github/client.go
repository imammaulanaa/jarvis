package github

import (
	"context"
	"fmt"
	"os"
	"strings"

	gogithub "github.com/google/go-github/v60/github"
	"golang.org/x/oauth2"
)

type Client struct {
	gh *gogithub.Client
}

func New() *Client {
	pat := os.Getenv("GITHUB_PAT")
	if pat == "" {
		// Unauthenticated — rate limit 60/jam
		return &Client{gh: gogithub.NewClient(nil)}
	}
	ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: pat})
	tc := oauth2.NewClient(context.Background(), ts)
	return &Client{gh: gogithub.NewClient(tc)}
}

type RepoInfo struct {
	Name          string
	FullName      string
	Description   string
	Language      string
	DefaultBranch string
	Stars         int
	Forks         int
	OpenIssues    int
}

// ParseURL — "https://github.com/owner/repo" → owner, repo
func ParseURL(repoURL string) (owner, repo string, err error) {
	repoURL = strings.TrimSuffix(repoURL, ".git")
	parts   := strings.Split(strings.TrimPrefix(repoURL, "https://github.com/"), "/")
	if len(parts) < 2 {
		return "", "", fmt.Errorf("invalid GitHub URL: %s", repoURL)
	}
	return parts[0], parts[1], nil
}

// FetchRepo — ambil info repo dari GitHub API
func (c *Client) FetchRepo(ctx context.Context, owner, repo string) (*RepoInfo, error) {
	r, _, err := c.gh.Repositories.Get(ctx, owner, repo)
	if err != nil {
		return nil, fmt.Errorf("fetch repo %s/%s: %w", owner, repo, err)
	}

	return &RepoInfo{
		Name:          r.GetName(),
		FullName:      r.GetFullName(),
		Description:   r.GetDescription(),
		Language:      r.GetLanguage(),
		DefaultBranch: r.GetDefaultBranch(),
		Stars:         r.GetStargazersCount(),
		Forks:         r.GetForksCount(),
		OpenIssues:    r.GetOpenIssuesCount(),
	}, nil
}
package github

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time" 

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

type FullMetadata struct {
	RepoName        string `json:"repo_name"`
	Description     string `json:"description"`
	Language        string `json:"language"`
	DefaultBranch   string `json:"default_branch"`
	Stars           int    `json:"stars"`
	Forks           int    `json:"forks"`
	OpenIssues      int    `json:"open_issues"`
	Contributors    int    `json:"contributors"`
	LastCommitSHA   string `json:"last_commit_sha"`
	LastCommitMsg   string `json:"last_commit_msg"`
	LastCommitAt    string `json:"last_commit_at"`
	LastCommitBy    string `json:"last_commit_by"`
	SyncedAt        string `json:"synced_at"`
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

func (c *Client) FetchFullMetadata(ctx context.Context, owner, repo string) (*FullMetadata, error) {
	// 1. Repo info
	r, _, err := c.gh.Repositories.Get(ctx, owner, repo)
	if err != nil {
		return nil, fmt.Errorf("fetch repo: %w", err)
	}

	meta := &FullMetadata{
		RepoName:      r.GetName(),
		Description:   r.GetDescription(),
		Language:      r.GetLanguage(),
		DefaultBranch: r.GetDefaultBranch(),
		Stars:         r.GetStargazersCount(),
		Forks:         r.GetForksCount(),
		OpenIssues:    r.GetOpenIssuesCount(),
		SyncedAt:      time.Now().UTC().Format(time.RFC3339),
	}

	// 2. Last commit
	commits, _, err := c.gh.Repositories.ListCommits(ctx, owner, repo,
		&gogithub.CommitsListOptions{
			ListOptions: gogithub.ListOptions{PerPage: 1},
		},
	)
	if err == nil && len(commits) > 0 {
		cm := commits[0]
		meta.LastCommitSHA = cm.GetSHA()
		if len(meta.LastCommitSHA) > 7 {
			meta.LastCommitSHA = meta.LastCommitSHA[:7]
		}
		meta.LastCommitMsg = cm.GetCommit().GetMessage()
		if idx := indexNewline(meta.LastCommitMsg); idx > 0 {
			meta.LastCommitMsg = meta.LastCommitMsg[:idx]
		}
		meta.LastCommitAt = cm.GetCommit().GetAuthor().GetDate().Format(time.RFC3339)
		meta.LastCommitBy = cm.GetCommit().GetAuthor().GetName()
	}

	// 3. Contributors count
	contributors, _, err := c.gh.Repositories.ListContributors(ctx, owner, repo,
		&gogithub.ListContributorsOptions{
			ListOptions: gogithub.ListOptions{PerPage: 100},
		},
	)
	if err == nil {
		meta.Contributors = len(contributors)
	}

	return meta, nil
}

func indexNewline(s string) int {
	for i, c := range s {
		if c == '\n' {
			return i
		}
	}
	return -1
}
package github

import (
	"context"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	gogithub "github.com/google/go-github/v60/github"
	"golang.org/x/oauth2"
)

type RateLimitInfo struct {
	Limit     int       `json:"limit"`
	Remaining int       `json:"remaining"`
	ResetAt   time.Time `json:"reset_at"`
}

type Client struct {
	gh        *gogithub.Client
	cache     *Cache
	mu        sync.RWMutex
	rateLimit RateLimitInfo
}

func New() *Client {
	pat := os.Getenv("GITHUB_PAT")
	var gh *gogithub.Client
	if pat == "" {
		gh = gogithub.NewClient(nil)
	} else {
		ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: pat})
		tc := oauth2.NewClient(context.Background(), ts)
		gh = gogithub.NewClient(tc)
	}
	return &Client{
		gh:    gh,
		cache: NewCache(),
	}
}

func (c *Client) trackRateLimit(resp *gogithub.Response) {
	if resp == nil {
		return
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	c.rateLimit = RateLimitInfo{
		Limit:     resp.Rate.Limit,
		Remaining: resp.Rate.Remaining,
		ResetAt:   resp.Rate.Reset.Time,
	}
}

func (c *Client) GetRateLimit() RateLimitInfo {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.rateLimit
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

type BranchProtection struct {
	Protected            bool     `json:"protected"`
	Branch               string   `json:"branch"`
	RequiredReviews      int      `json:"required_reviews"`
	RequireCodeOwner     bool     `json:"require_code_owner"`
	RequiredStatusChecks []string `json:"required_status_checks"`
	EnforceAdmins        bool     `json:"enforce_admins"`
	AllowForcePush       bool     `json:"allow_force_push"`
}

func ParseURL(repoURL string) (owner, repo string, err error) {
	repoURL = strings.TrimSuffix(repoURL, ".git")
	parts := strings.Split(strings.TrimPrefix(repoURL, "https://github.com/"), "/")
	if len(parts) < 2 {
		return "", "", fmt.Errorf("invalid GitHub URL: %s", repoURL)
	}
	return parts[0], parts[1], nil
}

func (c *Client) FetchRepo(ctx context.Context, owner, repo string) (*RepoInfo, error) {
	cacheKey := "repo:" + owner + "/" + repo

	var cached RepoInfo
	if c.cache.Get(ctx, cacheKey, &cached) {
		return &cached, nil
	}

	r, resp, err := c.gh.Repositories.Get(ctx, owner, repo)
	c.trackRateLimit(resp)
	if err != nil {
		return nil, fmt.Errorf("fetch repo %s/%s: %w", owner, repo, err)
	}

	info := &RepoInfo{
		Name:          r.GetName(),
		FullName:      r.GetFullName(),
		Description:   r.GetDescription(),
		Language:      r.GetLanguage(),
		DefaultBranch: r.GetDefaultBranch(),
		Stars:         r.GetStargazersCount(),
		Forks:         r.GetForksCount(),
		OpenIssues:    r.GetOpenIssuesCount(),
	}

	c.cache.Set(ctx, cacheKey, info)
	return info, nil
}

type FullMetadata struct {
	RepoName      string `json:"repo_name"`
	Description   string `json:"description"`
	Language      string `json:"language"`
	DefaultBranch string `json:"default_branch"`
	Stars         int    `json:"stars"`
	Forks         int    `json:"forks"`
	OpenIssues    int    `json:"open_issues"`
	Contributors  int    `json:"contributors"`
	LastCommitSHA string `json:"last_commit_sha"`
	LastCommitMsg string `json:"last_commit_msg"`
	LastCommitAt  string `json:"last_commit_at"`
	LastCommitBy  string `json:"last_commit_by"`
	SyncedAt      string `json:"synced_at"`
}

func (c *Client) FetchFullMetadata(ctx context.Context, owner, repo string) (*FullMetadata, error) {
	r, resp, err := c.gh.Repositories.Get(ctx, owner, repo)
	c.trackRateLimit(resp)
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

	commits, resp2, err := c.gh.Repositories.ListCommits(ctx, owner, repo,
		&gogithub.CommitsListOptions{
			ListOptions: gogithub.ListOptions{PerPage: 1},
		},
	)
	c.trackRateLimit(resp2)
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

	contributors, resp3, err := c.gh.Repositories.ListContributors(ctx, owner, repo,
		&gogithub.ListContributorsOptions{
			ListOptions: gogithub.ListOptions{PerPage: 100},
		},
	)
	c.trackRateLimit(resp3)
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

func (c *Client) CheckBranchProtection(ctx context.Context, owner, repo string) (*BranchProtection, error) {
	r, resp, err := c.gh.Repositories.Get(ctx, owner, repo)
	c.trackRateLimit(resp)
	if err != nil {
		return nil, fmt.Errorf("fetch repo: %w", err)
	}
	branch := r.GetDefaultBranch()

	result := &BranchProtection{
		Branch:               branch,
		Protected:            false,
		RequiredStatusChecks: []string{}, 
	}

	protection, resp2, err := c.gh.Repositories.GetBranchProtection(ctx, owner, repo, branch)
	c.trackRateLimit(resp2)
	if err != nil {
		return result, nil
	}

	result.Protected = true

	if protection.RequiredPullRequestReviews != nil {
		result.RequiredReviews  = protection.RequiredPullRequestReviews.RequiredApprovingReviewCount
		result.RequireCodeOwner = protection.RequiredPullRequestReviews.RequireCodeOwnerReviews
	}

	if protection.RequiredStatusChecks != nil && protection.RequiredStatusChecks.Checks != nil {
		for _, check := range *protection.RequiredStatusChecks.Checks {
			result.RequiredStatusChecks = append(result.RequiredStatusChecks, check.Context)
		}
	}

	if protection.EnforceAdmins != nil {
		result.EnforceAdmins = protection.EnforceAdmins.Enabled
	}

	if protection.AllowForcePushes != nil {
		result.AllowForcePush = protection.AllowForcePushes.Enabled
	}

	return result, nil
}
const GITHUB_API = "https://api.github.com"
const PAT        = process.env.GITHUB_PAT ?? ""

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u     = new URL(url)
    const parts = u.pathname.split("/").filter(Boolean)
    if (parts.length < 2) return null
    return { owner: parts[0], repo: parts[1] }
  } catch {
    return null
  }
}

async function ghFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(GITHUB_API + path, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(PAT ? { Authorization: "Bearer " + PAT } : {}),
      },
      next: { revalidate: 180 },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

export interface GitHubRepo {
  full_name:         string
  description:       string | null
  stargazers_count:  number
  forks_count:       number
  open_issues_count: number
  default_branch:    string
  language:          string | null
  updated_at:        string
  html_url:          string
}

export interface GitHubPR {
  number:     number
  title:      string
  state:      string
  html_url:   string
  user:       { login: string; avatar_url: string }
  created_at: string
}

export interface GitHubCommit {
  sha:    string
  commit: {
    message: string
    author:  { name: string; date: string }
  }
  html_url: string
  author:   { login: string; avatar_url: string } | null
}

export interface GitHubWorkflowRun {
  id:         number
  name:       string
  status:     string
  conclusion: string | null
  html_url:   string
  updated_at: string
}

export interface GitHubRepoData {
  repo:     GitHubRepo | null
  prs:      GitHubPR[]
  commit:   GitHubCommit | null
  workflow: GitHubWorkflowRun | null
}

export async function fetchRepoData(owner: string, repo: string): Promise<GitHubRepoData> {
  const [repoData, prsData, commitsData, workflowData] = await Promise.all([
    ghFetch<GitHubRepo>(`/repos/${owner}/${repo}`),
    ghFetch<GitHubPR[]>(`/repos/${owner}/${repo}/pulls?state=open&per_page=5`),
    ghFetch<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?per_page=1`),
    ghFetch<{ workflow_runs: GitHubWorkflowRun[] }>(
      `/repos/${owner}/${repo}/actions/runs?per_page=1&status=completed`
    ),
  ])

  return {
    repo:     repoData,
    prs:      prsData   ?? [],
    commit:   commitsData?.[0] ?? null,
    workflow: workflowData?.workflow_runs?.[0] ?? null,
  }
}

export interface GitHubLabel {
  name:  string
  color: string
}

export interface GitHubPRDetail {
  number:      number
  title:       string
  html_url:    string
  draft:       boolean
  state:       string
  created_at:  string
  updated_at:  string
  comments:    number
  user:        { login: string; avatar_url: string }
  labels:      GitHubLabel[]
  requested_reviewers: { login: string; avatar_url: string }[]
}

export async function fetchPullRequests(owner: string, repo: string): Promise<GitHubPRDetail[]> {
  const data = await ghFetch<GitHubPRDetail[]>(
    `/repos/${owner}/${repo}/pulls?state=open&per_page=10&sort=created&direction=desc`
  )
  return data ?? []
}

export interface GitHubWorkflowRunDetail {
  id:             number
  name:           string
  display_title:  string
  status:         string
  conclusion:     string | null
  html_url:       string
  event:          string
  head_branch:    string
  run_number:     number
  created_at:     string
  updated_at:     string
  run_started_at: string
  actor:          { login: string; avatar_url: string }
  head_commit:    { message: string } | null
}

export async function fetchWorkflowRuns(owner: string, repo: string): Promise<GitHubWorkflowRunDetail[]> {
  const data = await ghFetch<{ workflow_runs: GitHubWorkflowRunDetail[] }>(
    `/repos/${owner}/${repo}/actions/runs?per_page=5`
  )
  return data?.workflow_runs ?? []
}

export interface GitHubRelease {
  id:           number
  tag_name:     string
  name:         string | null
  body:         string | null
  html_url:     string
  draft:        boolean
  prerelease:   boolean
  created_at:   string
  published_at: string | null
  author:       { login: string; avatar_url: string }
}

export async function fetchReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  const data = await ghFetch<GitHubRelease[]>(
    `/repos/${owner}/${repo}/releases?per_page=5`
  )
  return data ?? []
}
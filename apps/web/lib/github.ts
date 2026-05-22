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
      next: { revalidate: 300 },
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
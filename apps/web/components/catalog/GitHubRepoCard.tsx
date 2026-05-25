import {
  Star, GitPullRequest, GitCommit,
  CheckCircle, XCircle, Clock, AlertCircle, ExternalLink,
} from "lucide-react"
import { parseGitHubUrl, fetchRepoData } from "@/lib/github"
import type { GitHubWorkflowRun } from "@/lib/github"

function CIBadge({ workflow }: { workflow: GitHubWorkflowRun }) {
  const config =
    workflow.conclusion === "success"
      ? { icon: CheckCircle, color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  label: "Passing" }
      : workflow.conclusion === "failure"
      ? { icon: XCircle,     color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    label: "Failing" }
      : workflow.status === "in_progress"
      ? { icon: Clock,       color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "Running" }
      : { icon: AlertCircle, color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/20",   label: "Unknown" }

  const Icon = config.icon

  return (
    
    <a  href={workflow.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
        "text-[11px] font-medium border transition-colors hover:opacity-80",
        config.bg, config.border,
      ].join(" ")}
    >
      <Icon size={11} className={config.color} />
      <span className={config.color}>CI {config.label}</span>
    </a>
  )
}

interface Props {
  repoUrl: string
}

export default async function GitHubRepoCard({ repoUrl }: Props) {
  const parsed = parseGitHubUrl(repoUrl)

  if (!parsed) {
    return (
      <div
        className="rounded-xl border p-5 mb-6"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          GitHub Repository
        </h2>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          URL repo tidak valid atau bukan GitHub.
        </p>
      </div>
    )
  }

  const { owner, repo } = parsed
  const data = await fetchRepoData(owner, repo)

  if (!data.repo) {
    return (
      <div
        className="rounded-xl border p-5 mb-6"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          GitHub Repository
        </h2>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Tidak bisa mengakses repo — mungkin private atau tidak ditemukan.
        </p>
      </div>
    )
  }

  const { repo: repoData, prs, commit, workflow } = data

  const lastCommitTime = commit?.commit.author.date
    ? new Date(commit.commit.author.date).toLocaleString("id-ID")
    : null

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          GitHub Repository
        </h2>
        <div className="flex items-center gap-2">
          {workflow ? <CIBadge workflow={workflow} /> : null}
          
         <a   href={repoData.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] transition-colors hover:text-sky-400 font-mono-jarvis"
            style={{ color: "var(--text-muted)" }}
          >
            {owner}/{repo}
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div
        className="flex items-center gap-5 pb-4 mb-4 border-b flex-wrap"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <Star size={12} className="text-yellow-400" />
          <span className="font-medium">{repoData.stargazers_count}</span>
          <span style={{ color: "var(--text-muted)" }}>stars</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <GitPullRequest size={12} className="text-sky-400" />
          <span className="font-medium">{prs.length}</span>
          <span style={{ color: "var(--text-muted)" }}>open PRs</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <AlertCircle size={12} className="text-orange-400" />
          <span className="font-medium">{repoData.open_issues_count}</span>
          <span style={{ color: "var(--text-muted)" }}>issues</span>
        </div>
        {repoData.language ? (
          <span className="text-xs font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
            {repoData.language}
          </span>
        ) : null}
      </div>

      {/* Last commit */}
      {commit ? (
        <div className="mb-4">
          <p
            className="text-[11px] font-medium uppercase tracking-wider font-mono-jarvis mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Last Commit
          </p>
          
          <a  href={commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 group"
          >
            <GitCommit size={13} className="mt-0.5 shrink-0 text-sky-400" />
            <div className="min-w-0">
              <p
                className="text-xs font-medium truncate group-hover:text-sky-400 transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                {commit.commit.message.split("\n")[0]}
              </p>
              <p className="text-[10px] font-mono-jarvis mt-0.5" style={{ color: "var(--text-muted)" }}>
                {commit.author?.login ?? commit.commit.author.name}
                {lastCommitTime ? " · " + lastCommitTime : ""}
              </p>
            </div>
          </a>
        </div>
      ) : null}

      {/* Open PRs */}
      {prs.length > 0 ? (
        <div>
          <p
            className="text-[11px] font-medium uppercase tracking-wider font-mono-jarvis mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Open Pull Requests
          </p>
          <div className="flex flex-col gap-2">
            {prs.slice(0, 3).map(pr => (
              
             <a key={pr.number}
                href={pr.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
              >
                <span
                  className="text-[10px] font-mono-jarvis shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  #{pr.number}
                </span>
                <span
                  className="text-xs truncate flex-1 group-hover:text-sky-400 transition-colors"
                  style={{ color: "var(--text-primary)" }}
                >
                  {pr.title}
                </span>
                <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>
                  by {pr.user.login}
                </span>
              </a>
            ))}
            {prs.length > 3 ? (
              
             <a href={repoData.html_url + "/pulls"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-sky-400 hover:underline"
              >
                +{prs.length - 3} more PRs
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Tidak ada open PR saat ini
        </p>
      )}
    </div>
  )
}
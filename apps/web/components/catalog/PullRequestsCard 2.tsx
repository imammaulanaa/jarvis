import Image from "next/image"
import { GitPullRequest, MessageSquare, ExternalLink, FileText } from "lucide-react"
import { parseGitHubUrl, fetchPullRequests } from "@/lib/github"

function prAge(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (hours < 1)  return "just opened"
  if (hours < 24) return hours + "h old"
  if (days  < 30) return days + "d old"
  const months = Math.floor(days / 30)
  return months + "mo old"
}

function labelTextColor(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 140 ? "#1a1a1a" : "#ffffff"
}

interface Props {
  repoUrl: string
}

export default async function PullRequestsCard({ repoUrl }: Props) {
  const parsed = parseGitHubUrl(repoUrl)
  if (!parsed) return null

  const { owner, repo } = parsed
  const prs      = await fetchPullRequests(owner, repo)
  const repoBase = "https://github.com/" + owner + "/" + repo

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitPullRequest size={15} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Open Pull Requests
          </h2>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-mono-jarvis font-medium"
            style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          >
            {prs.length}
          </span>
        </div>
        
        <a href={repoBase + "/pulls"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] transition-colors hover:text-[var(--accent)]"
          style={{ color: "var(--text-muted)" }}
        >
          View all
          <ExternalLink size={10} />
        </a>
      </div>

      {/* PR list */}
      {prs.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2">
          <GitPullRequest size={24} style={{ color: "var(--text-muted)" }} />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            No open pull requests
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {prs.map(pr => (
            
            <a key={pr.number}
              href={pr.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-xl border transition-all hover:border-[var(--accent)] group"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              {/* Author avatar */}
              {pr.user.avatar_url ? (
                <Image
                  src={pr.user.avatar_url}
                  alt={pr.user.login}
                  width={28}
                  height={28}
                  className="rounded-full shrink-0 mt-0.5"
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {pr.user.login.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                    #{pr.number}
                  </span>
                  <span
                    className="text-xs font-medium group-hover:text-[var(--accent)] transition-colors line-clamp-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {pr.title}
                  </span>
                  {pr.draft ? (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-mono-jarvis font-medium flex items-center gap-1"
                      style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                    >
                      <FileText size={8} />
                      DRAFT
                    </span>
                  ) : null}
                </div>

                {/* Labels */}
                {pr.labels.length > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap mt-1.5">
                    {pr.labels.slice(0, 4).map(label => (
                      <span
                        key={label.name}
                        className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: "#" + label.color, color: labelTextColor(label.color) }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Meta */}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                    by {pr.user.login}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {prAge(pr.created_at)}
                  </span>
                  {pr.comments > 0 ? (
                    <span className="text-[10px] flex items-center gap-0.5" style={{ color: "var(--text-muted)" }}>
                      <MessageSquare size={9} />
                      {pr.comments}
                    </span>
                  ) : null}
                  {pr.requested_reviewers.length > 0 ? (
                    <span className="text-[10px]" style={{ color: "var(--amber)" }}>
                      {pr.requested_reviewers.length} review{pr.requested_reviewers.length !== 1 ? "s" : ""} requested
                    </span>
                  ) : null}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
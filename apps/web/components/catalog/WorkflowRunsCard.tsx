import Image from "next/image"
import {
  CheckCircle, XCircle, Clock, CircleDot,
  PlayCircle, GitBranch, ExternalLink, Zap,
} from "lucide-react"
import { parseGitHubUrl, fetchWorkflowRuns } from "@/lib/github"
import type { GitHubWorkflowRunDetail } from "@/lib/github"

function runStatusConfig(run: GitHubWorkflowRunDetail) {
  if (run.status === "in_progress" || run.status === "queued")
    return { icon: PlayCircle,  color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", label: "Running"   }
  if (run.conclusion === "success")
    return { icon: CheckCircle, color: "text-green-500",  bg: "bg-green-50  dark:bg-green-950/30",  label: "Passed"    }
  if (run.conclusion === "failure")
    return { icon: XCircle,     color: "text-red-500",    bg: "bg-red-50    dark:bg-red-950/30",    label: "Failed"    }
  if (run.conclusion === "cancelled")
    return { icon: CircleDot,   color: "text-gray-500",   bg: "bg-gray-50   dark:bg-gray-900/30",   label: "Cancelled" }
  return                       { icon: Clock,       color: "text-gray-500",   bg: "bg-gray-50   dark:bg-gray-900/30",   label: run.conclusion ?? run.status }
}

function duration(start: string, end: string): string {
  const ms   = new Date(end).getTime() - new Date(start).getTime()
  const secs = Math.floor(ms / 1000)
  if (secs < 60) return secs + "s"
  const mins = Math.floor(secs / 60)
  const rem  = secs % 60
  return mins + "m " + rem + "s"
}

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return "just now"
  if (mins  < 60) return mins  + "m ago"
  if (hours < 24) return hours + "h ago"
  return days + "d ago"
}

interface Props {
  repoUrl: string
}

export default async function WorkflowRunsCard({ repoUrl }: Props) {
  const parsed = parseGitHubUrl(repoUrl)
  if (!parsed) return null

  const { owner, repo } = parsed
  const runs = await fetchWorkflowRuns(owner, repo)

  if (runs.length === 0) return null

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={15} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            CI / Workflow Runs
          </h2>
        </div>
        
        <a href={"https://github.com/" + owner + "/" + repo + "/actions"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] transition-colors hover:text-[var(--accent)]"
          style={{ color: "var(--text-muted)" }}
        >
          View all
          <ExternalLink size={10} />
        </a>
      </div>

      <div className="flex flex-col gap-2">
        {runs.map(run => {
          const config = runStatusConfig(run)
          const Icon   = config.icon
          const dur    = run.run_started_at && run.updated_at
            ? duration(run.run_started_at, run.updated_at)
            : null

          return (
            
            < a key={run.id}
              href={run.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-[var(--accent)] group"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              {/* Status icon */}
              <div className={"w-8 h-8 rounded-xl flex items-center justify-center shrink-0 " + config.bg}>
                <Icon
                  size={15}
                  className={config.color + (run.status === "in_progress" ? " animate-pulse" : "")}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-medium truncate group-hover:text-[var(--accent)] transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {run.display_title || run.name}
                  </span>
                  <span className="text-[10px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                    #{run.run_number}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-mono-jarvis"
                    style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                  >
                    {run.event}
                  </span>
                  <span className="text-[10px] flex items-center gap-1 font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                    <GitBranch size={9} />
                    {run.head_branch}
                  </span>
                  {dur ? (
                    <span className="text-[10px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      <Clock size={9} />
                      {dur}
                    </span>
                  ) : null}
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {timeAgo(run.created_at)}
                  </span>
                </div>
              </div>

              {/* Status label + actor */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={"text-[11px] font-semibold " + config.color}>
                  {config.label}
                </span>
                {run.actor?.avatar_url ? (
                  <Image
                    src={run.actor.avatar_url}
                    alt={run.actor.login}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : null}
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
import { Star, GitFork, AlertCircle, Users, GitCommit, GitBranch, RefreshCw } from "lucide-react"
import type { GitHubMetadata } from "@/lib/types"

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "never"
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
  meta: GitHubMetadata
}

export default function SyncedMetadataCard({ meta }: Props) {
  const stats = [
    { icon: Star,        label: "Stars",        value: meta.stars        ?? 0, color: "text-yellow-500" },
    { icon: GitFork,     label: "Forks",        value: meta.forks        ?? 0, color: "text-cyan-500"   },
    { icon: AlertCircle, label: "Open Issues",  value: meta.open_issues  ?? 0, color: "text-orange-500" },
    { icon: Users,       label: "Contributors", value: meta.contributors ?? 0, color: "text-purple-500" },
  ]

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          GitHub Metadata
        </h2>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
          <RefreshCw size={10} />
          synced {timeAgo(meta.synced_at)}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl border p-3 flex flex-col gap-1"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              <Icon size={14} className={stat.color} />
              <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {stat.value}
              </span>
              <span className="text-[10px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Default branch */}
      {meta.default_branch ? (
        <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: "var(--text-secondary)" }}>
          <GitBranch size={12} style={{ color: "var(--accent)" }} />
          <span>Default branch:</span>
          <span
            className="font-mono-jarvis px-2 py-0.5 rounded"
            style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
          >
            {meta.default_branch}
          </span>
        </div>
      ) : null}

      {/* Last commit */}
      {meta.last_commit_sha ? (
        <div
          className="flex items-start gap-2 p-3 rounded-xl border"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <GitCommit size={13} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {meta.last_commit_msg ?? "—"}
            </p>
            <p className="text-[10px] font-mono-jarvis mt-0.5" style={{ color: "var(--text-muted)" }}>
              {meta.last_commit_sha}
              {meta.last_commit_by ? " · " + meta.last_commit_by : ""}
              {meta.last_commit_at ? " · " + timeAgo(meta.last_commit_at) : ""}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
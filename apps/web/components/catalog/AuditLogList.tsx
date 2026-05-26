import Image from "next/image"
import {
  Plus, Pencil, Trash2, Activity,
  Upload, Users, GitBranch, AlertCircle,
} from "lucide-react"
import type { AuditLogEntry } from "@/lib/types"

function getActionConfig(action: string) {
  if (action.includes("created"))
    return { icon: Plus,        color: "text-green-500",  bg: "bg-green-50  dark:bg-green-950/30",  label: "Created"  }
  if (action.includes("updated"))
    return { icon: Pencil,      color: "text-blue-500",   bg: "bg-blue-50   dark:bg-blue-950/30",   label: "Updated"  }
  if (action.includes("deleted") || action.includes("archived"))
    return { icon: Trash2,      color: "text-red-500",    bg: "bg-red-50    dark:bg-red-950/30",    label: "Archived" }
  if (action.includes("status"))
    return { icon: Activity,    color: "text-amber-500",  bg: "bg-amber-50  dark:bg-amber-950/30",  label: "Status"   }
  if (action.includes("import"))
    return { icon: Upload,      color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", label: "Imported" }
  if (action.includes("member"))
    return { icon: Users,       color: "text-cyan-500",   bg: "bg-cyan-50   dark:bg-cyan-950/30",   label: "Member"   }
  if (action.includes("deploy"))
    return { icon: GitBranch,   color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30", label: "Deploy"   }
  return   { icon: AlertCircle, color: "text-gray-500",   bg: "bg-gray-50   dark:bg-gray-900/30",   label: action     }
}

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return "just now"
  if (mins  < 60) return mins  + "m ago"
  if (hours < 24) return hours + "h ago"
  if (days  < 7)  return days  + "d ago"
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

function ActionLabel({ action }: { action: string }) {
  const parts  = action.split(".")
  const entity = parts[0] ?? ""
  const verb   = parts[1] ?? action

  const VERB_MAP: Record<string, string> = {
    created:        "created",
    updated:        "updated",
    deleted:        "deleted",
    archived:       "archived",
    status_updated: "changed status of",
    import:         "imported",
    triggered:      "triggered deploy for",
    member_added:   "added member to",
    member_removed: "removed member from",
    rolled_back:    "rolled back",
  }

  return (
    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
      <span className="font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
        {VERB_MAP[verb] ?? verb}
      </span>
      {" "}
      <span className="font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
        {entity}
      </span>
    </span>
  )
}

interface Props {
  entries: AuditLogEntry[]
}

export default function AuditLogList({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-xs py-6 text-center" style={{ color: "var(--text-muted)" }}>
        No activity recorded yet
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {entries.map((entry, i) => {
        const config   = getActionConfig(entry.action)
        const Icon     = config.icon
        const isLast   = i === entries.length - 1
        const fullTime = new Date(entry.created_at).toLocaleString("id-ID")

        return (
          <div key={entry.id} className="flex gap-3 relative">
            {/* Timeline line */}
            {!isLast ? (
              <div
                className="absolute left-4 top-8 bottom-0 w-px"
                style={{ background: "var(--border)" }}
              />
            ) : null}

            {/* Icon */}
            <div className={"w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 " + config.bg}>
              <Icon size={13} className={config.color} />
            </div>

            {/* Content */}
            <div className="flex-1 pb-4 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {/* User + action */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {entry.avatar_url ? (
                      <Image
                        src={entry.avatar_url}
                        alt={entry.username ?? "User"}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    ) : (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                        style={{ background: "var(--accent)" }}
                      >
                        {(entry.username ?? "S").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className="text-xs font-semibold font-mono-jarvis"
                      style={{ color: "var(--accent)" }}
                    >
                      {entry.username ?? "system"}
                    </span>
                    <ActionLabel action={entry.action} />
                  </div>

                  {/* Metadata */}
                  {entry.metadata ? (
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      {Object.entries(entry.metadata)
                        .filter(([k]) => !["slug", "source"].includes(k))
                        .slice(0, 3)
                        .map(([key, val]) => (
                          <span
                            key={key}
                            className="text-[10px] font-mono-jarvis"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {key}:{" "}
                            <span style={{ color: "var(--text-secondary)" }}>
                              {String(val)}
                            </span>
                          </span>
                        ))}
                    </div>
                  ) : null}
                </div>

                {/* Time */}
                <span
                  className="text-[10px] font-mono-jarvis shrink-0 mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                  title={fullTime}
                >
                  {timeAgo(entry.created_at)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
import { ScrollText, AlertTriangle, Info } from "lucide-react"
import { apiFetch } from "@/lib/api"
import type { K8sEvent } from "@/lib/types"

interface EventsResponse {
  events: K8sEvent[]
  total:  number
  linked: boolean
}

interface Props {
  slug: string
}

export default async function K8sEventsCard({ slug }: Props) {
  let data: EventsResponse | null = null
  try {
    data = await apiFetch<EventsResponse>("/api/services/" + slug + "/events")
  } catch {
    return null
  }

  if (!data || !data.linked || data.events.length === 0) return null

  const warnings = data.events.filter(e => e.type === "Warning").length

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ScrollText size={15} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Kubernetes Events
          </h2>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-mono-jarvis font-medium"
            style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          >
            {data.total}
          </span>
        </div>
        {warnings > 0 ? (
          <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--amber)" }}>
            <AlertTriangle size={10} />
            {warnings} warning{warnings !== 1 ? "s" : ""}
          </span>
        ) : null}
      </div>

      {/* Events list */}
      <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">
        {data.events.map((event, i) => {
          const isWarning = event.type === "Warning"
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 p-2.5 rounded-xl"
              style={{
                background: isWarning ? "rgba(245,158,11,0.06)" : "var(--bg-secondary)",
                border: "1px solid " + (isWarning ? "rgba(245,158,11,0.2)" : "var(--border)"),
              }}
            >
              {isWarning ? (
                <AlertTriangle size={12} className="mt-0.5 shrink-0" style={{ color: "var(--amber)" }} />
              ) : (
                <Info size={12} className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }} />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[11px] font-semibold font-mono-jarvis"
                    style={{ color: isWarning ? "var(--amber)" : "var(--text-primary)" }}
                  >
                    {event.reason}
                  </span>
                  <span className="text-[10px] font-mono-jarvis truncate" style={{ color: "var(--text-muted)" }}>
                    {event.object}
                  </span>
                  {event.count > 1 ? (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-mono-jarvis"
                      style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                    >
                      ×{event.count}
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                  {event.message}
                </p>
              </div>

              <span className="text-[10px] font-mono-jarvis shrink-0" style={{ color: "var(--text-muted)" }}>
                {event.age}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
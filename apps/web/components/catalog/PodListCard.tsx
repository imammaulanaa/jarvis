import {
  Box, Activity, AlertTriangle, RefreshCw, Server, CheckCircle, XCircle, Clock,
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import type { PodStatus } from "@/lib/types"

interface PodsResponse {
  pods:   PodStatus[]
  total:  number
  linked: boolean
}

function phaseConfig(phase: string, healthy: boolean) {
  if (healthy) return { color: "var(--green)", bg: "var(--green-soft)", icon: CheckCircle, label: "Running" }
  switch (phase) {
    case "Pending":
      return { color: "var(--amber)", bg: "rgba(245,158,11,0.1)", icon: Clock,         label: "Pending"   }
    case "Failed":
      return { color: "var(--red)",   bg: "rgba(239,68,68,0.1)",  icon: XCircle,       label: "Failed"    }
    case "Succeeded":
      return { color: "var(--cyan)",  bg: "var(--cyan-soft)",     icon: CheckCircle,   label: "Succeeded" }
    case "Running":
      return { color: "var(--amber)", bg: "rgba(245,158,11,0.1)", icon: AlertTriangle, label: "Running (not ready)" }
    default:
      return { color: "var(--text-muted)", bg: "var(--bg-secondary)", icon: Box, label: phase }
  }
}

interface Props {
  slug: string
}

export default async function PodListCard({ slug }: Props) {
  let data: PodsResponse | null = null
  try {
    data = await apiFetch<PodsResponse>("/api/services/" + slug + "/pods")
  } catch {
    return null
  }

  if (!data || !data.linked) return null

  if (data.pods.length === 0) {
    return (
      <div
        className="rounded-xl border p-5 mb-6"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Box size={15} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Pods
          </h2>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          No pods running for this deployment.
        </p>
      </div>
    )
  }

  const totalRestarts = data.pods.reduce((sum, p) => sum + p.restart_count, 0)
  const allHealthy    = data.pods.every(p => p.healthy)

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Box size={15} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Pods
          </h2>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-mono-jarvis font-medium"
            style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          >
            {data.total}
          </span>
        </div>
        {totalRestarts > 0 ? (
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--amber)" }}>
            <RefreshCw size={10} />
            {totalRestarts} restart{totalRestarts !== 1 ? "s" : ""}
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: allHealthy ? "var(--green)" : "var(--text-muted)" }}
          >
            <Activity size={10} />
            {allHealthy ? "All healthy" : "Some unhealthy"}
          </div>
        )}
      </div>

      {/* Pods list */}
      <div className="flex flex-col gap-2">
        {data.pods.map(pod => {
          const cfg  = phaseConfig(pod.phase, pod.healthy)
          const Icon = cfg.icon

          return (
            <div
              key={pod.name}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              {/* Status icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: cfg.bg }}
              >
                <Icon
                  size={14}
                  style={{ color: cfg.color }}
                  className={pod.phase === "Pending" ? "animate-pulse" : ""}
                />
              </div>

              {/* Pod name + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono-jarvis truncate" style={{ color: "var(--text-primary)" }}>
                  {pod.name}
                </p>
                <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                  <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  {pod.reason ? (
                    <span className="text-[10px] font-mono-jarvis" style={{ color: "var(--red)" }}>
                      {pod.reason}
                    </span>
                  ) : null}
                  <span className="text-[10px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <Server size={9} />
                    {pod.node || "—"}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 shrink-0">
                {/* CPU */}
                {pod.cpu_display ? (
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                      CPU
                    </p>
                    <p className="text-xs font-mono-jarvis font-bold" style={{ color: "var(--cyan)" }}>
                      {pod.cpu_display}
                    </p>
                  </div>
                ) : null}

                {/* Memory */}
                {pod.mem_display ? (
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                      Mem
                    </p>
                    <p className="text-xs font-mono-jarvis font-bold" style={{ color: "var(--accent)" }}>
                      {pod.mem_display}
                    </p>
                  </div>
                ) : null}

                {/* Ready */}
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wider font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                    Ready
                  </p>
                  <p
                    className="text-xs font-mono-jarvis font-bold"
                    style={{ color: pod.ready_containers === pod.total_containers ? "var(--green)" : "var(--amber)" }}
                  >
                    {pod.ready_containers}/{pod.total_containers}
                  </p>
                </div>

                {/* Restarts */}
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wider font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                    Restarts
                  </p>
                  <p
                    className="text-xs font-mono-jarvis font-bold"
                    style={{
                      color: pod.restart_count > 5 ? "var(--red)"
                           : pod.restart_count > 0 ? "var(--amber)"
                           : "var(--text-secondary)",
                    }}
                  >
                    {pod.restart_count}
                  </p>
                </div>

                {/* Age */}
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wider font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                    Age
                  </p>
                  <p className="text-xs font-mono-jarvis font-bold" style={{ color: "var(--text-primary)" }}>
                    {pod.age}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
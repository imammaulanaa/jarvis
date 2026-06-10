import { Boxes, Container, CheckCircle, AlertCircle, Layers, GitBranch } from "lucide-react"
import { apiFetch } from "@/lib/api"
import type { DeploymentStatus } from "@/lib/types"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) {
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return Math.floor(diff / 60000) + "m ago"
    return hours + "h ago"
  }
  if (days < 30) return days + "d ago"
  return Math.floor(days / 30) + "mo ago"
}

function parseImage(image: string): { repo: string; tag: string } {
  const idx = image.lastIndexOf(":")
  if (idx === -1) return { repo: image, tag: "latest" }
  return { repo: image.slice(0, idx), tag: image.slice(idx + 1) }
}

interface Props {
  slug: string
}

export default async function DeploymentStatusCard({ slug }: Props) {
  let status: DeploymentStatus | null = null
  let notLinked = false

  try {
    status = await apiFetch<DeploymentStatus>("/api/services/" + slug + "/deployment")
  } catch (e) {
    const msg = (e as Error).message ?? ""
    if (msg.includes("404") || msg.includes("not linked")) {
      notLinked = true
    } else {
      return null // k8s tidak tersedia, hide card
    }
  }

  if (notLinked || !status) {
    return (
      <div
        className="rounded-xl border p-5 mb-6"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Boxes size={15} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Kubernetes Deployment
          </h2>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Service belum di-link ke deployment Kubernetes. Klik <b>Link Deployment</b> di pojok kanan atas untuk menghubungkan.
        </p>
      </div>
    )
  }

  const { repo, tag } = parseImage(status.image)
  const replicaPct    = status.desired_replicas > 0
    ? (status.ready_replicas / status.desired_replicas) * 100
    : 0

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Boxes size={15} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Kubernetes Deployment
          </h2>
          <span className="text-[11px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
            {status.namespace}/{status.name}
          </span>
        </div>
        {status.healthy ? (
          <span
            className="text-[10px] px-2 py-1 rounded-full font-semibold flex items-center gap-1"
            style={{ background: "var(--green-soft)", color: "var(--green)" }}
          >
            <CheckCircle size={10} />
            Healthy
          </span>
        ) : (
          <span
            className="text-[10px] px-2 py-1 rounded-full font-semibold flex items-center gap-1"
            style={{ background: "rgba(245,158,11,0.1)", color: "var(--amber)" }}
          >
            <AlertCircle size={10} />
            Degraded
          </span>
        )}
      </div>

      {/* Replica progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            Replicas
          </span>
          <span className="text-xs font-mono-jarvis font-bold" style={{ color: "var(--text-primary)" }}>
            {status.ready_replicas} / {status.desired_replicas}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
          <div
            className="h-full transition-all"
            style={{
              width: replicaPct + "%",
              background: status.healthy
                ? "linear-gradient(90deg, var(--green), var(--cyan))"
                : "linear-gradient(90deg, var(--amber), #f97316)",
            }}
          />
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
            available: <span style={{ color: "var(--text-secondary)" }}>{status.available_replicas}</span>
          </span>
          <span className="text-[10px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
            updated: <span style={{ color: "var(--text-secondary)" }}>{status.updated_replicas}</span>
          </span>
        </div>
      </div>

      {/* Image */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl mb-3"
        style={{ background: "var(--bg-secondary)" }}
      >
        <Container size={14} style={{ color: "var(--accent)" }} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
            Image
          </p>
          <p className="text-xs font-mono-jarvis truncate" style={{ color: "var(--text-primary)" }}>
            {repo}
            <span style={{ color: "var(--accent)" }}>:{tag}</span>
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1">
          <Layers size={10} />
          {status.strategy}
        </span>
        <span className="flex items-center gap-1">
          <GitBranch size={10} />
          {timeAgo(status.created_at)}
        </span>
      </div>
    </div>
  )
}
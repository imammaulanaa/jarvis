import Link from "next/link"
import { ArrowLeft, GitBranch, BookOpen, ExternalLink, Trash2 } from "lucide-react"
import { cn } from "@/lib/cn"
import EditServiceModal from "./EditServiceModal"
import StatusUpdateButton from "./StatusUpdateButton"
import SyncGitHubButton from "./SyncGitHubButton"
import LinkDeploymentModal from "./LinkDeploymentModal"
import type { Service } from "@/lib/types"

const STATUS_CONFIG = {
  healthy:  { label: "Healthy",  dot: "bg-green-400",  text: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20"  },
  degraded: { label: "Degraded", dot: "bg-yellow-400", text: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  down:     { label: "Down",     dot: "bg-red-400",    text: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20"    },
  unknown:  { label: "Unknown",  dot: "bg-gray-400",   text: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/20"   },
}

const TIER_CONFIG = {
  "tier-1": { label: "Tier 1 — Critical",  color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20"    },
  "tier-2": { label: "Tier 2 — Important", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  "tier-3": { label: "Tier 3 — Internal",  color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/20"   },
}

interface Props {
  service: Service
  token:   string
}

export default function ServiceDetailHeader({ service, token }: Props) {
  const status  = STATUS_CONFIG[service.status] ?? STATUS_CONFIG.unknown
  const tier    = TIER_CONFIG[service.tier]     ?? TIER_CONFIG["tier-3"]
  const repoUrl = service.repo_url ?? null
  const docsUrl = service.docs_url ?? null
  const k8sRef  = (service.metadata as {
    k8s?: { namespace?: string; deployment?: string }
  } | undefined)?.k8s
  const isK8sLinked = !!(k8sRef?.namespace && k8sRef?.deployment)

  return (
    <div>
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors hover:text-[var(--accent)]"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={13} />
        Back to Catalog
      </Link>

      <div
        className="rounded-2xl border p-6 mb-6"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">

          {/* Left — name + badges */}
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {service.name}
              </h1>
              <p className="text-sm font-mono-jarvis mt-1" style={{ color: "var(--text-muted)" }}>
                {service.slug}
              </p>
            </div>

            {service.description ? (
              <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
                {service.description}
              </p>
            ) : null}

            <div className="flex items-center gap-2 flex-wrap">
              <div>
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border",
                  status.bg, status.border
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", status.dot)} />
                  <span className={status.text}>{status.label}</span>
                </div>
                {service.status_checked_at ? (
                  <p className="text-[10px] mt-1 font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                    checked {new Date(service.status_checked_at).toLocaleTimeString("id-ID")}
                  </p>
                ) : null}
              </div>

              <div className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border",
                tier.color, tier.bg, tier.border
              )}>
                {tier.label}
              </div>

              {service.language ? (
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-medium font-mono-jarvis border"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", borderColor: "var(--border)" }}
                >
                  {service.language}
                </div>
              ) : null}

              {service.tags?.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded text-[11px] font-mono-jarvis"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {isK8sLinked ? (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{
                  background: "var(--accent-glow)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent-soft)",
                }}
                title={"Status otomatis dari " + k8sRef!.namespace + "/" + k8sRef!.deployment}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
                Auto-synced
              </div>
            ) : (
              <StatusUpdateButton
                slug={service.slug}
                currentStatus={service.status}
                token={token}
              />
            )}

            <SyncGitHubButton
              slug={service.slug}
              token={token}
              hasRepo={!!repoUrl}
            />

            <LinkDeploymentModal
              slug={service.slug}
              token={token}
              current={k8sRef}
            />

            {repoUrl ? (
              
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                <GitBranch size={13} />
                Repository
                <ExternalLink size={11} />
              </a>
            ) : null}

            {docsUrl ? (
              
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                <BookOpen size={13} />
                Docs
                <ExternalLink size={11} />
              </a>
            ) : null}

            <EditServiceModal service={service} token={token} />

            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors hover:border-red-500/40 hover:text-red-400"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <Trash2 size={13} />
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
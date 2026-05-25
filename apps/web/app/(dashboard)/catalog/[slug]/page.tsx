import { Suspense } from "react"
import { Rocket, Clock } from "lucide-react"
import { auth } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import ServiceDetailHeader from "@/components/catalog/ServiceDetailHeader"
import ServiceInfoGrid from "@/components/catalog/ServiceInfoGrid"
import GitHubRepoCard from "@/components/catalog/GitHubRepoCard"
import type { Service } from "@/lib/types"

interface Props {
  params: Promise<{ slug: string }>
}

function GitHubCardSkeleton() {
  return (
    <div
      className="rounded-xl border p-5 mb-6 animate-pulse"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="flex justify-between mb-4">
        <div className="h-4 w-32 rounded" style={{ background: "var(--border)" }} />
        <div className="h-4 w-24 rounded" style={{ background: "var(--border)" }} />
      </div>
      <div
        className="flex gap-5 pb-4 mb-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        {[1, 2, 3].map(i => (
          <div key={i} className="h-3 w-16 rounded" style={{ background: "var(--border)" }} />
        ))}
      </div>
      <div className="h-3 w-48 rounded mb-3" style={{ background: "var(--border)" }} />
      <div className="h-3 w-full rounded mb-2" style={{ background: "var(--border)" }} />
      <div className="h-3 w-3/4 rounded" style={{ background: "var(--border)" }} />
    </div>
  )
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const session  = await auth()
  const token    = session?.jarvisToken ?? ""

  let service: Service
  try {
    service = await apiFetch<Service>("/api/services/" + slug)
  } catch {
    const { notFound } = await import("next/navigation")
    notFound()
  }

  return (
    <div className="max-w-5xl">
      <ServiceDetailHeader service={service!} token={token} />
      <ServiceInfoGrid service={service!} />

      {/* GitHub Repo Card */}
      {service!.repo_url ? (
        <Suspense fallback={<GitHubCardSkeleton />}>
          <GitHubRepoCard repoUrl={service!.repo_url} />
        </Suspense>
      ) : null}

      {/* Deployment History */}
      <div
        className="rounded-xl border p-5 mb-6"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Deployment History
          </h2>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            <Rocket size={12} />
            Deploy
          </button>
        </div>
        <div className="flex flex-col items-center py-10 gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
          >
            <Clock size={18} style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            No deployments yet
          </p>
          <p className="text-xs text-center max-w-xs" style={{ color: "var(--text-muted)" }}>
            Deployment history akan muncul di sini setelah Phase 4 selesai.
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Recent Activity
        </h2>
        <div className="flex flex-col gap-2">
          {[
            { action: "service.created", time: service!.created_at },
            { action: "service.updated", time: service!.updated_at },
          ].map((log, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-xs font-mono-jarvis" style={{ color: "var(--text-secondary)" }}>
                  {log.action}
                </span>
              </div>
              <span className="text-[11px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                {new Date(log.time).toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
import { Suspense } from "react"
import Link from "next/link"
import { Boxes, CheckCircle, AlertCircle, Link2, Layers } from "lucide-react"
import { apiFetch } from "@/lib/api"
import PageHeader from "@/components/layout/PageHeader"
import type { ClusterOverviewResponse } from "@/lib/types"

async function OverviewContent() {
  let data: ClusterOverviewResponse
  try {
    data = await apiFetch<ClusterOverviewResponse>("/api/k8s/overview")
  } catch {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <Boxes size={28} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Kubernetes cluster tidak tersedia
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Pastikan cluster running dan JARVIS API bisa akses kubeconfig.
        </p>
      </div>
    )
  }

  const { summary } = data

  const stats = [
    { label: "Total Deployments", value: summary.total_deployments, color: "var(--text-primary)" },
    { label: "Healthy",           value: summary.healthy,           color: "var(--green)" },
    { label: "Linked to Catalog", value: summary.linked,            color: "var(--accent)" },
    { label: "Unlinked",          value: summary.unlinked,          color: summary.unlinked > 0 ? "var(--amber)" : "var(--text-muted)" },
  ]

  return (
    <>
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="rounded-xl border p-4"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <p className="text-2xl font-bold font-mono-jarvis" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Per namespace */}
      <div className="flex flex-col gap-6">
        {data.namespaces.map(ns => (
          <div key={ns.namespace}>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={14} style={{ color: "var(--accent)" }} />
              <h2 className="text-sm font-bold font-mono-jarvis" style={{ color: "var(--text-primary)" }}>
                {ns.namespace}
              </h2>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {ns.deployments.length} deployment{ns.deployments.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ns.deployments.map(dep => (
                <div
                  key={dep.name}
                  className="card-hover rounded-xl border p-4 transition-all"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold font-mono-jarvis truncate" style={{ color: "var(--text-primary)" }}>
                      {dep.name}
                    </p>
                    {dep.healthy ? (
                      <CheckCircle size={13} className="shrink-0" style={{ color: "var(--green)" }} />
                    ) : (
                      <AlertCircle size={13} className="shrink-0" style={{ color: "var(--amber)" }} />
                    )}
                  </div>

                  <p className="text-[10px] font-mono-jarvis truncate mb-2" style={{ color: "var(--text-muted)" }}>
                    {dep.image}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-mono-jarvis font-bold"
                      style={{ color: dep.healthy ? "var(--green)" : "var(--amber)" }}
                    >
                      {dep.ready_replicas}/{dep.desired_replicas} ready
                    </span>

                    {dep.linked_service ? (
                      <Link
                        href={"/catalog/" + dep.linked_service}
                        className="flex items-center gap-1 text-[10px] transition-colors hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        <Link2 size={9} />
                        {dep.linked_service}
                      </Link>
                    ) : (
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        not in catalog
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function OverviewSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }} />
        ))}
      </div>
      <div className="h-4 w-32 rounded mb-3" style={{ background: "var(--border)" }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }} />
        ))}
      </div>
    </div>
  )
}

export default function InfrastructurePage() {
  return (
    <>
      <PageHeader
        title="Infrastructure"
        description="Semua deployment Kubernetes di seluruh cluster"
      />
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewContent />
      </Suspense>
    </>
  )
}
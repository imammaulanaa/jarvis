import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import ServiceDetailHeader from "@/components/catalog/ServiceDetailHeader"
import ServiceInfoGrid from "@/components/catalog/ServiceInfoGrid"
import SyncedMetadataCard from "@/components/catalog/SyncedMetadataCard"
import GitHubRepoCard from "@/components/catalog/GitHubRepoCard"
import WorkflowRunsCard from "@/components/catalog/WorkflowRunsCard"
import PullRequestsCard from "@/components/catalog/PullRequestsCard"
import ReleasesCard from "@/components/catalog/ReleasesCard"
import BranchProtectionCard from "@/components/catalog/BranchProtectionCard"
import DeploymentStatusCard from "@/components/catalog/DeploymentStatusCard"
import PodListCard from "@/components/catalog/PodListCard"
import AuditLogList from "@/components/catalog/AuditLogList"
import type { Service, AuditLogResponse, GitHubMetadata } from "@/lib/types"

interface Props {
  params: Promise<{ slug: string }>
}

function GitHubCardSkeleton() {
  return (
    <div className="rounded-xl border p-5 mb-6 animate-pulse" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="flex justify-between mb-4">
        <div className="h-4 w-32 rounded" style={{ background: "var(--border)" }} />
        <div className="h-4 w-24 rounded" style={{ background: "var(--border)" }} />
      </div>
      <div className="flex gap-5 pb-4 mb-4 border-b" style={{ borderColor: "var(--border)" }}>
        {[1, 2, 3].map(i => <div key={i} className="h-3 w-16 rounded" style={{ background: "var(--border)" }} />)}
      </div>
      <div className="h-3 w-48 rounded mb-3" style={{ background: "var(--border)" }} />
      <div className="h-3 w-full rounded mb-2" style={{ background: "var(--border)" }} />
      <div className="h-3 w-3/4 rounded" style={{ background: "var(--border)" }} />
    </div>
  )
}

function WorkflowSkeleton() {
  return (
    <div className="rounded-xl border p-5 mb-6 animate-pulse" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="h-4 w-40 rounded mb-4" style={{ background: "var(--border)" }} />
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-3 mb-2 p-3 rounded-xl items-center" style={{ background: "var(--bg-secondary)" }}>
          <div className="w-8 h-8 rounded-xl shrink-0" style={{ background: "var(--border)" }} />
          <div className="flex-1">
            <div className="h-3 w-2/3 rounded mb-1.5" style={{ background: "var(--border)" }} />
            <div className="h-2.5 w-1/2 rounded" style={{ background: "var(--border)" }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function PRCardSkeleton() {
  return (
    <div className="rounded-xl border p-5 mb-6 animate-pulse" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="h-4 w-40 rounded mb-4" style={{ background: "var(--border)" }} />
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-3 mb-2 p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
          <div className="w-7 h-7 rounded-full shrink-0" style={{ background: "var(--border)" }} />
          <div className="flex-1">
            <div className="h-3 w-3/4 rounded mb-1.5" style={{ background: "var(--border)" }} />
            <div className="h-2.5 w-1/3 rounded" style={{ background: "var(--border)" }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ReleasesSkeleton() {
  return (
    <div className="rounded-xl border p-5 mb-6 animate-pulse" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="h-4 w-28 rounded mb-4" style={{ background: "var(--border)" }} />
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl shrink-0" style={{ background: "var(--border)" }} />
          <div className="flex-1">
            <div className="h-3.5 w-20 rounded mb-1.5" style={{ background: "var(--border)" }} />
            <div className="h-2.5 w-2/3 rounded" style={{ background: "var(--border)" }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProtectionSkeleton() {
  return (
    <div className="rounded-xl border p-5 mb-6 animate-pulse" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="h-4 w-40 rounded mb-4" style={{ background: "var(--border)" }} />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <div className="w-4 h-4 rounded-full shrink-0" style={{ background: "var(--border)" }} />
          <div className="h-3 w-2/3 rounded" style={{ background: "var(--border)" }} />
        </div>
      ))}
    </div>
  )
}

function DeploymentSkeleton() {
  return (
    <div className="rounded-xl border p-5 mb-6 animate-pulse" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="h-4 w-44 rounded mb-4" style={{ background: "var(--border)" }} />
      <div className="h-2 w-full rounded mb-3" style={{ background: "var(--border)" }} />
      <div className="h-12 rounded-xl" style={{ background: "var(--bg-secondary)" }} />
    </div>
  )
}

function PodListSkeleton() {
  return (
    <div className="rounded-xl border p-5 mb-6 animate-pulse" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="h-4 w-20 rounded mb-4" style={{ background: "var(--border)" }} />
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: "var(--bg-secondary)" }}>
          <div className="w-8 h-8 rounded-xl shrink-0" style={{ background: "var(--border)" }} />
          <div className="flex-1">
            <div className="h-3 w-2/3 rounded mb-1.5" style={{ background: "var(--border)" }} />
            <div className="h-2.5 w-1/3 rounded" style={{ background: "var(--border)" }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function AuditLogSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 rounded-xl shrink-0" style={{ background: "var(--border)" }} />
          <div className="flex-1 pt-1">
            <div className="h-3 w-2/3 rounded mb-1.5" style={{ background: "var(--border)" }} />
            <div className="h-2.5 w-1/3 rounded" style={{ background: "var(--border)" }} />
          </div>
        </div>
      ))}
    </div>
  )
}

async function AuditLogSection({ slug }: { slug: string }) {
  let logs: AuditLogResponse = { data: [], total: 0 }
  try {
    logs = await apiFetch<AuditLogResponse>("/api/services/" + slug + "/audit-logs?limit=20")
  } catch {
    // Silently fail
  }
  return <AuditLogList entries={logs.data ?? []} />
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

  const ghMeta = (service!.metadata as { github?: GitHubMetadata } | undefined)?.github

  return (
    <div className="max-w-5xl">
      <ServiceDetailHeader service={service!} token={token} />
      <ServiceInfoGrid service={service!} />

      {/* Kubernetes Deployment */}
      <Suspense fallback={<DeploymentSkeleton />}>
        <DeploymentStatusCard slug={service!.slug} />
      </Suspense>

      {/* Pods */}
      <Suspense fallback={<PodListSkeleton />}>
        <PodListCard slug={service!.slug} />
      </Suspense>

      {ghMeta ? <SyncedMetadataCard meta={ghMeta} /> : null}

      {service!.repo_url ? (
        <Suspense fallback={<GitHubCardSkeleton />}>
          <GitHubRepoCard repoUrl={service!.repo_url} />
        </Suspense>
      ) : null}

      {service!.repo_url ? (
        <Suspense fallback={<WorkflowSkeleton />}>
          <WorkflowRunsCard repoUrl={service!.repo_url} />
        </Suspense>
      ) : null}

      {service!.repo_url ? (
        <Suspense fallback={<PRCardSkeleton />}>
          <PullRequestsCard repoUrl={service!.repo_url} />
        </Suspense>
      ) : null}

      {service!.repo_url ? (
        <Suspense fallback={<ReleasesSkeleton />}>
          <ReleasesCard repoUrl={service!.repo_url} />
        </Suspense>
      ) : null}

      {service!.repo_url ? (
        <Suspense fallback={<ProtectionSkeleton />}>
          <BranchProtectionCard slug={service!.slug} repoUrl={service!.repo_url} />
        </Suspense>
      ) : null}

      {/* Recent Activity */}
      <div className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Activity</h2>
          <span className="text-[11px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>last 20 events</span>
        </div>
        <Suspense fallback={<AuditLogSkeleton />}>
          <AuditLogSection slug={service!.slug} />
        </Suspense>
      </div>
    </div>
  )
}
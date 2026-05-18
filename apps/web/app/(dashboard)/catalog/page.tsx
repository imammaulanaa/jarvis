import { Suspense } from "react"
import { LayoutGrid } from "lucide-react"
import { auth } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import PageHeader from "@/components/layout/PageHeader"
import EmptyState from "@/components/ui/EmptyState"
import ServiceCard from "@/components/catalog/ServiceCard"
import ServiceCardSkeleton from "@/components/catalog/ServiceCardSkeleton"
import RegisterServiceModal from "@/components/catalog/RegisterServiceModal"
import type { ServiceListResponse } from "@/lib/types"

async function ServiceGrid() {
  let data: ServiceListResponse

  try {
    data = await apiFetch<ServiceListResponse>("/api/services?limit=50")
  } catch {
    return (
      <div className="text-sm text-red-400 bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20">
        Failed to load services — is the API running?
      </div>
    )
  }

  if (!data.data || data.data.length === 0) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title="Belum ada service terdaftar"
        description="Register service pertama kamu atau import dari catalog-info.yaml di repo GitHub."
      />
    )
  }

  return (
    <div>
      <p className="text-xs mb-4 font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
        {data.total} service{data.total !== 1 ? "s" : ""} terdaftar
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.data.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  )
}

function ServiceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default async function CatalogPage() {
  const session = await auth()
  const token   = session?.jarvisToken ?? ""

  return (
    <>
      <PageHeader
        title="Service Catalog"
        description="Semua microservices yang terdaftar di JARVIS"
        action={<RegisterServiceModal token={token} />}
      />
      <Suspense fallback={<ServiceGridSkeleton />}>
        <ServiceGrid />
      </Suspense>
    </>
  )
}
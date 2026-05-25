import { Suspense } from "react"
import { LayoutGrid } from "lucide-react"
import { auth } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import PageHeader from "@/components/layout/PageHeader"
import EmptyState from "@/components/ui/EmptyState"
import ServiceCard from "@/components/catalog/ServiceCard"
import ServiceCardSkeleton from "@/components/catalog/ServiceCardSkeleton"
import RegisterServiceModal from "@/components/catalog/RegisterServiceModal"
import ImportServiceModal from "@/components/catalog/ImportServiceModal"
import CatalogFilterBar from "@/components/catalog/CatalogFilterBar"
import type { ServiceListResponse } from "@/lib/types"

interface PageProps {
  searchParams: Promise<{
    search?:   string
    status?:   string
    tier?:     string
    language?: string
    tags?:     string
    offset?:   string
  }>
}

async function ServiceGrid({
  searchParams,
}: {
  searchParams: Awaited<PageProps["searchParams"]>
}) {
  const params = new URLSearchParams()
  params.set("limit", "50")
  if (searchParams.search)   params.set("search",   searchParams.search)
  if (searchParams.status)   params.set("status",   searchParams.status)
  if (searchParams.tier)     params.set("tier",     searchParams.tier)
  if (searchParams.language) params.set("language", searchParams.language)
  if (searchParams.tags)     params.set("tags",     searchParams.tags)
  if (searchParams.offset)   params.set("offset",   searchParams.offset)

  let data: ServiceListResponse

  try {
    data = await apiFetch<ServiceListResponse>("/api/services?" + params.toString())
  } catch {
    return (
      <div className="text-sm text-red-400 bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20">
        Failed to load services — is the API running?
      </div>
    )
  }

  if (!data.data || data.data.length === 0) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title="Tidak ada service ditemukan"
        description="Coba ubah filter atau keyword pencarian."
      />
    )
  }

  return (
    <div>
      <p className="text-xs mb-4 font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
        {data.total} service{data.total !== 1 ? "s" : ""} ditemukan
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

export default async function CatalogPage({ searchParams }: PageProps) {
  const session        = await auth()
  const token          = session?.jarvisToken ?? ""
  const resolvedParams = await searchParams

  return (
    <>
      <PageHeader
        title="Service Catalog"
        description="Semua microservices yang terdaftar di JARVIS"
        action={
          <div className="flex items-center gap-2">
            <ImportServiceModal token={token} />
            <RegisterServiceModal token={token} />
          </div>
        }
      />
      <Suspense fallback={<div className="h-8" />}>
        <CatalogFilterBar />
      </Suspense>
      <Suspense
        fallback={<ServiceGridSkeleton />}
        key={JSON.stringify(resolvedParams)}
      >
        <ServiceGrid searchParams={resolvedParams} />
      </Suspense>
    </>
  )
}
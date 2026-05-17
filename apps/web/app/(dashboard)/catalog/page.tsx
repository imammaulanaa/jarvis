import { LayoutGrid, Plus } from "lucide-react"
import PageHeader from "@/components/layout/PageHeader"
import EmptyState from "@/components/ui/EmptyState"

export default function CatalogPage() {
  return (
    <>
      <PageHeader
        title="Service Catalog"
        description="Semua microservices yang terdaftar di JARVIS"
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={15} />
            Register Service
          </button>
        }
      />

      <EmptyState
        icon={LayoutGrid}
        title="Belum ada service terdaftar"
        description="Register service pertama kamu atau import dari catalog-info.yaml di repo GitHub."
        action={
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg border border-gray-700 transition-colors">
            {"📖"} Lihat dokumentasi
          </button>
        }
      />
    </>
  )
}
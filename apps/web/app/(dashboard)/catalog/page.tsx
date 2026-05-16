import { auth } from "@/lib/auth"

export default async function CatalogPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">{"⚡"} JARVIS</h1>
        <p className="text-gray-400 mb-8">Internal Developer Portal</p>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900">
          <p className="text-sm text-gray-400 mb-1">Logged in as</p>
          <p className="font-semibold">{session?.user?.name ?? "Unknown"}</p>
          <p className="text-xs text-gray-500">{(session as any)?.role ?? "member"}</p>
        </div>

        <p className="text-gray-600 text-sm mt-8">
          {"🚧"} Service Catalog — coming in Phase 1
        </p>
      </div>
    </div>
  )
}

"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Search, X } from "lucide-react"

export default function CatalogSearchBar() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("search") ?? "")

  const updateURL = useCallback((val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val) {
      params.set("search", val)
    } else {
      params.delete("search")
    }
    params.delete("offset")
    router.replace(pathname + "?" + params.toString())
  }, [router, pathname, searchParams])

  useEffect(() => {
    const timer = setTimeout(() => updateURL(value), 300)
    return () => clearTimeout(timer)
  }, [value, updateURL])

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border w-64 transition-colors focus-within:border-sky-500"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
      <input
        type="text"
        placeholder="Search services..."
        value={value}
        onChange={e => setValue(e.target.value)}
        className="flex-1 bg-transparent outline-none text-xs font-mono-jarvis min-w-0"
        style={{ color: "var(--text-primary)" }}
      />
      {value ? (
        <button
          onClick={() => setValue("")}
          className="shrink-0 hover:text-sky-400 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={12} />
        </button>
      ) : null}
    </div>
  )
}
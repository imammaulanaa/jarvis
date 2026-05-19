"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/cn"

const FILTERS = {
  status: [
    { value: "healthy",  label: "Healthy",  color: "text-green-400  bg-green-400/10  border-green-400/30"  },
    { value: "degraded", label: "Degraded", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
    { value: "down",     label: "Down",     color: "text-red-400    bg-red-400/10    border-red-400/30"    },
    { value: "unknown",  label: "Unknown",  color: "text-gray-400   bg-gray-400/10   border-gray-400/30"   },
  ],
  tier: [
    { value: "tier-1", label: "Tier 1", color: "text-red-400    bg-red-400/10    border-red-400/30"    },
    { value: "tier-2", label: "Tier 2", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
    { value: "tier-3", label: "Tier 3", color: "text-gray-400   bg-gray-400/10   border-gray-400/30"   },
  ],
  language: [
    { value: "Go",         label: "Go",         color: "text-sky-400    bg-sky-400/10    border-sky-400/30"    },
    { value: "TypeScript", label: "TypeScript", color: "text-blue-400   bg-blue-400/10   border-blue-400/30"   },
    { value: "Python",     label: "Python",     color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
    { value: "Java",       label: "Java",       color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  ],
}

export default function CatalogFilterBar() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const toggle = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("offset")
    router.replace(pathname + "?" + params.toString())
  }, [router, pathname, searchParams])

  const clearAll = useCallback(() => {
    router.replace(pathname)
  }, [router, pathname])

  const activeStatus = searchParams.get("status")
  const activeTier   = searchParams.get("tier")
  const activeLang   = searchParams.get("language")
  const hasFilter    = activeStatus || activeTier || activeLang

  return (
    <div className="flex items-center gap-2 flex-wrap mb-5">
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.status.map(f => (
          <button
            key={f.value}
            onClick={() => toggle("status", f.value)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all",
              activeStatus === f.value
                ? f.color
                : "border-transparent hover:border-[var(--border)]"
            )}
            style={activeStatus !== f.value ? { color: "var(--text-muted)" } : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="w-px h-4" style={{ background: "var(--border)" }} />

      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.tier.map(f => (
          <button
            key={f.value}
            onClick={() => toggle("tier", f.value)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all font-mono-jarvis",
              activeTier === f.value
                ? f.color
                : "border-transparent hover:border-[var(--border)]"
            )}
            style={activeTier !== f.value ? { color: "var(--text-muted)" } : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="w-px h-4" style={{ background: "var(--border)" }} />

      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.language.map(f => (
          <button
            key={f.value}
            onClick={() => toggle("language", f.value)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all font-mono-jarvis",
              activeLang === f.value
                ? f.color
                : "border-transparent hover:border-[var(--border)]"
            )}
            style={activeLang !== f.value ? { color: "var(--text-muted)" } : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>

      {hasFilter ? (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-colors hover:text-red-400"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={11} />
          Clear
        </button>
      ) : null}
    </div>
  )
}
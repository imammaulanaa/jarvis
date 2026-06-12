"use client"

import { useEffect, useState } from "react"

interface StatsResponse {
  stats: {
    total:    number
    healthy:  number
    degraded: number
    down:     number
    unknown:  number
  }
  overall:   "operational" | "degraded" | "outage"
  incidents: number
}

const OVERALL_CONFIG = {
  operational: { label: "All Systems Normal", color: "var(--green)", dot: "var(--green)" },
  degraded:    { label: "Partial Degradation", color: "var(--amber)", dot: "var(--amber)" },
  outage:      { label: "Service Outage",      color: "var(--red)",   dot: "var(--red)"   },
}

export default function SidebarStats() {
  const [data, setData] = useState<StatsResponse | null>(null)

  useEffect(() => {
    let active = true

    const load = () => {
      fetch("/api/stats")
        .then(r => (r.ok ? r.json() : null))
        .then(d => { if (active && d?.stats) setData(d as StatsResponse) })
        .catch(() => {})
    }

    load()
    const interval = setInterval(load, 60_000) // refresh tiap 60s

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  // Fallback saat loading / error
  const config = data ? OVERALL_CONFIG[data.overall] : OVERALL_CONFIG.operational
  const total     = data?.stats.total ?? "—"
  const incidents = data?.incidents ?? 0

  return (
    <div
      className="p-4 mx-3 mb-4 rounded-xl border"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: config.dot }}
        />
        <span className="text-[11px] font-semibold" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>
      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
        {total} services · {incidents} incident{incidents !== 1 ? "s" : ""}
      </p>
      {data && data.stats.unknown > 0 ? (
        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
          {data.stats.unknown} unknown status
        </p>
      ) : null}
    </div>
  )
}
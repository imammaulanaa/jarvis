"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/cn"
import type { ServiceStatus } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

const STATUS_OPTIONS = [
  { value: "healthy"  as ServiceStatus, label: "Healthy",  dot: "bg-green-400",  color: "text-green-400"  },
  { value: "degraded" as ServiceStatus, label: "Degraded", dot: "bg-yellow-400", color: "text-yellow-400" },
  { value: "down"     as ServiceStatus, label: "Down",     dot: "bg-red-400",    color: "text-red-400"    },
  { value: "unknown"  as ServiceStatus, label: "Unknown",  dot: "bg-gray-400",   color: "text-gray-400"   },
]

interface Props {
  slug:          string
  currentStatus: ServiceStatus
  token:         string
}

export default function StatusUpdateButton({ slug, currentStatus, token }: Props) {
  const [open, setOpen]              = useState(false)
  const [isPending, startTransition] = useTransition()
  const router                       = useRouter()

  const current = STATUS_OPTIONS.find(s => s.value === currentStatus) ?? STATUS_OPTIONS[3]

  const updateStatus = (status: ServiceStatus) => {
    setOpen(false)
    startTransition(async () => {
      try {
        await fetch(API_URL + "/api/services/" + slug + "/status", {
          method: "PATCH",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": "Bearer " + token,
          },
          body: JSON.stringify({ status }),
        })
        router.refresh()
      } catch {
        console.error("Failed to update status")
      }
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:border-sky-500/40 disabled:opacity-50"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-primary)" }}
      >
        {isPending
          ? <Loader2 size={11} className="animate-spin" />
          : <div className={cn("w-1.5 h-1.5 rounded-full", current.dot)} />
        }
        <span className={current.color}>{current.label}</span>
        <ChevronDown size={11} style={{ color: "var(--text-muted)" }} />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-20 rounded-xl border shadow-xl overflow-hidden min-w-[140px]"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-[10px] font-medium uppercase tracking-wider font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                Set Status
              </p>
            </div>
            {STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => updateStatus(option.value)}
                disabled={currentStatus === option.value}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-[var(--bg-primary)] text-left",
                  currentStatus === option.value ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", option.dot)} />
                <span className={option.color}>{option.label}</span>
                {currentStatus === option.value ? (
                  <span className="ml-auto text-[10px]" style={{ color: "var(--text-muted)" }}>current</span>
                ) : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

interface Props {
  slug:    string
  token:   string
  hasRepo: boolean
}

export default function SyncGitHubButton({ slug, token, hasRepo }: Props) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus]          = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage]        = useState("")
  const router                       = useRouter()

  const handleSync = () => {
    if (!hasRepo) return
    setStatus("idle")
    startTransition(async () => {
      try {
        const res = await fetch(
          API_URL + "/api/services/" + slug + "/sync-github",
          {
            method:  "POST",
            headers: { "Authorization": "Bearer " + token },
          }
        )
        const data = await res.json()
        if (!res.ok) {
          setStatus("error")
          setMessage((data as { error?: string }).error ?? "Sync failed")
          return
        }
        setStatus("success")
        const synced = (data as { synced?: { language?: string; stars?: number } }).synced
        setMessage(
          synced?.language
            ? "Synced · " + synced.language + " · " + (synced.stars ?? 0) + " stars"
            : "Synced successfully"
        )
        router.refresh()
        setTimeout(() => setStatus("idle"), 3000)
      } catch {
        setStatus("error")
        setMessage("Network error")
      }
    })
  }

  if (!hasRepo) return null

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSync}
        disabled={isPending}
        title="Sync metadata from GitHub"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
        style={{
          borderColor: "var(--border)",
          color:       "var(--text-muted)",
          background:  "var(--bg-primary)",
        }}
      >
        <RefreshCw
          size={12}
          className={isPending ? "animate-spin" : ""}
          style={{ color: "var(--accent)" }}
        />
        {isPending ? "Syncing..." : "Sync GitHub"}
      </button>

      {status === "success" ? (
        <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--green)" }}>
          <CheckCircle size={10} />
          {message}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--red)" }}>
          <AlertCircle size={10} />
          {message}
        </div>
      ) : null}
    </div>
  )
}
"use client"

import { useState, useTransition, useRef } from "react"
import { X, Upload, FileCode, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

const EXAMPLE_YAML = `apiVersion: jarvis.io/v1
kind: Service

metadata:
  name: My Service
  slug: my-service

spec:
  description: "What this service does"
  language: Go
  tier: tier-2
  repo_url: https://github.com/org/my-service
  tags:
    - backend
    - api`

interface Props { token: string }

interface ImportResult {
  status:  "created" | "updated"
  service: { name: string; slug: string }
  message: string
}

export default function ImportServiceModal({ token }: Props) {
  const [open, setOpen]              = useState(false)
  const [yaml, setYaml]              = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError]            = useState("")
  const [result, setResult]          = useState<ImportResult | null>(null)
  const fileRef                      = useRef<HTMLInputElement>(null)
  const router                       = useRouter()

  const reset = () => {
    setYaml("")
    setError("")
    setResult(null)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setYaml((ev.target?.result as string) ?? "")
    reader.readAsText(file)
  }

  const handleSubmit = () => {
    setError("")
    setResult(null)
    if (!yaml.trim()) {
      setError("YAML content is required")
      return
    }
    startTransition(async () => {
      try {
        const res = await fetch(API_URL + "/api/services/import", {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": "Bearer " + token,
          },
          body: JSON.stringify({ yaml }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(
            (data as { detail?: string }).detail ??
            (data as { error?: string }).error ??
            "Import failed"
          )
          return
        }
        setResult(data as ImportResult)
        router.refresh()
      } catch {
        setError("Network error — is the API running?")
      }
    })
  }

  const inputStyle = {
    background:  "var(--bg-primary)",
    borderColor: "var(--border)",
    color:       "var(--text-primary)",
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); reset() }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 border"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}
      >
        <FileCode size={15} />
        Import YAML
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setOpen(false)}
          />
          <div
            className="relative w-full max-w-xl rounded-2xl border flex flex-col shadow-2xl max-h-[90vh]"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  Import from catalog-info.yaml
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Paste YAML atau upload file catalog-info.yaml dari repo
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Success state */}
            {result ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--green-soft)" }}
                >
                  <CheckCircle size={28} style={{ color: "var(--green)" }} />
                </div>
                <div className="text-center">
                  <p className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                    Service {result.status === "created" ? "Created" : "Updated"}!
                  </p>
                  <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                    {result.service.name}
                  </p>
                  <p className="text-xs font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                    /{result.service.slug}
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={reset}
                    className="px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    Import Another
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, var(--accent), #4f46e5)" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

                  {/* Upload button */}
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".yaml,.yml"
                      className="hidden"
                      onChange={handleFile}
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-glow)]"
                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      <Upload size={16} />
                      Upload catalog-info.yaml
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>or paste YAML</span>
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  </div>

                  {/* YAML textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                        YAML Content
                      </label>
                      <button
                        onClick={() => setYaml(EXAMPLE_YAML)}
                        className="text-[11px] transition-colors hover:text-[var(--accent)]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Load example
                      </button>
                    </div>
                    <textarea
                      className="w-full px-3 py-2.5 rounded-xl border text-xs font-mono-jarvis outline-none focus:border-[var(--accent)] transition-colors resize-none"
                      style={{ ...inputStyle, minHeight: "220px", lineHeight: 1.7 }}
                      placeholder={EXAMPLE_YAML}
                      value={yaml}
                      onChange={e => setYaml(e.target.value)}
                      spellCheck={false}
                    />
                  </div>

                  {/* Error */}
                  {error ? (
                    <div
                      className="flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs"
                      style={{
                        background:  "rgba(239,68,68,0.05)",
                        borderColor: "rgba(239,68,68,0.2)",
                        color:       "var(--red)",
                      }}
                    >
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  ) : null}

                  {/* Schema hint */}
                  <div
                    className="px-3 py-2.5 rounded-xl border text-[11px] font-mono-jarvis"
                    style={{
                      background:  "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      color:       "var(--text-muted)",
                    }}
                  >
                    <p className="font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Required fields:
                    </p>
                    <p>metadata.name · metadata.slug · kind: Service</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPending || !yaml.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, var(--accent), #4f46e5)" }}
                  >
                    {isPending ? <Loader2 size={14} className="animate-spin" /> : <FileCode size={14} />}
                    {isPending ? "Importing..." : "Import Service"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
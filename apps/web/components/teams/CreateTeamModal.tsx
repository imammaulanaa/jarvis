"use client"

import { useState, useTransition } from "react"
import { X, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

interface Props {
  token: string
}

export default function CreateTeamModal({ token }: Props) {
  const [open, setOpen]              = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError]            = useState("")
  const router                       = useRouter()

  const [form, setForm] = useState({
    slug: "", name: "", description: "",
  })

  const handleSubmit = async () => {
    setError("")
    if (!form.slug || !form.name) {
      setError("Slug and name are required")
      return
    }
    startTransition(async () => {
      try {
        const res = await fetch(API_URL + "/api/teams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
          },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) {
          setError((data as { error?: string }).error ?? "Failed to create team")
          return
        }
        setOpen(false)
        setForm({ slug: "", name: "", description: "" })
        router.refresh()
      } catch {
        setError("Network error")
      }
    })
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-sky-500 transition-colors"
  const inputStyle = {
    background: "var(--bg-primary)",
    borderColor: "var(--border)",
    color: "var(--text-primary)",
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Plus size={15} />
        Create Team
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border p-6 flex flex-col gap-4 shadow-2xl"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  Create Team
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Add a new team to JARVIS
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-primary)] transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                  Name *
                </label>
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Platform Team"
                  value={form.name}
                  onChange={e => {
                    const name = e.target.value
                    const slug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")
                    setForm(f => ({ ...f, name, slug }))
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                  Slug *
                </label>
                <input
                  className={inputClass + " font-mono-jarvis"}
                  style={inputStyle}
                  placeholder="platform-team"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                  Description
                </label>
                <textarea
                  className={inputClass}
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="What does this team own?"
                  rows={2}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            {error ? (
              <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">
                {error}
              </p>
            ) : null}

            <div className="flex gap-2 pt-1">
                        <button
                            onClick={() => setOpen(false)}
                            className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-[var(--bg-primary)]"
                            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="flex-1 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            {isPending ? "Creating..." : "Create Team"}
                        </button>
                        </div>
                    </div>
                    </div>
                ) : null}
                </>
            )
            }
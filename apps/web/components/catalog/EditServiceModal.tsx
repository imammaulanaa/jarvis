"use client"

import { useState, useTransition } from "react"
import { X, Save, Loader2, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import TagInput from "./TagInput"
import type { Service, ServiceTier } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

interface Props {
  service: Service
  token:   string
}

export default function EditServiceModal({ service, token }: Props) {
  const [open, setOpen]              = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError]            = useState("")
  const router                       = useRouter()

  const [form, setForm] = useState({
    name:        service.name,
    description: service.description ?? "",
    language:    service.language    ?? "",
    tier:        service.tier        as ServiceTier,
    repo_url:    service.repo_url    ?? "",
    docs_url:    service.docs_url    ?? "",
    tags:        service.tags        ?? [] as string[],
  })

  const handleSubmit = async () => {
    setError("")
    if (!form.name) {
      setError("Name is required")
      return
    }
    startTransition(async () => {
      try {
        const res = await fetch(API_URL + "/api/services/" + service.slug, {
          method: "PUT",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": "Bearer " + token,
          },
          body: JSON.stringify({
            slug:        service.slug,
            name:        form.name,
            description: form.description || undefined,
            language:    form.language    || undefined,
            tier:        form.tier,
            repo_url:    form.repo_url    || undefined,
            docs_url:    form.docs_url    || undefined,
            tags:        form.tags,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError((data as { error?: string }).error ?? "Failed to update service")
          return
        }
        setOpen(false)
        router.refresh()
      } catch {
        setError("Network error")
      }
    })
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-sky-500 transition-colors"
  const inputStyle = { background: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors hover:border-sky-500/40 hover:text-sky-400"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        <Pencil size={13} />
        Edit
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setOpen(false)}
          />
          <div
            className="relative w-full max-w-lg rounded-2xl border p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  Edit Service
                </h2>
                <p className="text-xs mt-0.5 font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                  {service.slug}
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
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                  Description
                </label>
                <textarea
                  className={inputClass}
                  style={{ ...inputStyle, resize: "none" }}
                  rows={2}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                    Language
                  </label>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={form.language}
                    onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                  >
                    <option value="">Select...</option>
                    {["Go", "TypeScript", "Python", "Java", "Rust", "Ruby", "PHP"].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                    Tier
                  </label>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={form.tier}
                    onChange={e => setForm(f => ({ ...f, tier: e.target.value as ServiceTier }))}
                  >
                    <option value="tier-1">Tier 1 — Critical</option>
                    <option value="tier-2">Tier 2 — Important</option>
                    <option value="tier-3">Tier 3 — Internal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                  GitHub Repo URL
                </label>
                <input
                  className={inputClass + " font-mono-jarvis"}
                  style={inputStyle}
                  placeholder="https://github.com/org/repo"
                  value={form.repo_url}
                  onChange={e => setForm(f => ({ ...f, repo_url: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                  Docs URL
                </label>
                <input
                  className={inputClass + " font-mono-jarvis"}
                  style={inputStyle}
                  placeholder="https://docs.company.com/service"
                  value={form.docs_url}
                  onChange={e => setForm(f => ({ ...f, docs_url: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                  Tags
                  <span className="ml-1 font-normal" style={{ color: "var(--text-muted)" }}>
                    (Enter atau koma untuk tambah)
                  </span>
                </label>
                <TagInput
                  tags={form.tags}
                  onChange={tags => setForm(f => ({ ...f, tags }))}
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
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { X, Boxes, Loader2, Link2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

interface Namespace { name: string }
interface Deployment {
  name:             string
  ready_replicas:   number
  desired_replicas: number
  image:            string
  healthy:          boolean
}

interface Props {
  slug:    string
  token:   string
  current?: { namespace?: string; deployment?: string }
}

export default function LinkDeploymentModal({ slug, token, current }: Props) {
  const [open, setOpen]               = useState(false)
  const [namespaces, setNamespaces]   = useState<Namespace[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [namespace, setNamespace]     = useState(current?.namespace ?? "")
  const [deployment, setDeployment]   = useState(current?.deployment ?? "")
  const [loading, setLoading]         = useState(false)
  const [isPending, startTransition]  = useTransition()
  const [error, setError]             = useState("")
  const router                        = useRouter()

  const authHeader = { Authorization: "Bearer " + token }

  // Load namespaces saat modal dibuka
  useEffect(() => {
    if (!open) return
    fetch(API_URL + "/api/k8s/namespaces", { headers: authHeader })
      .then(r => r.json())
      .then(d => setNamespaces((d as { namespaces?: Namespace[] }).namespaces ?? []))
      .catch(() => setError("Failed to load namespaces — k8s available?"))
  }, [open])

  useEffect(() => {
    if (!namespace) {
      setDeployments([])
      return
    }
    setLoading(true)
    fetch(API_URL + "/api/k8s/deployments?namespace=" + namespace, { headers: authHeader })
      .then(r => r.json())
      .then(d => setDeployments((d as { deployments?: Deployment[] }).deployments ?? []))
      .finally(() => setLoading(false))
  }, [namespace])

  const handleSubmit = () => {
    if (!namespace || !deployment) {
      setError("Pilih namespace + deployment")
      return
    }
    setError("")
    startTransition(async () => {
      try {
        const res = await fetch(
          API_URL + "/api/services/" + slug + "/link-deployment",
          {
            method:  "POST",
            headers: { ...authHeader, "Content-Type": "application/json" },
            body:    JSON.stringify({ namespace, deployment }),
          }
        )
        if (!res.ok) {
          const d = await res.json()
          setError((d as { error?: string }).error ?? "Link failed")
          return
        }
        setOpen(false)
        router.refresh()
      } catch {
        setError("Network error")
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-primary)" }}
      >
        <Link2 size={12} />
        {current?.deployment ? "Re-link Deployment" : "Link Deployment"}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setOpen(false)}
          />
          <div
            className="relative w-full max-w-md rounded-2xl border flex flex-col shadow-2xl"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <Boxes size={16} style={{ color: "var(--accent)" }} />
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  Link to Kubernetes Deployment
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--bg-secondary)]"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Namespace */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                  Namespace
                </label>
                <select
                  value={namespace}
                  onChange={e => { setNamespace(e.target.value); setDeployment("") }}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)]"
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="">Pilih namespace...</option>
                  {namespaces.map(ns => (
                    <option key={ns.name} value={ns.name}>{ns.name}</option>
                  ))}
                </select>
              </div>

              {/* Deployment */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                  Deployment
                </label>
                <select
                  value={deployment}
                  onChange={e => setDeployment(e.target.value)}
                  disabled={!namespace || loading}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] disabled:opacity-50"
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="">
                    {loading ? "Loading..." : !namespace ? "Pilih namespace dulu" : "Pilih deployment..."}
                  </option>
                  {deployments.map(dep => (
                    <option key={dep.name} value={dep.name}>
                      {dep.name} ({dep.ready_replicas}/{dep.desired_replicas})
                    </option>
                  ))}
                </select>
              </div>

              {error ? (
                <div className="text-xs px-3 py-2 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", color: "var(--red)" }}>
                  {error}
                </div>
              ) : null}
            </div>

            <div className="p-6 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium hover:bg-[var(--bg-secondary)]"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !namespace || !deployment}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, var(--accent), #4f46e5)" }}
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                {isPending ? "Linking..." : "Link Deployment"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
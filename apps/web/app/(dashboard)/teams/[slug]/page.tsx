import { notFound } from "next/navigation"
import { ArrowLeft, Users, LayoutGrid } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiFetch } from "@/lib/api"
import ServiceCard from "@/components/catalog/ServiceCard"
import type { TeamDetail } from "@/lib/types"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params

  let detail: TeamDetail
  try {
    detail = await apiFetch<TeamDetail>("/api/teams/" + slug)
  } catch {
    notFound()
  }

  const { team, members, services } = detail

  return (
    <div className="max-w-5xl">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors hover:text-sky-400"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={13} />
        Back to Teams
      </Link>

      {/* Hero */}
      <div
        className="rounded-2xl border p-6 mb-6"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-600/30 flex items-center justify-center">
            <span className="text-xl font-bold text-sky-400">
              {team.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {team.name}
            </h1>
            <p className="text-xs font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
              {team.slug}
            </p>
          </div>
        </div>
        {team.description ? (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {team.description}
          </p>
        ) : null}
      </div>

      {/* Members */}
      <div
        className="rounded-xl border p-5 mb-6"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} style={{ color: "var(--text-muted)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Members ({members?.length ?? 0})
          </h2>
        </div>

        {members && members.length > 0 ? (
          <div className="flex flex-col gap-2">
            {members.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-3 py-2 border-b last:border-0"
                style={{ borderColor: "var(--border)" }}
              >
                {member.avatar_url ? (
                  <Image
                    src={member.avatar_url}
                    alt={member.username}
                    width={28}
                    height={28}
                    className="rounded-full border"
                    style={{ borderColor: "var(--border)" }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-xs font-bold text-white">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {member.name ?? member.username}
                  </p>
                  <p className="text-[11px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                    @{member.username}
                  </p>
                </div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-mono-jarvis capitalize"
                  style={{
                    background: "var(--bg-primary)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>
            No members yet
          </p>
        )}
      </div>

      {/* Services */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid size={14} style={{ color: "var(--text-muted)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Services ({services?.length ?? 0})
          </h2>
        </div>

        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl border p-8 text-center"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Tim ini belum memiliki service. Assign service ke tim ini dari halaman Service Catalog.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
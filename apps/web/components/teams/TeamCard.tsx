import Link from "next/link"
import { Users, LayoutGrid } from "lucide-react"
import type { Team } from "@/lib/types"

interface Props {
  team: Team
  memberCount?: number
  serviceCount?: number
}

export default function TeamCard({ team, memberCount = 0, serviceCount = 0 }: Props) {
  return (
    <Link href={"/teams/" + team.slug} className="block group">
      <div
        className="rounded-xl border p-5 transition-all duration-200 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-600/30 flex items-center justify-center mb-4">
          <span className="text-lg font-bold text-sky-400">
            {team.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <h3
          className="font-semibold text-sm mb-1 group-hover:text-sky-400 transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          {team.name}
        </h3>
        <p className="text-xs font-mono-jarvis mb-3" style={{ color: "var(--text-muted)" }}>
          {team.slug}
        </p>

        {team.description ? (
          <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
            {team.description}
          </p>
        ) : null}

        <div
          className="flex items-center gap-4 pt-3 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <Users size={11} />
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <LayoutGrid size={11} />
            {serviceCount} service{serviceCount !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </Link>
  )
}
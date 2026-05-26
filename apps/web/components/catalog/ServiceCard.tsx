"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { GitBranch, ExternalLink, Tag } from "lucide-react"
import { cn } from "@/lib/cn"
import type { Service } from "@/lib/types"

const STATUS_CONFIG = {
  healthy:  { label: "Healthy",  dot: "bg-emerald-400", text: "text-emerald-500", bg: "bg-emerald-50",  darkBg: "dark:bg-emerald-950/30", glow: "shadow-emerald-400/20" },
  degraded: { label: "Degraded", dot: "bg-amber-400",   text: "text-amber-500",   bg: "bg-amber-50",    darkBg: "dark:bg-amber-950/30",   glow: "shadow-amber-400/20"   },
  down:     { label: "Down",     dot: "bg-red-400",     text: "text-red-500",     bg: "bg-red-50",      darkBg: "dark:bg-red-950/30",     glow: "shadow-red-400/20"     },
  unknown:  { label: "Unknown",  dot: "bg-slate-400",   text: "text-slate-500",   bg: "bg-slate-100",   darkBg: "dark:bg-slate-900/30",   glow: "shadow-slate-400/10"   },
}

const TIER_CONFIG = {
  "tier-1": { label: "T1", full: "Tier 1", color: "text-red-500",    bg: "bg-red-50    dark:bg-red-950/20",    border: "border-red-200    dark:border-red-900"    },
  "tier-2": { label: "T2", full: "Tier 2", color: "text-amber-500",  bg: "bg-amber-50  dark:bg-amber-950/20",  border: "border-amber-200  dark:border-amber-900"  },
  "tier-3": { label: "T3", full: "Tier 3", color: "text-slate-500",  bg: "bg-slate-50  dark:bg-slate-900/30",  border: "border-slate-200  dark:border-slate-800"  },
}

const LANG_COLORS: Record<string, string> = {
  Go:         "text-cyan-500",
  TypeScript: "text-blue-500",
  Python:     "text-yellow-500",
  Java:       "text-orange-500",
  Rust:       "text-orange-600",
}

interface Props { service: Service }

export default function ServiceCard({ service }: Props) {
  const router    = useRouter()
  const status    = STATUS_CONFIG[service.status] ?? STATUS_CONFIG.unknown
  const tier      = TIER_CONFIG[service.tier]     ?? TIER_CONFIG["tier-3"]
  const langColor = service.language ? (LANG_COLORS[service.language] ?? "text-slate-500") : "text-slate-400"

  return (
    <Link href={"/catalog/" + service.slug} className="block group">
      <div
        className="card-hover rounded-2xl border p-5 transition-all duration-200 h-full flex flex-col gap-3 cursor-pointer"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        {/* Top */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3
              className="font-semibold text-sm truncate transition-colors group-hover:text-[var(--accent)]"
              style={{ color: "var(--text-primary)" }}
            >
              {service.name}
            </h3>
            <p className="text-[11px] font-mono-jarvis mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
              {service.slug}
            </p>
          </div>

          {/* Status pill */}
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0",
            status.bg, status.darkBg
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", status.dot)} />
            <span className={status.text}>{status.label}</span>
          </div>
        </div>

        {/* Description */}
        {service.description ? (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
            {service.description}
          </p>
        ) : null}

        {/* Tier + Language */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-lg border font-mono-jarvis",
            tier.color, tier.bg, tier.border
          )}>
            {tier.full}
          </span>
          {service.language ? (
            <span className={"text-[11px] font-semibold font-mono-jarvis " + langColor}>
              {service.language}
            </span>
          ) : null}
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag size={10} style={{ color: "var(--text-muted)" }} />
            {service.tags.slice(0, 3).map(tag => (
              <button
                key={tag}
                onClick={e => { e.preventDefault(); router.push("/catalog?tags=" + tag) }}
                className="text-[10px] px-2 py-0.5 rounded-lg font-mono-jarvis transition-all hover:text-[var(--accent)] hover:bg-[var(--accent-glow)]"
                style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                {tag}
              </button>
            ))}
            {service.tags.length > 3 ? (
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                +{service.tags.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Bottom */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t" style={{ borderColor: "var(--border-soft)" }}>
          {service.repo_url ? (
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <GitBranch size={11} />
              <span className="font-mono-jarvis truncate max-w-[140px]">
                {service.repo_url.replace("https://github.com/", "")}
              </span>
            </div>
          ) : (
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>No repo linked</span>
          )}
          <ExternalLink
            size={12}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--accent)" }}
          />
        </div>
      </div>
    </Link>
  )
}
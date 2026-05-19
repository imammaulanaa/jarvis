import Link from "next/link"
import { GitBranch, ExternalLink, Tag } from "lucide-react"
import { cn } from "@/lib/cn"
import type { Service } from "@/lib/types"

const STATUS_CONFIG = {
  healthy:  { label: "Healthy",  dot: "bg-green-400",  text: "text-green-400",  bg: "bg-green-400/10"  },
  degraded: { label: "Degraded", dot: "bg-yellow-400", text: "text-yellow-400", bg: "bg-yellow-400/10" },
  down:     { label: "Down",     dot: "bg-red-400",    text: "text-red-400",    bg: "bg-red-400/10"    },
  unknown:  { label: "Unknown",  dot: "bg-gray-400",   text: "text-gray-400",   bg: "bg-gray-400/10"   },
}

const TIER_CONFIG = {
  "tier-1": { label: "Tier 1", color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20"    },
  "tier-2": { label: "Tier 2", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  "tier-3": { label: "Tier 3", color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/20"   },
}

const LANG_COLORS: Record<string, string> = {
  Go:         "text-sky-400",
  TypeScript: "text-blue-400",
  Python:     "text-yellow-400",
  Java:       "text-orange-400",
  Rust:       "text-orange-600",
}

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const status   = STATUS_CONFIG[service.status] ?? STATUS_CONFIG.unknown
  const tier     = TIER_CONFIG[service.tier]     ?? TIER_CONFIG["tier-3"]
  const langColor = service.language
    ? (LANG_COLORS[service.language] ?? "text-gray-400")
    : "text-gray-500"

  return (
    <Link href={"/catalog/" + service.slug} className="block group">
      <div
        className={cn(
          "rounded-xl border p-5 transition-all duration-200 h-full flex flex-col gap-3",
          "hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5"
        )}
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        {/* Top — name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className="font-semibold text-sm truncate group-hover:text-sky-400 transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              {service.name}
            </h3>
            <p className="text-xs font-mono-jarvis mt-0.5" style={{ color: "var(--text-muted)" }}>
              {service.slug}
            </p>
          </div>
          <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg shrink-0 text-xs font-medium", status.bg)}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", status.dot)} />
            <span className={status.text}>{status.label}</span>
          </div>
        </div>

        {/* Description */}
        {service.description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
            {service.description}
          </p>
        )}

        {/* Tier + Language */}
        <div className="flex items-center gap-2">
          <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-md border", tier.color, tier.bg, tier.border)}>
            {tier.label}
          </span>
          {service.language && (
            <span className={"text-[11px] font-medium font-mono-jarvis " + langColor}>
              {service.language}
            </span>
          )}
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag size={10} style={{ color: "var(--text-muted)" }} />
            {service.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded font-mono-jarvis"
                style={{
                  background: "var(--bg-primary)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {tag}
              </span>
            ))}
            {service.tags.length > 3 && (
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                +{service.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom — repo */}
        <div
          className="mt-auto pt-2 flex items-center justify-between border-t"
          style={{ borderColor: "var(--border)" }}
        >
          {service.repo_url ? (
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <GitBranch size={11} />
              <span className="font-mono-jarvis truncate max-w-[160px]">
                {service.repo_url.replace("https://github.com/", "")}
              </span>
            </div>
          ) : (
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              No repo linked
            </span>
          )}
          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-400" />
        </div>
      </div>
    </Link>
  )
}
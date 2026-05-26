"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Rocket, Settings, Wand2, Users, Zap } from "lucide-react"
import { cn } from "@/lib/cn"

const NAV_ITEMS = [
  { label: "Catalog",      href: "/catalog",     icon: LayoutGrid, desc: "Service registry"    },
  { label: "Teams",        href: "/teams",        icon: Users,      desc: "Team management"     },
  { label: "Deployments",  href: "/deployments",  icon: Rocket,     badge: "Phase 4"            },
  { label: "Provisioning", href: "/provisioning", icon: Settings,   badge: "Phase 5"            },
  { label: "Onboarding",   href: "/onboarding",   icon: Wand2,      badge: "Phase 6"            },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-60 shrink-0 flex flex-col min-h-screen border-r transition-colors"
      style={{ background: "var(--bg-sidebar)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--cyan))",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <Zap size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none font-mono-jarvis gradient-text">
            JARVIS
          </p>
          <p className="text-[10px] leading-none mt-1" style={{ color: "var(--text-muted)" }}>
            v1.0 · Platform Portal
          </p>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>
          Navigation
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon     = item.icon
          const isActive = pathname.startsWith(item.href)
          const isFuture = !!item.badge

          return (
            <Link
              key={item.href}
              href={isFuture ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive    ? "nav-active-glow text-white"     : "",
                isFuture    ? "cursor-not-allowed opacity-40"  : "",
                !isActive && !isFuture ? "hover:bg-[var(--accent-glow)]" : "",
              )}
              style={
                isActive
                  ? { background: "linear-gradient(135deg, var(--accent), #4f46e5)" }
                  : {}
              }
            >
              <Icon
                size={16}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-white" : "group-hover:text-[var(--accent)]"
                )}
                style={isActive ? {} : { color: "var(--text-muted)" }}
              />
              <div className="flex-1 min-w-0">
                <p className={isActive ? "text-white" : ""} style={isActive ? {} : { color: "var(--text-secondary)" }}>
                  {item.label}
                </p>
              </div>
              {item.badge ? (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-mono-jarvis font-medium"
                  style={{ background: "var(--border)", color: "var(--text-muted)" }}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* Infra status */}
      <div className="p-4 mx-3 mb-4 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
          <span className="text-[11px] font-semibold" style={{ color: "var(--green)" }}>
            All Systems Normal
          </span>
        </div>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          4 services · 0 incidents
        </p>
      </div>
    </aside>
  )
}
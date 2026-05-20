"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Rocket, Settings, Wand2, ChevronRight, Terminal, Users } from "lucide-react"
import { cn } from "@/lib/cn"

const NAV_ITEMS = [
  { label: "Catalog", href: "/catalog", icon: LayoutGrid, desc: "Service registry" },
  { label: "Deployments", href: "/deployments", icon: Rocket, badge: "Phase 4" },
  { label: "Provisioning", href: "/provisioning", icon: Settings, badge: "Phase 5" },
  { label: "Onboarding", href: "/onboarding", icon: Wand2, badge: "Phase 6" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 flex flex-col min-h-screen border-r transition-colors"
      style={{ background: "var(--bg-sidebar)", borderColor: "var(--border)" }}>

      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b"
        style={{ borderColor: "var(--border)" }}>
        <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center shrink-0">
          <Terminal size={13} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none font-mono-jarvis"
            style={{ color: "var(--text-primary)" }}>
            JARVIS
          </p>
          <p className="text-[10px] leading-none mt-0.5 font-mono-jarvis"
            style={{ color: "var(--text-muted)" }}>
            v1.0.0-alpha
          </p>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-4 pt-4 pb-1">
        <p className="text-[10px] font-semibold tracking-widest uppercase font-mono-jarvis"
          style={{ color: "var(--text-muted)" }}>
          Navigation
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          const isFuture = !!item.badge

          return (
            <Link
              key={item.href}
              href={isFuture ? "#" : item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group relative",
                isActive
                  ? "bg-sky-500/10 border border-sky-500/20"
                  : isFuture
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-[var(--bg-secondary)] border border-transparent"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-sky-400 rounded-full" />
              )}
              <Icon
                size={15}
                className={isActive ? "text-sky-400" : ""}
                style={{ color: isActive ? undefined : "var(--text-secondary)" }}
              />
              <span className={cn("flex-1 font-medium text-[13px]",
                isActive ? "text-sky-400" : "")}
                style={{ color: isActive ? undefined : "var(--text-primary)" }}>
                {item.label}
              </span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono-jarvis"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight size={12} className="text-sky-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
          style={{ background: "var(--green-soft)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
          <span className="text-[11px] font-mono-jarvis" style={{ color: "var(--green)" }}>
            All systems normal
          </span>
        </div>
      </div>
    </aside>
  )
}
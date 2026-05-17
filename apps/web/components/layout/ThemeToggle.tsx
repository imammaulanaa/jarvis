"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { useSyncExternalStore } from "react"
import { cn } from "@/lib/cn"

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb)
  return () => window.removeEventListener("storage", cb)
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  if (!mounted) return <div className="w-8 h-8" />

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ]

  return (
    <div
      className="flex items-center gap-0.5 p-1 rounded-lg border"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center transition-all",
            theme === value
              ? "text-sky-400 bg-sky-400/10"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          )}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  )
}
import { auth, signOut } from "@/lib/auth"
import { LogOut, Bell, Search } from "lucide-react"
import Image from "next/image"
import { Suspense } from "react"
import ThemeToggle from "./ThemeToggle"
import CatalogSearchBar from "@/components/catalog/CatalogSearchBar"
import type { Session } from "next-auth"

type JarvisUser = {
  avatar_url?: string
  username?:   string
  name?:       string
  image?:      string
  email?:      string
}

type JarvisSession = Session & {
  role?: string
  user:  JarvisUser
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export default async function Topbar() {
  const session = (await auth()) as JarvisSession | null
  const u       = session?.user as JarvisUser | undefined

  const avatarUrl   = u?.avatar_url ?? u?.image ?? null
  const displayName = u?.name       ?? u?.username ?? "Developer"
  const firstName   = displayName.split(" ")[0]
  const role        = session?.role ?? "member"

  return (
    <header
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-10 border-b backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--bg-primary) 85%, transparent)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Left — greeting */}
      <div>
        <p className="text-sm font-bold leading-none" style={{ color: "var(--text-primary)" }}>
          {getGreeting()}, <span className="gradient-text">{firstName}</span>.
        </p>
        <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
          Your infrastructure is performing well today
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Suspense fallback={
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border w-52"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
          >
            <Search size={13} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Search services...</span>
          </div>
        }>
          <CatalogSearchBar />
        </Suspense>

        <ThemeToggle />

        {/* Notification */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-[var(--accent-glow)]"
          style={{ border: "1px solid var(--border)" }}
        >
          <Bell size={15} style={{ color: "var(--text-secondary)" }} />
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--red)", boxShadow: "0 0 6px var(--red)" }}
          />
        </button>

        <div className="w-px h-6 mx-1" style={{ background: "var(--border)" }} />

        {/* User */}
        <div className="flex items-center gap-2.5">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={34}
              height={34}
              className="rounded-xl"
              style={{ border: "2px solid var(--accent)", boxShadow: "0 0 0 3px var(--accent-glow)" }}
            />
          ) : (
            <div
              className="w-[34px] h-[34px] rounded-xl flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}
            >
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-none" style={{ color: "var(--text-primary)" }}>
              {displayName}
            </p>
            <p className="text-[10px] leading-none mt-1 capitalize font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
              {role}
            </p>
          </div>
        </div>

        <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }) }}>
          <button
            type="submit"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-500/10 hover:text-red-400"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </form>
      </div>
    </header>
  )
}
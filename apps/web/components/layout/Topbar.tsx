import { auth, signOut } from "@/lib/auth"
import { LogOut, Bell, Search } from "lucide-react"
import Image from "next/image"
import ThemeToggle from "./ThemeToggle"
import type { Session } from "next-auth"

type JarvisSession = Session & {
  role?: string
  user: Session["user"] & {
    avatar_url?: string
    username?: string
  }
}

export default async function Topbar() {
  const session = (await auth()) as JarvisSession | null
  const user = session?.user

  const avatarUrl   = user?.avatar_url ?? null
  const displayName = user?.name ?? user?.username ?? "Unknown"
  const role        = session?.role ?? "member"

  return (
    <header
      className="h-14 flex items-center justify-between px-5 sticky top-0 z-10 border-b backdrop-blur-sm transition-colors"
      style={{
        background: "color-mix(in srgb, var(--bg-primary) 80%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      {/* Left — search bar */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border w-56 cursor-pointer"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <Search size={13} style={{ color: "var(--text-muted)" }} />
        <span className="text-xs font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
          Search services...
        </span>
        <span
          className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono-jarvis"
          style={{ background: "var(--bg-primary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
        >
          {"⌘K"}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />

        <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-secondary)]">
          <Bell size={15} style={{ color: "var(--text-secondary)" }} />
        </button>

        <div className="flex items-center gap-2 pl-1">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={28}
              height={28}
              className="rounded-full border"
              style={{ borderColor: "var(--border)" }}
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-xs font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-none" style={{ color: "var(--text-primary)" }}>
              {displayName}
            </p>
            <p className="text-[10px] leading-none mt-0.5 font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
              {role}
            </p>
          </div>
        </div>

        <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }) }}>
          <button
            type="submit"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:text-red-400 hover:bg-red-400/10"
            style={{ color: "var(--text-muted)" }}
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </form>
      </div>
    </header>
  )
}
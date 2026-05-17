import { auth, signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Terminal } from "lucide-react"

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/catalog")

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg"
      style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="rounded-2xl border p-8 flex flex-col items-center gap-6 backdrop-blur-sm"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center">
              <Terminal size={22} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold font-mono-jarvis" style={{ color: "var(--text-primary)" }}>
                JARVIS
              </h1>
              <p className="text-xs mt-1 font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                Internal Developer Portal
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
              sign in to continue
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* Login button */}
          <form
            action={async () => {
              "use server"
              await signIn("github", { redirectTo: "/catalog" })
            }}
            className="w-full"
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </form>

          <p className="text-[11px] text-center font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
            Access restricted to authorized accounts only
          </p>
        </div>

        {/* Version tag */}
        <p className="text-center text-[11px] mt-4 font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
          JARVIS v1.0.0-alpha · Phase 0
        </p>
      </div>
    </div>
  )
}
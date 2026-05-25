import { auth, signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Zap, Shield, Activity } from "lucide-react"

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/catalog")

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-secondary)" }}
    >
      {/* Background decoration */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, var(--accent) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[200px] opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, var(--cyan) 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-md relative z-10 px-4">

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Logo + title */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--cyan))",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              <Zap size={28} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold font-mono-jarvis gradient-text">JARVIS</h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Just A Really Versatile Infrastructure System
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {[
              { icon: Shield,   label: "Secure" },
              { icon: Activity, label: "Real-time" },
              { icon: Zap,      label: "Fast"   },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
                style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent-soft)" }}
              >
                <Icon size={10} />
                {label}
              </div>
            ))}
          </div>

          {/* Login button */}
          <form
            action={async () => {
              "use server"
              await signIn("github", { redirectTo: "/catalog" })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] text-white mb-4"
              style={{
                background: "linear-gradient(135deg, var(--accent), #4f46e5)",
                boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </form>

          <p className="text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
            Access restricted to authorized engineers only
          </p>
        </div>

        <p className="text-center text-[11px] mt-4 font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
          JARVIS v1.0 · Phase 1 Complete
        </p>
      </div>
    </div>
  )
}
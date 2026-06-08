import { ShieldCheck, ShieldAlert, Check, X, GitBranch } from "lucide-react"
import { parseGitHubUrl } from "@/lib/github"
import { apiFetch } from "@/lib/api"

interface BranchProtectionData {
  protection: {
    protected:              boolean
    branch:                 string
    required_reviews:       number
    require_code_owner:     boolean
    required_status_checks: string[]
    enforce_admins:         boolean
    allow_force_push:       boolean
  }
  tier: string
  risk: "low" | "medium" | "high" | "critical"
}

const RISK_CONFIG = {
  low:      { color: "var(--green)", bg: "var(--green-soft)",     label: "Low Risk"      },
  medium:   { color: "var(--amber)", bg: "rgba(245,158,11,0.1)",  label: "Medium Risk"   },
  high:     { color: "#f97316",      bg: "rgba(249,115,22,0.1)",  label: "High Risk"     },
  critical: { color: "var(--red)",   bg: "rgba(239,68,68,0.1)",   label: "Critical Risk" },
}

interface Props {
  slug:    string
  repoUrl: string
}

export default async function BranchProtectionCard({ slug, repoUrl }: Props) {
  if (!parseGitHubUrl(repoUrl)) return null

  let data: BranchProtectionData
  try {
    data = await apiFetch<BranchProtectionData>(
      "/api/services/" + slug + "/branch-protection"
    )
  } catch {
    return null
  }

  const { protection, risk } = data
  const isProtected = protection.protected
  const statusChecks = protection.required_status_checks ?? []

  const rules = [
    {
      label:  "Pull request reviews required",
      active: protection.required_reviews > 0,
      detail: protection.required_reviews > 0 ? protection.required_reviews + " approval(s)" : null,
    },
    {
      label:  "Code owner review required",
      active: protection.require_code_owner,
      detail: null,
    },
    {
      label:  "Status checks required",
      active: statusChecks.length > 0,
      detail: statusChecks.length > 0 ? statusChecks.length + " check(s)" : null,
    },
    {
      label:  "Enforce for admins",
      active: protection.enforce_admins,
      detail: null,
    },
    {
      label:  "Force push blocked",
      active: !protection.allow_force_push,
      detail: null,
    },
  ]

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isProtected ? (
            <ShieldCheck size={15} style={{ color: "var(--green)" }} />
          ) : (
            <ShieldAlert size={15} style={{ color: RISK_CONFIG[risk].color }} />
          )}
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Branch Protection
          </h2>
          <span className="text-[11px] flex items-center gap-1 font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
            <GitBranch size={9} />
            {protection.branch}
          </span>
        </div>
        {isProtected ? (
          <span
            className="text-[10px] px-2 py-1 rounded-full font-semibold"
            style={{ background: "var(--green-soft)", color: "var(--green)" }}
          >
            Protected
          </span>
        ) : (
          <span
            className="text-[10px] px-2 py-1 rounded-full font-semibold"
            style={{ background: RISK_CONFIG[risk].bg, color: RISK_CONFIG[risk].color }}
          >
            {RISK_CONFIG[risk].label}
          </span>
        )}
      </div>

      {!isProtected ? (
        <div
          className="flex items-start gap-2 p-3 rounded-xl mb-3"
          style={{ background: RISK_CONFIG[risk].bg }}
        >
          <ShieldAlert size={14} className="shrink-0 mt-0.5" style={{ color: RISK_CONFIG[risk].color }} />
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Default branch <b>{protection.branch}</b> tidak punya proteksi.
            {data.tier === "tier-1" || data.tier === "tier-2"
              ? " Service " + data.tier + " sebaiknya wajib PR review + CI check."
              : " Pertimbangkan tambah branch protection."}
          </p>
        </div>
      ) : null}

      {/* Rules checklist */}
      <div className="flex flex-col gap-2">
        {rules.map(rule => (
          <div key={rule.label} className="flex items-center gap-2">
            {rule.active ? (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "var(--green-soft)" }}
              >
                <Check size={10} style={{ color: "var(--green)" }} />
              </div>
            ) : (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
              >
                <X size={10} style={{ color: "var(--text-muted)" }} />
              </div>
            )}
            <span
              className="text-xs flex-1"
              style={{ color: rule.active ? "var(--text-secondary)" : "var(--text-muted)" }}
            >
              {rule.label}
            </span>
            {rule.detail ? (
              <span className="text-[10px] font-mono-jarvis" style={{ color: "var(--text-muted)" }}>
                {rule.detail}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
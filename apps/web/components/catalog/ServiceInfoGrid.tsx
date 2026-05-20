import { Calendar, Link2, Activity, Layers } from "lucide-react"
import type { Service } from "@/lib/types"

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider font-mono-jarvis"
        style={{ color: "var(--text-muted)" }}
      >
        {icon}
        {label}
      </div>
      <div className="text-sm" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
    </div>
  )
}

interface Props {
  service: Service
}

export default function ServiceInfoGrid({ service }: Props) {
  const createdAt = new Date(service.created_at).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  })
  const updatedAt = new Date(service.updated_at).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  })

  const dashboardUrl = service.dashboard_url ?? null
  const oncallUrl    = service.oncall_url    ?? null

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Service Information
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
        <InfoItem
          icon={<Layers size={11} />}
          label="Lifecycle"
          value={<span className="capitalize font-medium">{service.lifecycle}</span>}
        />
        <InfoItem
          icon={<Activity size={11} />}
          label="Language"
          value={<span className="font-mono-jarvis">{service.language ?? "—"}</span>}
        />
        <InfoItem
          icon={<Layers size={11} />}
          label="Tier"
          value={<span className="font-mono-jarvis">{service.tier}</span>}
        />
        <InfoItem
          icon={<Calendar size={11} />}
          label="Created"
          value={createdAt}
        />
        <InfoItem
          icon={<Calendar size={11} />}
          label="Last Updated"
          value={updatedAt}
        />
        {dashboardUrl ? (
          <InfoItem
            icon={<Link2 size={11} />}
            label="Dashboard"
            value={
              
              <a href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline text-xs font-mono-jarvis truncate block"
              >
                {dashboardUrl}
              </a>
            }
          />
        ) : null}
        {oncallUrl ? (
          <InfoItem
            icon={<Link2 size={11} />}
            label="On-call"
            value={
              
              <a  href={oncallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline text-xs font-mono-jarvis"
              >
                View runbook
              </a>
            }
          />
        ) : null}
      </div>
    </div>
  )
}
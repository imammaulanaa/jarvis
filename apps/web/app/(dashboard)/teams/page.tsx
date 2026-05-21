import { Users } from "lucide-react"
import { auth } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import PageHeader from "@/components/layout/PageHeader"
import EmptyState from "@/components/ui/EmptyState"
import TeamCard from "@/components/teams/TeamCard"
import CreateTeamModal from "@/components/teams/CreateTeamModal"
import type { TeamListResponse } from "@/lib/types"

export default async function TeamsPage() {
  const session = await auth()
  const token   = session?.jarvisToken ?? ""

  let data: TeamListResponse
  try {
    data = await apiFetch<TeamListResponse>("/api/teams")
  } catch {
    data = { data: [], total: 0 }
  }

  return (
    <>
      <PageHeader
        title="Teams"
        description="Semua tim yang terdaftar di JARVIS"
        action={<CreateTeamModal token={token} />}
      />

      {data.data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada team"
          description="Buat team pertama dan assign services ke tim yang bertanggung jawab."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map(team => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </>
  )
}
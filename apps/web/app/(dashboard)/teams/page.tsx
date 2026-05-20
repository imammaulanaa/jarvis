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
    data = await apiFetch("/api/teams")
  } catch {
    data = { data: [], total: 0 }
  }

  return (
    <>
      }
      />

      {data.data.length === 0 ? (
        
      ) : (
        
          {data.data.map(team => (
            
          ))}
        
      )}
    
  )
}
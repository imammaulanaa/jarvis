import Link from "next/link"
import { Users, LayoutGrid } from "lucide-react"
import type { Team } from "@/lib/types"

interface Props {
  team: Team
  memberCount?: number
  serviceCount?: number
}

export default function TeamCard({ team, memberCount = 0, serviceCount = 0 }: Props) {
  return (
    
      
        {/* Avatar */}
        
          
            {team.name.charAt(0).toUpperCase()}
          
        

        
          {team.name}
        
        
          {team.slug}
        

        {team.description ? (
          
            {team.description}
          
        ) : null}

        
          
            
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          
          
            
            {serviceCount} service{serviceCount !== 1 ? "s" : ""}
          
        
      
    
  )
}
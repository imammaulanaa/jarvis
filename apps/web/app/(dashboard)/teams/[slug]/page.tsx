import { notFound } from "next/navigation"
import { ArrowLeft, Users, LayoutGrid } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiFetch } from "@/lib/api"
import ServiceCard from "@/components/catalog/ServiceCard"
import type { TeamDetail } from "@/lib/types"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params

  let detail: TeamDetail
  try {
    detail = await apiFetch("/api/teams/" + slug)
  } catch {
    notFound()
  }

  const { team, members, services } = detail

  return (
    
      
        
        Back to Teams
      

      {/* Hero */}
      
        
          
            
              {team.name.charAt(0).toUpperCase()}
            
          
          
            {team.name}
            {team.slug}
          
        
        {team.description ? (
          {team.description}
        ) : null}
      

      {/* Members */}
      
        
          
          
            Members ({members?.length ?? 0})
          
        

        {members && members.length > 0 ? (
          
            {members.map(member => (
              
                {member.avatar_url ? (
                  
                ) : (
                  
                    {member.username.charAt(0).toUpperCase()}
                  
                )}
                
                  
                    {member.name ?? member.username}
                  
                  
                    @{member.username}
                  
                
                
                  {member.role}
                
              
            ))}
          
        ) : (
          
            No members yet
          
        )}
      

      {/* Services */}
      
        
          
          
            Services ({services?.length ?? 0})
          
        

        {services && services.length > 0 ? (
          
            {services.map(service => (
              
            ))}
          
        ) : (
          
            
              Tim ini belum memiliki service. Assign service ke tim ini dari halaman Service Catalog.
            
          
        )}
      
    
  )
}
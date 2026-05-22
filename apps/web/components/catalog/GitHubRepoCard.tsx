import { Star, GitPullRequest, GitCommit, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink } from "lucide-react"
import { parseGitHubUrl, fetchRepoData } from "@/lib/github"

function CIBadge({ status, conclusion, url }: { status: string; conclusion: string | null; url: string }) {
  const config = conclusion === "success"
    ? { icon: CheckCircle, color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  label: "Passing" }
    : conclusion === "failure"
    ? { icon: XCircle,      color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    label: "Failing" }
    : status === "in_progress"
    ? { icon: Clock,        color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "Running" }
    : { icon: AlertCircle,  color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/20",   label: "Unknown" }

  const Icon = config.icon

  return (
    
      
      CI {config.label}
    
  )
}

interface Props {
  repoUrl: string
}

export default async function GitHubRepoCard({ repoUrl }: Props) {
  const parsed = parseGitHubUrl(repoUrl)

  if (!parsed) {
    return (
      
        
          GitHub Repository
        
        
          URL repo tidak valid atau bukan GitHub.
        
      
    )
  }

  const { owner, repo } = parsed
  const data = await fetchRepoData(owner, repo)

  if (!data.repo) {
    return (
      
        
          GitHub Repository
        
        
          Tidak bisa mengakses repo — mungkin private atau tidak ditemukan.
        
      
    )
  }

  const { repo: repoData, prs, commit, workflow } = data

  const lastCommitTime = commit?.commit.author.date
    ? new Date(commit.commit.author.date).toLocaleString("id-ID")
    : null

  return (
    
      {/* Header */}
      
        
          GitHub Repository
        
        
          {workflow ? (
            
          ) : null}
          
            {owner}/{repo}
            
          
        
      

      {/* Stats row */}
      
        
          
          {repoData.stargazers_count}
          stars
        
        
          
          {prs.length}
          open PRs
        
        
          
          {repoData.open_issues_count}
          issues
        
        {repoData.language ? (
          
            {repoData.language}
          
        ) : null}
      

      {/* Last commit */}
      {commit ? (
        
          
            Last Commit
          
          
            
            
              
                {commit.commit.message.split("
")[0]}
              
              
                {commit.author?.login ?? commit.commit.author.name}
                {lastCommitTime ? " · " + lastCommitTime : ""}
              
            
          
        
      ) : null}

      {/* Open PRs */}
      {prs.length > 0 ? (
        
          
            Open Pull Requests
          
          
            {prs.slice(0, 3).map(pr => (
              
                
                  #{pr.number}
                
                
                  {pr.title}
                
                
                  by {pr.user.login}
                
              
            ))}
            {prs.length > 3 ? (
              
                +{prs.length - 3} more PRs
              
            ) : null}
          
        
      ) : (
        
          Tidak ada open PR saat ini
        
      )}
    
  )
}
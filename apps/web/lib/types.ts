export type ServiceStatus    = "healthy" | "degraded" | "down" | "unknown"
export type ServiceLifecycle = "active" | "deprecated" | "archived"
export type ServiceTier      = "tier-1" | "tier-2" | "tier-3"

export interface Service {
  id:                 string
  slug:               string
  name:               string
  description?:       string
  team_id?:           string
  created_by?:        string
  repo_url?:          string
  repo_name?:         string
  language?:          string
  tier:               ServiceTier
  lifecycle:          ServiceLifecycle
  status:             ServiceStatus
  status_checked_at?: string
  dashboard_url?:     string
  docs_url?:          string
  oncall_url?:        string
  tags:               string[]
  metadata?:          Record<string, unknown>
  created_at:         string
  updated_at:         string
}

export interface ServiceListResponse {
  data:   Service[]
  total:  number
  limit:  number
  offset: number
}

export interface CreateServiceInput {
  slug:         string
  name:         string
  description?: string
  language?:    string
  tier:         ServiceTier
  repo_url?:    string
  docs_url?:    string
  tags:         string[]
}

export interface Team {
  id:           string
  slug:         string
  name:         string
  description?: string
  created_at:   string
  updated_at:   string
}

export interface TeamMember {
  id:          string
  github_id:   number
  username:    string
  email:       string
  name?:       string
  avatar_url?: string
  role:        string
}

export interface TeamDetail {
  team:     Team
  members:  TeamMember[]
  services: Service[]
}

export interface TeamListResponse {
  data:  Team[]
  total: number
}

export interface AuditLogEntry {
  id:            string
  user_id?:      string
  username?:     string
  avatar_url?:   string
  action:        string
  resource_type: string
  resource_id?:  string
  metadata?:     Record<string, unknown>
  created_at:    string
}

export interface AuditLogResponse {
  data:  AuditLogEntry[]
  total: number
}

export interface GitHubMetadata {
  repo_name?:        string
  description?:      string
  language?:         string
  default_branch?:   string
  stars?:            number
  forks?:            number
  open_issues?:      number
  contributors?:     number
  last_commit_sha?:  string
  last_commit_msg?:  string
  last_commit_at?:   string
  last_commit_by?:   string
  synced_at?:        string
}

export interface KubernetesRef {
  namespace?:  string
  deployment?: string
}

export interface DeploymentStatus {
  name:               string
  namespace:          string
  ready_replicas:     number
  desired_replicas:   number
  updated_replicas:   number
  available_replicas: number
  image:              string
  strategy:           string
  conditions:         {
    type:     string
    status:   string
    reason?:  string
    message?: string
  }[]
  labels?:    Record<string, unknown>
  created_at: string
  healthy:    boolean
}

export interface DeploymentListItem {
  name:             string
  namespace:        string
  ready_replicas:   number
  desired_replicas: number
  image:            string
  healthy:          boolean
}

export interface PodStatus {
  name:             string
  namespace:        string
  phase:            string
  ready_containers: number
  total_containers: number
  restart_count:    number
  node:             string
  pod_ip:           string
  host_ip:          string
  started_at?:      string
  age:              string
  image:            string
  healthy:          boolean
  reason?:          string
  cpu_display?:     string
  mem_display?:     string
  cpu_milli?:       number
  mem_bytes?:       number
}
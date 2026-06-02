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
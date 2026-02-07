// API TypeScript types
export interface User {
  id: number
  username: string
  role: 'commander' | 'node'
  reputation_score: number
  concurrent_task_count: number
  created_at: string
}

export interface Token {
  access_token: string
  token_type: string
  user: User
}

export interface Project {
  id: number
  name: string
  description: string | null
  status: string
  creator_id: number
  created_at: string
  updated_at: string | null
}

export interface Module {
  id: number
  title: string
  description: string
  project_id: number
  status: string
  deadline: string | null
  bounty: number | null
  is_timeout: boolean
  created_at: string
  updated_at: string | null
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  role?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export type ResearchDepth = "quick" | "standard" | "deep"

export type ResearchStatus =
  | "planning"
  | "searching"
  | "fetching"
  | "analyzing"
  | "verifying"
  | "synthesizing"
  | "completed"
  | "failed"

export type TaskStatus = "pending" | "in_progress" | "completed" | "failed"

export interface ResearchSession {
  id: string
  question: string
  status: ResearchStatus
  created_at: string
}

export interface ResearchTask {
  id: string
  question: string
  status: TaskStatus
  priority: number
}

export interface Source {
  id: string
  url: string
  title: string | null
  domain: string | null
}

export interface Claim {
  id: string
  claim: string
  confidence: number | null
  status: string
}

export interface Evidence {
  id: string
  claim_id: string
  source_id?: string
  passage: string
  relevance: number | null
}

export interface SSEEvent {
  event: string
  data: Record<string, unknown>
}

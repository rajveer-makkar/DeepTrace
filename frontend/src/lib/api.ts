const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function createResearch(
  question: string,
  depth: string = "standard"
): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/api/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, depth }),
  })
  return res.json()
}

export async function getResearch(id: string) {
  const res = await fetch(`${BASE}/api/research/${id}`)
  return res.json()
}

export async function getSources(id: string) {
  const res = await fetch(`${BASE}/api/research/${id}/sources`)
  return res.json()
}

export async function getClaims(id: string) {
  const res = await fetch(`${BASE}/api/research/${id}/claims`)
  return res.json()
}

export async function getEvidence(id: string) {
  const res = await fetch(`${BASE}/api/research/${id}/evidence`)
  return res.json()
}

export async function getTasks(id: string) {
  const res = await fetch(`${BASE}/api/research/${id}/tasks`)
  return res.json()
}

export async function getSettings(): Promise<{
  llm_provider: string
  llm_model: string
  search_provider: string
  has_openai_key: boolean
  has_openrouter_key: boolean
  has_anthropic_key: boolean
  has_opencode_key: boolean
  has_tavily_key: boolean
  has_brave_key: boolean
}> {
  const res = await fetch(`${BASE}/api/settings`)
  return res.json()
}

export async function updateSettings(data: Record<string, string | null>): Promise<void> {
  await fetch(`${BASE}/api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function listResearch() {
  const res = await fetch(`${BASE}/api/research`)
  return res.json()
}

export async function getReport(id: string): Promise<{ report: string; status: string }> {
  const res = await fetch(`${BASE}/api/research/${id}/report`)
  return res.json()
}

export function streamResearch(
  id: string,
  onEvent: (event: string, data: Record<string, unknown>) => void
): () => void {
  const es = new EventSource(`${BASE}/api/research/${id}/stream`)

  es.onmessage = (msg) => {
    try {
      const parsed = JSON.parse(msg.data)
      onEvent(parsed.event, parsed.data || {})
    } catch {
      // ignore malformed messages
    }
  }

  es.onerror = () => {
    es.close()
  }

  return () => es.close()
}

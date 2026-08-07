import {
  ClipboardList,
  Search,
  FileText,
  Scale,
  BrainCircuit,
  ShieldCheck,
  PenLine,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react"

export interface Phase {
  key: string
  label: string
  description: string
  icon: LucideIcon
}

export const PHASES: Phase[] = [
  { key: "planner", label: "Planning", description: "Building the research plan", icon: ClipboardList },
  { key: "search", label: "Searching", description: "Finding sources on the web", icon: Search },
  { key: "document", label: "Fetching pages", description: "Extracting content from pages", icon: FileText },
  { key: "evidence", label: "Extracting evidence", description: "Pulling key passages", icon: Scale },
  { key: "claim", label: "Analyzing claims", description: "Reasoning over evidence", icon: BrainCircuit },
  { key: "gap", label: "Verifying", description: "Detecting gaps and cross-checking", icon: ShieldCheck },
  { key: "synthesis", label: "Writing report", description: "Synthesizing findings", icon: PenLine },
]

export type PhaseState = "done" | "active" | "pending"

export const PHASE_LABELS: Record<string, string> = Object.fromEntries(
  PHASES.map((p) => [p.key, p.label])
)

export function phaseIndexForEvent(event: string): number {
  for (let i = 0; i < PHASES.length; i++) {
    if (event.startsWith(PHASES[i].key)) return i
  }
  return -1
}

export function phaseStatesForEvents(
  events: string[],
  completed: boolean
): PhaseState[] {
  let current = -1
  for (const e of events) {
    const idx = phaseIndexForEvent(e)
    if (idx > current) current = idx
  }
  return PHASES.map((_, i) => {
    if (completed) return "done"
    if (i < current) return "done"
    if (i === current) return "active"
    return "pending"
  })
}

export const DoneIcon = CheckCircle2
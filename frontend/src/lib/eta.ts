export type Depth = "quick" | "standard" | "deep"

// Baseline duration per depth. Recalibrate after the backend pipeline speedup.
const DEPTH_BASE_S: Record<Depth, number> = {
  quick: 180,
  standard: 420,
  deep: 1500,
}

export function depthBaseSeconds(depth?: string): number {
  return DEPTH_BASE_S[(depth as Depth) || "standard"] ?? DEPTH_BASE_S.standard
}

export function estimateRemainingSeconds(baseSeconds: number, elapsedMs: number): number {
  return Math.max(0, Math.round((baseSeconds * 1000 - elapsedMs) / 1000))
}

export function formatEstimate(seconds: number): string {
  if (seconds <= 0) return "done"
  if (seconds < 60) return `~${seconds}s left`
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 2) return "~1 min left"
  if (minutes < 60) return `~${minutes} min left`
  const hours = Math.floor(minutes / 60)
  return `~${hours}h ${minutes % 60}m left`
}
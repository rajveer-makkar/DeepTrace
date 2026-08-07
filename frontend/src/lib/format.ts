export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—"
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "—"
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function formatElapsed(ms: number): string {
  if (ms < 0) return "0s"
  const total = Math.floor(ms / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export function formatDuration(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso).getTime()
  if (Number.isNaN(start)) return "—"
  const end = endIso ? new Date(endIso).getTime() : Date.now()
  if (Number.isNaN(end)) return "—"
  return formatElapsed(Math.max(0, end - start))
}

export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function formatNum(n: number | null | undefined): string {
  if (n == null) return "—"
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
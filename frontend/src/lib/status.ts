import { cn } from "@/lib/utils"

const MAP: Record<string, string> = {
  planning: "default",
  searching: "default",
  fetching: "default",
  analyzing: "default",
  verifying: "default",
  synthesizing: "default",
  completed: "success",
  success: "success",
  failed: "destructive",
  error: "destructive",
  cancel: "destructive",
  failed_cancel: "destructive",
  cancelled: "destructive",
}

export function statusTone(status: string): "default" | "success" | "destructive" {
  const kind = MAP[status?.toLowerCase()] ?? "default"
  if (kind === "success" || kind === "destructive") return kind
  return "default"
}

export function statusLabel(status: string): string {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export { cn }
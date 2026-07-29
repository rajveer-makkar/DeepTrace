"use client"

import { useEffect, useState, useCallback } from "react"
import { streamResearch, getTasks, getSources } from "@/lib/api"
import type { ResearchStatus, ResearchTask, Source } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const statusLabels: Record<string, string> = {
  planner: "Planning",
  search: "Searching",
  source: "Finding sources",
  document: "Processing documents",
  evidence: "Extracting evidence",
  claim: "Analyzing evidence",
  verify: "Verifying claims",
  gap: "Detecting gaps",
  synthesis: "Synthesizing",
}

interface LogEntry {
  event: string
  data: Record<string, unknown>
}

function computeProgress(status: ResearchStatus, logs: LogEntry[]): number {
  if (status === "completed") return 100
  if (status === "failed") return 0
  const hasPrefix = (prefix: string) => logs.some((l) => l.event.startsWith(prefix))
  if (hasPrefix("synthesis")) return 85
  if (hasPrefix("gap")) return 70
  if (hasPrefix("claim") || hasPrefix("verify")) return 55
  if (hasPrefix("evidence")) return 40
  if (hasPrefix("search") || hasPrefix("document")) return 25
  if (logs.some((l) => l.event.endsWith("planner.completed"))) return 10
  return 5
}

export function ResearchStream({ researchId }: { researchId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [status, setStatus] = useState<ResearchStatus>("planning")
  const [tasks, setTasks] = useState<ResearchTask[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [error, setError] = useState("")

  const refreshData = useCallback(async () => {
    try {
      const [t, s] = await Promise.all([getTasks(researchId), getSources(researchId)])
      setTasks(t)
      setSources(s)
    } catch { /* backend down */ }
  }, [researchId])

  const onEvent = useCallback((event: string, data: Record<string, unknown>) => {
    setLogs((prev) => [...prev.slice(-99), { event, data }])
    if (event === "research.completed") setStatus("completed")
    else if (event === "research.failed") {
      setStatus("failed")
      setError((data.error as string) || "Research failed")
    } else if (event.endsWith(".started") || event.endsWith(".progress") || event.includes(".")) {
      const phase = event.split(".")[0] as ResearchStatus
      if (phase) setStatus(phase)
    }
    if (event.includes(".completed") || event.includes(".found")) {
      setTimeout(refreshData, 500)
    }
  }, [refreshData])

  useEffect(() => {
    refreshData()
    const cleanup = streamResearch(researchId, onEvent)
    return cleanup
  }, [researchId, onEvent, refreshData])

  const progress = computeProgress(status, logs)

  const lastEvent = logs.length > 0 ? logs[logs.length - 1] : null

  return (
    <div className="space-y-6">
      {error && (
        <div className="glass-sm bg-destructive/10 border-destructive/30 px-5 py-4 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <div className="glass bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold">Status:</span>
            <Badge variant={status === "completed" ? "default" : status === "failed" ? "destructive" : "secondary"} className="text-sm px-3 py-1">
              {status}
            </Badge>
          </div>
          <span className="text-base text-muted-foreground font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3 glass-inset" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass bg-card p-5 max-h-96 overflow-y-auto space-y-2">
          <p className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Activity</p>
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="text-muted-foreground shrink-0 font-medium">
                {statusLabels[log.event.split(".")[0]] || log.event.split(".")[0]}:
              </span>
              <span className="text-foreground">
                {(log.data.message as string) || (log.data.task as string) || log.event.split(".").slice(1).join(".")}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="flex items-center gap-3 py-2">
              <span className="animate-pulse w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Waiting for events...</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {sources.length > 0 && (
            <div className="glass bg-card p-5">
              <p className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                Sources ({sources.length})
              </p>
              <ul className="space-y-2">
                {sources.slice(0, 6).map((s) => (
                  <li key={s.id} className="text-sm truncate">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-foreground hover:text-primary transition-colors">
                      {s.title || s.domain || s.url}
                    </a>
                  </li>
                ))}
                {sources.length > 6 && (
                  <li className="text-sm text-muted-foreground font-medium">+{sources.length - 6} more</li>
                )}
              </ul>
            </div>
          )}
          {tasks.length > 0 && (
            <div className="glass bg-card p-5">
              <p className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                Tasks ({tasks.length})
              </p>
              <ul className="space-y-2">
                {tasks.slice(0, 6).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 text-sm">
                    <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${
                      t.status === "completed"
                        ? "bg-primary/35 text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}>
                      {t.status}
                    </span>
                    <span className="truncate text-foreground">{t.question}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!lastEvent && sources.length === 0 && tasks.length === 0 && (
            <div className="glass bg-card p-5 text-center">
              <p className="text-base text-muted-foreground">Research will appear here once it starts...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

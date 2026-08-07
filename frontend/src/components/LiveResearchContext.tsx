"use client"

import { useEffect, useState } from "react"
import { Globe, FileText, Layers, Timer } from "lucide-react"
import { ContextSection } from "@/components/ContextPanel"
import { StatCard } from "@/components/StatCard"
import { getResearch, getTasks, getSources } from "@/lib/api"
import { formatDuration, hostname } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ResearchTask, Source } from "@/types"

interface ResearchMeta {
  id: string
  question: string
  status: string
  depth?: string
  created_at?: string
  completed_at?: string | null
}

export function LiveResearchContext({ researchId }: { researchId: string }) {
  const [meta, setMeta] = useState<ResearchMeta | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [tasks, setTasks] = useState<ResearchTask[]>([])
  const [, setTick] = useState(0)

  useEffect(() => {
    let active = true
    const load = () =>
      Promise.allSettled([getResearch(researchId), getSources(researchId), getTasks(researchId)])
        .then(([r, s, t]) => {
          if (!active) return
          if (r.status === "fulfilled") setMeta(r.value)
          if (s.status === "fulfilled") setSources(s.value)
          if (t.status === "fulfilled") setTasks(t.value)
        })
        .catch(() => {})
    load()
    const interval = window.setInterval(() => {
      setTick((v) => v + 1)
      load()
    }, 3000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [researchId])

  const status = meta?.status ?? "planning"
  const completed = status === "completed"
  const failed = /fail|cancel|error/i.test(status)
  const completedTasks = tasks.filter((t) => t.status === "completed").length

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Time" icon={Timer} value={formatDuration(meta?.created_at ?? "", completed ? meta?.completed_at : null)} />
        <StatCard label="Sources" icon={Globe} value={sources.length} />
        <StatCard label="Pages" icon={FileText} value={sources.length} />
        <StatCard label="Tasks" icon={Layers} value={`${completedTasks}/${tasks.length}`} />
      </div>

      <ContextSection
        title="Status"
        action={
          <span
            className={cn(
              "size-2 rounded-full",
              completed ? "bg-success" : failed ? "bg-destructive" : "animate-pulse bg-primary"
            )}
          />
        }
      >
        <p className="text-sm font-medium text-foreground capitalize">{status.replaceAll("_", " ")}</p>
        {meta?.depth && <p className="mt-1 text-xs text-muted-foreground">Depth: {meta.depth}</p>}
      </ContextSection>

      <ContextSection title={`Sources (${sources.length})`}>
        {sources.length === 0 ? (
          <p className="text-xs text-muted-foreground">No sources collected yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {sources.slice(0, 8).map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate rounded-md px-1.5 py-1 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {s.title || hostname(s.url)}
                </a>
              </li>
            ))}
            {sources.length > 8 && (
              <li className="px-1.5 text-[11px] text-muted-foreground">
                +{sources.length - 8} more
              </li>
            )}
          </ul>
        )}
      </ContextSection>

      {tasks.length > 0 && (
        <ContextSection title={`Research plan (${tasks.length})`}>
          <ul className="space-y-1.5">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-start gap-2 text-[13px]">
                <span
                  className={cn(
                    "mt-1 size-1.5 shrink-0 rounded-full",
                    t.status === "completed"
                      ? "bg-success"
                      : t.status === "in_progress"
                        ? "bg-primary animate-pulse"
                        : "bg-muted-foreground/30"
                  )}
                />
                <span
                  className={cn(
                    "leading-snug",
                    t.status === "completed" ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {t.question}
                </span>
              </li>
            ))}
          </ul>
        </ContextSection>
      )}
    </div>
  )
}
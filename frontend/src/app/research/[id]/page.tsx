"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { getResearch, getTasks, getSources } from "@/lib/api"
import { ResearchStream } from "@/components/ResearchStream"
import { Badge } from "@/components/ui/badge"
import type { ResearchTask, Source } from "@/types"

export default function ResearchWorkspace({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [research, setResearch] = useState<{ question: string; status: string } | null>(null)
  const [tasks, setTasks] = useState<ResearchTask[]>([])
  const [sources, setSources] = useState<Source[]>([])

  useEffect(() => {
    getResearch(id).then(setResearch)
    getTasks(id).then(setTasks)
    getSources(id).then(setSources)
  }, [id])

  if (!research) return (
    <div className="flex items-center justify-center flex-1">
      <div className="glass bg-card p-8 text-lg text-muted-foreground">Loading...</div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="glass-lg bg-card p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-1 truncate">{research.question}</h1>
            <p className="text-sm text-muted-foreground">ID: {id}</p>
          </div>
          <Badge variant={research.status === "completed" ? "default" : "secondary"} className="glass-sm px-3 py-1 text-sm">
            {research.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="glass bg-card p-5 lg:col-span-1">
          <h2 className="font-bold text-base mb-4">Plan</h2>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Planning in progress...</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 shrink-0 text-base">
                    {t.status === "completed" ? "✓" : t.status === "in_progress" ? "◉" : "○"}
                  </span>
                  <span className={t.status === "completed" ? "text-muted-foreground/60 line-through" : ""}>
                    {t.question}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <ResearchStream researchId={id} />
        </div>

        <div className="glass bg-card p-5 lg:col-span-1">
          <h2 className="font-bold text-base mb-4">Sources ({sources.length})</h2>
          {sources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sources yet.</p>
          ) : (
            <ul className="space-y-2">
              {sources.slice(0, 8).map((s) => (
                <li key={s.id} className="text-sm truncate">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-foreground hover:text-primary transition-colors">
                    {s.title || s.domain || s.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="pt-5 space-y-3 border-t border-border mt-5">
            <Link href={`/research/${id}/report`} className="glass-sm flex items-center justify-center px-4 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Report
            </Link>
            <Link href={`/research/${id}/sources`} className="glass-sm flex items-center justify-center px-4 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Sources
            </Link>
            <Link href={`/research/${id}/graph`} className="glass-sm flex items-center justify-center px-4 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Graph
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

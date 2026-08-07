"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Radio,
  Activity,
  AlertTriangle,
  Globe,
  Timer,
  ExternalLink,
} from "lucide-react"
import { StatCard } from "@/components/StatCard"
import { EmptyState } from "@/components/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { listResearch, getSources } from "@/lib/api"
import { formatElapsed, timeAgo } from "@/lib/format"
import { statusLabel } from "@/lib/status"

interface Session {
  id: string
  question: string
  status: string
  depth?: string
  created_at?: string
  sources: number
}

const RUNNING = ["planning", "searching", "fetching", "analyzing", "verifying", "synthesizing", "in_progress", "running"]

function phaseProgress(status: string): number {
  const order = ["planning", "searching", "fetching", "analyzing", "verifying", "synthesizing"]
  const idx = order.indexOf(status)
  if (idx < 0) return 100
  return ((idx + 1) / order.length) * 100
}

export default function LivePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const list = await listResearch()
        const withSources = await Promise.all(
          (list as Session[]).slice(0, 24).map(async (s) => {
            try {
              const src = await getSources(s.id)
              return { ...s, sources: (src as unknown[]).length }
            } catch {
              return { ...s, sources: 0 }
            }
          })
        )
        if (active) setSessions(withSources)
      } catch {
        /* backend down */
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    const poll = window.setInterval(load, 4000)
    const tick = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      active = false
      window.clearInterval(poll)
      window.clearInterval(tick)
    }
  }, [])

  const running = sessions.filter((s) => RUNNING.includes(s.status.toLowerCase()))
  const completed = sessions.filter((s) => s.status === "completed")
  const failed = sessions.filter((s) => /fail|cancel|error/i.test(s.status))

  const stats = useMemo(
    () => ({
      running: running.length,
      completed: completed.length,
      failed: failed.length,
      total: sessions.length,
    }),
    [running, completed, failed, sessions]
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 px-6 py-10">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-success/10 text-success ring-1 ring-success/20">
          <Radio className="size-4" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Live</h1>
          <p className="text-sm text-muted-foreground">Research happening right now, updating every few seconds.</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active" value={stats.running} icon={Radio} hint={stats.running > 0 ? "in progress" : undefined} className={stats.running > 0 ? "border-success/25" : ""} />
        <StatCard label="Completed" value={stats.completed} icon={Activity} />
        <StatCard label="Failed" value={stats.failed} icon={AlertTriangle} className={stats.failed > 0 ? "border-destructive/25" : ""} />
        <StatCard label="Total" value={stats.total} icon={Globe} />
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="Nothing live yet"
          description="Start a research session and watch it unfold here in real time."
          action={
            <Link
              href="/research"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_24px_-6px_rgba(10,132,255,0.5)] transition-all hover:bg-primary/85 hover:brightness-[1.08]"
            >
              Start research
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {running.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-success">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                In progress ({running.length})
              </h2>
              <div className="space-y-2.5">
                {running.map((s) => (
                  <div key={s.id} className="glass rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/research/${s.id}`} className="line-clamp-1 text-[15px] font-medium text-foreground hover:text-primary">
                          {s.question}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="capitalize">{statusLabel(s.status)}</span>
                          <span className="flex items-center gap-1 tabular-nums"><Timer className="size-3" /> {formatElapsed(now - new Date(s.created_at ?? now).getTime())}</span>
                          <span>{s.sources} sources</span>
                        </div>
                      </div>
                      <Link href={`/research/${s.id}`} className="shrink-0 text-muted-foreground transition-colors hover:text-primary" aria-label="Open session">
                        <ExternalLink className="size-4" />
                      </Link>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 transition-all duration-1000"
                        style={{ width: `${phaseProgress(s.status)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Recently completed
              </h2>
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
                className="space-y-2"
              >
                {completed.slice(0, 8).map((s) => (
                  <motion.li
                    key={s.id}
                    variants={{ hidden: { opacity: 0, y: 4 }, show: { opacity: 1, y: 0 } }}
                  >
                    <Link
                      href={`/research/${s.id}`}
                      className="glass flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:border-emerald-400/30 hover:bg-white/[0.06]"
                    >
                      <span className="size-2 shrink-0 rounded-full bg-success" />
                      <span className="line-clamp-1 flex-1 text-sm font-medium text-foreground">{s.question}</span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{s.sources} sources · {timeAgo(s.created_at)}</span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
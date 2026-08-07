"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { History, Search, Pin } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { listResearch, getSources } from "@/lib/api"
import { formatDuration } from "@/lib/format"
import { statusLabel, statusTone } from "@/lib/status"
import { cn } from "@/lib/utils"

interface Session {
  id: string
  question: string
  status: string
  depth?: string
  created_at?: string
  sources: number
}

const PIN_KEY = "deeptrace:pinned"

function loadPinned(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PIN_KEY) ?? "[]")
  } catch {
    return []
  }
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "completed" | "running" | "failed">("all")
  const [pinned, setPinned] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    return loadPinned()
  })

  useEffect(() => {
    listResearch()
      .then(async (list) => {
        const sessionsWithCounts = await Promise.all(
          (list as Session[]).map(async (s) => {
            try {
              const src = await getSources(s.id)
              return { ...s, sources: (src as unknown[]).length }
            } catch {
              return { ...s, sources: 0 }
            }
          })
        )
        setSessions(sessionsWithCounts)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const togglePin = (id: string) => {
    const next = pinned.includes(id)
      ? pinned.filter((p) => p !== id)
      : [id, ...pinned]
    setPinned(next)
    localStorage.setItem(PIN_KEY, JSON.stringify(next))
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    const list = q
      ? sessions.filter((s) => s.question.toLowerCase().includes(q) || s.id.includes(q))
      : [...sessions]
    const statusMatch = (s: Session) => {
      if (filter === "all") return true
      if (filter === "completed") return s.status === "completed"
      if (filter === "failed") return s.status === "failed"
      return !["completed", "failed"].includes(s.status)
    }
    const sorted = [...list].filter(statusMatch)
    const sortedPinned: Session[] = []
    const sortedRest: Session[] = []
    for (const s of sorted) {
      ;(pinned.includes(s.id) ? sortedPinned : sortedRest).push(s)
    }
    sortedRest.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    return [...sortedPinned, ...sortedRest]
  }, [sessions, query, filter, pinned])

  const FILTERS = ["all", "completed", "running", "failed"] as const

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-6 py-10">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Research history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All your previous deep research sessions.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts…"
            className="pl-9"
            aria-label="Search history"
          />
        </div>
        <div className="flex items-center gap-1 glass rounded-lg p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                filter === f
                  ? "bg-white/10 text-foreground shadow-sm ring-1 ring-white/15"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={History}
            title="No research yet"
            description="Start your first deep research to see it here."
            action={
              <Link
                href="/research"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_24px_-6px_rgba(10,132,255,0.5)] transition-all hover:bg-primary/85 hover:brightness-[1.08]"
              >
                Start research
              </Link>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Nothing matches that search.</p>
      ) : (
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
          className="space-y-2.5"
        >
          {filtered.map((s) => (
            <motion.li
              key={s.id}
              variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.15 }}
            >
              <div className="glass group relative flex items-center gap-4 rounded-xl p-4 transition-all hover:border-white/20 hover:bg-white/[0.06]">
                <button
                  onClick={() => togglePin(s.id)}
                  aria-label={pinned.includes(s.id) ? "Unpin" : "Pin"}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    pinned.includes(s.id)
                      ? "text-primary"
                      : "text-muted-foreground/40 opacity-0 hover:text-muted-foreground group-hover:opacity-100"
                  )}
                >
                  <Pin className="size-3.5" />
                </button>
                <Link href={`/research/${s.id}`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="line-clamp-1 text-[15px] font-medium text-foreground">
                      {s.question}
                    </p>
                    <Badge variant={statusTone(s.status)} className="capitalize">
                      {statusLabel(s.status)}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {s.created_at && <span>{new Date(s.created_at).toLocaleString()}</span>}
                    <span>{formatDuration(s.created_at ?? "", s.status === "completed" ? undefined : null)}</span>
                    <span>{s.sources} sources</span>
                    {s.depth && <span className="capitalize">{s.depth}</span>}
                  </div>
                </Link>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  )
}
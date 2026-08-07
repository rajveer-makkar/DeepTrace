"use client"

import { use, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Globe, Search } from "lucide-react"
import { ContextPanel } from "@/components/ContextPanel"
import { ResearchTabs } from "@/components/ResearchTabs"
import { SourceCard } from "@/components/SourceCard"
import { StatCard } from "@/components/StatCard"
import { EmptyState } from "@/components/EmptyState"
import { Input } from "@/components/ui/input"
import { getResearch, getSources } from "@/lib/api"
import { hostname } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Source } from "@/types"

type SortKey = "title" | "domain" | "default"

export default function SourcesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [sources, setSources] = useState<Source[]>([])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("default")

  useEffect(() => {
    getSources(id)
      .then(setSources)
      .catch(() => {})
      .finally(() => setLoading(false))
    getResearch(id)
      .then((r) => setQuestion(r.question))
      .catch(() => {})
  }, [id])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    const list = q
      ? sources.filter(
          (s) =>
            (s.title ?? "").toLowerCase().includes(q) ||
            (s.domain ?? "").toLowerCase().includes(q) ||
            s.url.toLowerCase().includes(q)
        )
      : [...sources]

    if (sort === "title") {
      list.sort((a, b) => (a.title ?? a.url).localeCompare(b.title ?? b.url))
    } else if (sort === "domain") {
      list.sort((a, b) => hostname(a.url).localeCompare(hostname(b.url)))
    }
    return list
  }, [sources, query, sort])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const uniqueDomains = new Set(sources.map((s) => hostname(s.url))).size

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Sources
            </h1>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{question}</p>
          </div>

          <ResearchTabs id={id} active="sources" />

          {sources.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon={Globe}
                title="No sources collected"
                description="Sources will appear here as the researcher gathers them."
              />
            </div>
          ) : (
            <div className="mt-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-56 flex-1">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search sources…"
                    className="pl-9"
                    aria-label="Search sources"
                  />
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
                  {(["default", "title", "domain"] as SortKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSort(key)}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                        sort === key
                          ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {key === "default" ? "Newest" : key}
                    </button>
                  ))}
                </div>
              </div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
                className="grid gap-3 sm:grid-cols-2"
              >
                {filtered.map((s, i) => (
                  <motion.div
                    key={s.id}
                    variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.15 }}
                  >
                    <SourceCard source={s} index={i + 1} />
                  </motion.div>
                ))}
              </motion.div>

              {filtered.length === 0 && (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No sources match “{query}”.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <ContextPanel title="Source overview" icon={<Globe className="size-4 text-primary" />}>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Total" value={sources.length} />
          <StatCard label="Domains" value={uniqueDomains} />
        </div>
      </ContextPanel>
    </div>
  )
}
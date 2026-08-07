"use client"

import { use, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FileText, Loader2 } from "lucide-react"
import { Markdown, ReportToc } from "@/components/ReportView"
import { ReportContext } from "@/components/ReportContext"
import { ContextPanel } from "@/components/ContextPanel"
import { ResearchTabs } from "@/components/ResearchTabs"
import { getResearch, getReport } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { statusLabel } from "@/lib/status"

interface Meta {
  id: string
  question: string
  status: string
  depth?: string
  created_at?: string
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [research, setResearch] = useState<Meta | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getResearch(id)
      .then(setResearch)
      .catch(() => setNotFound(true))
    getReport(id)
      .then((r) => {
        if (r.report) setReport(r.report)
      })
      .catch(() => {})
  }, [id])

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-xl font-semibold text-foreground">Research session not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been removed or never existed.</p>
      </div>
    )
  }

  if (!research) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  const running = !["completed", "failed"].includes(research.status)

  const onCite = (n: number) => {
    window.dispatchEvent(new CustomEvent("deeptrace:cite", { detail: n }))
  }

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[200px_minmax(0,1fr)]">
          <ReportToc text={report ?? ""} className="sticky top-8 hidden h-fit lg:block" />

          <article className="min-w-0">
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    research.status === "completed"
                      ? "bg-success/10 text-success ring-1 ring-success/20"
                      : "bg-primary/10 text-primary ring-1 ring-primary/20"
                  }`}
                >
                  {running && <Loader2 className="size-3 animate-spin" />}
                  {statusLabel(research.status)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {research.depth} depth
                </span>
              </div>
              <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                {research.question}
              </h1>
            </div>

            <ResearchTabs id={id} active="report" />

            <div className="mt-6">
              {running && (
                <div className="space-y-4 glass rounded-xl p-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    The researcher is still working on this report
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-11/12" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              )}

              {!running && !report && (
                <div className="glass rounded-xl p-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No report was generated for this session.
                  </p>
                </div>
              )}

              {report && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Markdown text={report} onCite={onCite} />
                </motion.div>
              )}
            </div>
          </article>
        </div>
      </div>

      <ContextPanel title="Report" icon={<FileText className="size-4 text-primary" />}>
        <ReportContext research={research} report={report} />
      </ContextPanel>
    </div>
  )
}
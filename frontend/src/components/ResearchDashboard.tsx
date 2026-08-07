"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, Check, ScanSearch, ArrowUpRight, Timer, Clock } from "lucide-react"
import { PHASES, phaseStatesForEvents } from "@/lib/phases"
import { streamResearch, getReport } from "@/lib/api"
import { formatElapsed } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Markdown } from "@/components/ReportView"
import { depthBaseSeconds, estimateRemainingSeconds, formatEstimate } from "@/lib/eta"
import type { ResearchStatus } from "@/types"

interface LogEntry {
  event: string
  data: Record<string, unknown>
  at: number
}

const FAILED = new Set(["failed", "error", "cancelled", "failed_cancel"])

function computeProgress(status: ResearchStatus, logs: LogEntry[]): number {
  if (status === "completed") return 100
  if (FAILED.has(status)) return 100
  const seen = new Set(logs.map((l) => l.event))
  const has = (prefix: string) => [...seen].some((e) => e.startsWith(prefix))
  if (has("synthesis")) return 88
  if (has("gap")) return 72
  if (has("claim")) return 56
  if (has("evidence")) return 40
  if (has("document")) return 26
  if (has("search")) return 14
  if (has("planner.completed")) return 8
  return 4
}

interface AiStep {
  text: string
  at: number
  done: boolean
}

function thinkingForEvent(event: string, data: Record<string, unknown>): string | null {
  const [prefix, suffix] = event.split(".")
  switch (event) {
    case "planner.started":
      return "Analyzing your question and building a research plan"
    case "planner.completed":
      return `Research plan ready — ${data.tasks ?? "several"} sub-questions to investigate`
    case "search.started":
      return `Searching the web for “${data.task ?? "sources"}”`
    case "search.completed":
      return `Found ${data.results ?? "relevant"} results on ${data.task ?? "the topic"}`
    case "document.fetching":
      return `Fetching ${String(data.url ?? "").replace(/^https?:\/\//, "").split("/")[0] || "a source"}`
    case "evidence.extracting":
      return "Extracting key passages from pages"
    case "claim.generating":
      return "Analyzing evidence and forming claims"
    case "gap.detecting":
      return "Reconciling evidence and checking for gaps"
    case "gap.found":
      return `Found ${data.gaps ?? "some"} coverage gaps — researching deeper`
    case "gap.none":
      return "Coverage looks complete"
    case "synthesis.started":
      return "Writing the final report with citations"
  }
  if (prefix === "document" && suffix === "fetching") return null
  if (prefix === "search" && suffix === "started") return null
  return null
}

const MAX_CHARS = 220

function ClampedText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const clamped = text.length > MAX_CHARS
  const shown = clamped && !expanded ? `${text.slice(0, MAX_CHARS).trimEnd()}…` : text
  return (
    <>
      {shown}
      {clamped && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 block font-semibold underline decoration-white/40 underline-offset-2 transition-colors hover:decoration-white"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </>
  )
}

export function ResearchDashboard({
  researchId,
  question,
  depth,
}: {
  researchId: string
  question: string
  depth?: string
}) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [status, setStatus] = useState<ResearchStatus>("planning")
  const [report, setReport] = useState("")
  const [startedAt] = useState<number>(() => Date.now())
  const [now, setNow] = useState<number>(() => Date.now())
  const [error, setError] = useState("")

  const onEvent = useCallback((event: string, data: Record<string, unknown>) => {
    setLogs((prev) => [...prev.slice(-149), { event, data, at: Date.now() }])
    if (event === "research.completed") {
      setStatus("completed")
      setNow(Date.now())
    } else if (event === "research.failed") {
      setStatus("failed")
      setError(String(data.error ?? "Research failed"))
      setNow(Date.now())
    } else {
      const phase = event.split(".")[0]
      if (phase) setStatus(phase as ResearchStatus)
    }
  }, [])

  useEffect(() => {
    const cleanup = streamResearch(researchId, onEvent)
    const tick = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      cleanup()
      window.clearInterval(tick)
    }
  }, [researchId, onEvent])

  const completed = status === "completed"
  const failed = FAILED.has(status)

  useEffect(() => {
    if (!completed) return
    let active = true
    getReport(researchId)
      .then((r) => {
        if (active && r.report) setReport(r.report)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [completed, researchId])

  const progress = computeProgress(status, logs)
  const elapsed = now - startedAt
  const eventNames = useMemo(() => logs.map((l) => l.event), [logs])
  const phaseStates = phaseStatesForEvents(eventNames, completed || failed)
  const currentPhase = PHASES[phaseStates.findIndex((s) => s === "active")]

  const thinkingSteps = useMemo<AiStep[]>(() => {
    const steps: AiStep[] = []
    const seen = new Set<string>()
    for (const log of logs) {
      const text = thinkingForEvent(log.event, log.data)
      if (!text || seen.has(text)) continue
      seen.add(text)
      steps.push({ text, at: log.at, done: true })
    }
    if (steps.length > 0) steps[steps.length - 1].done = false
    if (steps.length === 0) {
      steps.push({ text: "Waiting for the researcher to start…", at: startedAt, done: false })
    }
    return steps
  }, [logs, startedAt])

  const statusText = completed
    ? "Research complete"
    : failed
      ? "Research failed"
      : currentPhase?.label ?? "Starting…"

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-6 py-4">
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        {/* user message */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex justify-end"
        >
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] leading-relaxed text-primary-foreground shadow-[0_2px_12px_-4px_rgba(10,132,255,0.4)]">
            <ClampedText text={question} />
          </div>
        </motion.div>

        {/* researcher */}
        <div className="flex items-start gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#10131a] ring-1 ring-white/10">
            <span className="brand-gradient grid size-6 place-items-center rounded-full text-white">
              <ScanSearch className="size-3.5" strokeWidth={2.5} />
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-3 pt-1">
            {/* status row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="relative flex size-2">
                  {!completed && !failed && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex size-2 rounded-full",
                      completed ? "bg-success" : failed ? "bg-destructive" : "bg-primary"
                    )}
                  />
                </span>
                {statusText}
              </span>
              <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                <Timer className="size-3" /> {formatElapsed(elapsed)}
              </span>
              {!completed && !failed && (
                <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                  <Clock className="size-3" />
                  {formatEstimate(estimateRemainingSeconds(depthBaseSeconds(depth), now - startedAt))}
                </span>
              )}
              {!completed && !failed && (
                <span className="text-xs tabular-nums text-muted-foreground">{progress}%</span>
              )}
            </div>

            {/* thin progress bar */}
            {!completed && !failed && (
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.max(4, progress)}%` }}
                />
              </div>
            )}

            {/* thinking steps */}
            <ul className="space-y-2.5">
              {thinkingSteps.map((step, i) => (
                <motion.li
                  key={`${step.text}-${i}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-2.5 text-[14px]"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full",
                      step.done ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
                    )}
                  >
                    {step.done ? (
                      <Check className="size-3" />
                    ) : (
                      <Loader2 className="size-3 animate-spin" />
                    )}
                  </span>
                  <span className={step.done ? "text-muted-foreground" : "text-foreground"}>
                    {step.text}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* inline report */}
            {completed && report && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-2"
              >
                <div className="glass-strong rounded-2xl p-5 sm:p-6">
                  <Markdown text={report} />
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/research/${researchId}/report`}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_24px_-6px_rgba(10,132,255,0.5)] transition-all hover:bg-primary/85 hover:brightness-[1.08]"
                  >
                    Open full report
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

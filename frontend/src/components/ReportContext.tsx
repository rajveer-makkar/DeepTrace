"use client"

import { useEffect, useState } from "react"
import {
  Clock,
  Globe,
  FileDown,
  FileCode2,
  FileJson,
  Printer,
  Gauge,
  Database,
} from "lucide-react"
import { ContextSection } from "@/components/ContextPanel"
import { StatCard } from "@/components/StatCard"
import { Button } from "@/components/ui/button"
import { getSources, getSettings } from "@/lib/api"
import { downloadMarkdown, downloadHtml, downloadJson, printReport } from "@/lib/export"
import { formatDuration, hostname } from "@/lib/format"
import type { Source } from "@/types"

interface Meta {
  id: string
  question: string
  status: string
  depth?: string
  created_at?: string
  completed_at?: string | null
}

export function ReportContext({
  research,
  report,
}: {
  research: Meta
  report: string | null
}) {
  const [sources, setSources] = useState<Source[]>([])
  const [settings, setSettings] = useState<{ llm_model?: string } | null>(null)
  const [highlight, setHighlight] = useState<number | null>(null)

  useEffect(() => {
    getSources(research.id).then(setSources).catch(() => {})
    getSettings().then(setSettings).catch(() => {})
  }, [research.id])

  useEffect(() => {
    const onCite = (e: Event) => {
      const n = (e as CustomEvent<number>).detail
      setHighlight(n - 1)
      const el = document.getElementById(`report-source-${n}`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" })
      window.setTimeout(() => setHighlight(null), 1500)
    }
    window.addEventListener("deeptrace:cite", onCite)
    return () => window.removeEventListener("deeptrace:cite", onCite)
  }, [])

  const completed = research.status === "completed"
  const slug = research.question.replace(/[^a-z0-9]+/gi, "-").slice(0, 60).toLowerCase() || research.id

  const exportJson = () => {
    downloadJson(
      { question: research.question, report, sources, meta: research },
      slug
    )
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Time" icon={Clock} value={formatDuration(research.created_at ?? "", completed ? research.completed_at : null)} />
        <StatCard label="Sources" icon={Globe} value={sources.length} />
        <StatCard label="Depth" icon={Gauge} value={research.depth ?? "standard"} />
        <StatCard label="Model" icon={Database} value={settings?.llm_model?.split("-")[0] ?? "—"} />
      </div>

      <ContextSection title="Export">
        {report ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <ExportBtn icon={FileDown} label="Markdown" onClick={() => downloadMarkdown(report, slug)} />
              <ExportBtn icon={FileCode2} label="HTML" onClick={() => downloadHtml(report, slug)} />
              <ExportBtn icon={FileJson} label="JSON" onClick={exportJson} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => printReport(report, slug)}
            >
              <Printer className="size-3.5" /> Export as PDF
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Export becomes available once the report is ready.</p>
        )}
      </ContextSection>

      <ContextSection title={`Sources (${sources.length})`}>
        {sources.length === 0 ? (
          <p className="text-xs text-muted-foreground">No sources linked yet.</p>
        ) : (
          <ol className="space-y-1.5">
            {sources.slice(0, 10).map((s, i) => (
              <li key={s.id} id={`report-source-${i + 1}`}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-start gap-2 rounded-md px-1.5 py-1.5 text-[13px] leading-snug transition-colors hover:bg-accent hover:text-foreground ${
                    highlight === i ? "bg-primary/15 text-foreground ring-1 ring-primary/30" : "text-muted-foreground"
                  }`}
                >
                  <span className="shrink-0 font-mono text-[11px] text-primary/70">[{i + 1}]</span>
                  <span className="line-clamp-2">{s.title || hostname(s.url)}</span>
                </a>
              </li>
            ))}
            {sources.length > 10 && (
              <li className="px-1.5 text-[11px] text-muted-foreground">
                +{sources.length - 10} more
              </li>
            )}
          </ol>
        )}
      </ContextSection>
    </div>
  )
}

function ExportBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof FileDown
  label: string
  onClick: () => void
}) {
  return (
    <Button variant="outline" size="sm" className="flex-col gap-1 py-2.5 text-[11px]" onClick={onClick}>
      <Icon className="size-4" />
      {label}
    </Button>
  )
}
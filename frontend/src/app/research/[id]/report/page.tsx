"use client"

import { use, useEffect, useState } from "react"
import { getResearch, getReport } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [research, setResearch] = useState<{ question: string; status: string } | null>(null)
  const [report, setReport] = useState<string | null>(null)

  useEffect(() => {
    getResearch(id).then(setResearch)
    getReport(id).then((r) => {
      if (r.report) setReport(r.report)
    })
  }, [id])

  const status = research?.status

  if (!research) return (
    <div className="flex items-center justify-center flex-1">
      <div className="glass bg-card p-8 text-lg text-muted-foreground">Loading...</div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="glass bg-card p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Research Report</h1>
          <Badge variant={research.status === "completed" ? "default" : "secondary"}>
            {research.status}
          </Badge>
        </div>
        <p className="text-muted-foreground">{research.question}</p>
      </div>

      {report ? (
        <div className="glass bg-card p-8 prose prose-sm max-w-none">
          {report.split("\n").map((line, i) => {
            if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-6 mb-2">{line.slice(2)}</h1>
            if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mt-5 mb-2">{line.slice(3)}</h2>
            if (line.startsWith("### ")) return <h3 key={i} className="text-base font-medium mt-4 mb-1">{line.slice(4)}</h3>
            if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold my-2">{line.slice(2, -2)}</p>
            if (line.startsWith("- ")) return <li key={i} className="ml-4 text-sm">{line.slice(2)}</li>
            if (line.trim() === "") return <br key={i} />
            return <p key={i} className="text-sm leading-relaxed my-1">{line}</p>
          })}
        </div>
      ) : (
        <div className="glass bg-card p-10 text-center text-muted-foreground">
          {research.status === "completed"
            ? "No report content found."
            : "Report will appear here when research completes."}
        </div>
      )}
    </div>
  )
}

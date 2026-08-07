"use client"

import { use, useEffect, useState } from "react"
import { Activity } from "lucide-react"
import { ResearchDashboard } from "@/components/ResearchDashboard"
import { LiveResearchContext } from "@/components/LiveResearchContext"
import { ContextPanel } from "@/components/ContextPanel"
import { ResearchTabs } from "@/components/ResearchTabs"
import { getResearch } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function ResearchWorkspace({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [research, setResearch] = useState<{ question: string; status: string; depth?: string } | null>(null)

  useEffect(() => {
    getResearch(id).then(setResearch).catch(() => setResearch(null))
  }, [id])

  if (!research) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-5 pt-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-6">
            <ResearchTabs id={id} active="live" />
          </div>

          <ResearchDashboard researchId={id} question={research.question} depth={research.depth} />
        </div>
      </div>

      <ContextPanel
        title="Research"
        icon={<Activity className="size-4 text-primary" />}
      >
        <LiveResearchContext researchId={id} />
      </ContextPanel>
    </div>
  )
}
"use client"

import Link from "next/link"
import { Activity, FileText, Globe, Network } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { key: "live", label: "Live", icon: Activity, href: (id: string) => `/research/${id}` },
  { key: "report", label: "Report", icon: FileText, href: (id: string) => `/research/${id}/report` },
  { key: "sources", label: "Sources", icon: Globe, href: (id: string) => `/research/${id}/sources` },
  { key: "graph", label: "Graph", icon: Network, href: (id: string) => `/research/${id}/graph` },
] as const

export function ResearchTabs({ id, active }: { id: string; active: string }) {
  return (
    <nav className="flex w-fit items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.key === active
        return (
          <Link
            key={tab.key}
            href={tab.href(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              isActive
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
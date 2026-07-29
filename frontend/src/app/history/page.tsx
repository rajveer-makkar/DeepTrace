"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { listResearch } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

export default function History() {
  const [sessions, setSessions] = useState<
    { id: string; question: string; status: string; created_at: string }[]
  >([])

  useEffect(() => {
    listResearch().then(setSessions)
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Research History</h1>
      {sessions.length === 0 ? (
        <div className="glass bg-card p-10 text-center">
          <p className="text-lg text-muted-foreground">No research sessions yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/research/${s.id}`}
                className="glass block bg-card p-5 transition-all hover:translate-y-[-2px]"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-semibold line-clamp-1">{s.question}</p>
                  <Badge variant={s.status === "completed" ? "default" : "secondary"} className="glass-sm px-3 py-1 text-sm">
                    {s.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(s.created_at).toLocaleString()} &middot; {s.id}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

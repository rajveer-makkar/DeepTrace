"use client"

import { use, useEffect, useState } from "react"
import { getSources } from "@/lib/api"
import type { Source } from "@/types"

export default function SourcesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [sources, setSources] = useState<Source[]>([])

  useEffect(() => {
    getSources(id).then(setSources)
  }, [id])

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Sources ({sources.length})</h1>
      {sources.length === 0 ? (
        <div className="glass bg-card p-10 text-center">
          <p className="text-lg text-muted-foreground">No sources collected yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sources.map((s) => (
            <li key={s.id} className="glass bg-card p-5">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-base hover:underline"
              >
                {s.title || s.url}
              </a>
              {s.domain && (
                <p className="text-sm text-muted-foreground mt-1">{s.domain}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

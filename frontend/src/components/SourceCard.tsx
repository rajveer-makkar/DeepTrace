import Link from "next/link"
import { ExternalLink, FileText } from "lucide-react"
import { Favicon } from "@/components/Favicon"
import { hostname } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Source } from "@/types"

interface SourceCardProps {
  source: Source
  index?: number
  compact?: boolean
}

export function SourceCard({ source, index, compact }: SourceCardProps) {
  const title = source.title || source.url
  return (
    <div
      className={cn(
        "group glass rounded-xl p-3.5 transition-all hover:border-white/20 hover:bg-white/[0.06]",
        compact && "p-2.5"
      )}
    >
      <div className="flex items-start gap-3">
        <Favicon url={source.url} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary"
          >
            {title}
          </a>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {index !== undefined && <span className="tabular-nums">[{index}]</span>}
            <span className="truncate">{hostname(source.url)}</span>
          </div>
        </div>
        <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
      </div>
      {!compact && source.url && (
        <p className="mt-2 line-clamp-2 truncate text-[11px] text-muted-foreground/70">
          {source.url}
        </p>
      )}
    </div>
  )
}

export function SourceLink({ source }: { source: Source }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Favicon url={source.url} size="sm" />
      <Link
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <FileText className="size-3" />
        {hostname(source.url)}
      </Link>
    </span>
  )
}
import Link from "next/link"
import { ScanSearch } from "lucide-react"

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group outline-none" aria-label="DeepTrace home">
      <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(10,132,255,0.15)]">
        <ScanSearch className="size-4" strokeWidth={2.25} />
      </span>
      {!collapsed && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground group-hover:text-primary/90 transition-colors">
          DeepTrace
        </span>
      )}
    </Link>
  )
}
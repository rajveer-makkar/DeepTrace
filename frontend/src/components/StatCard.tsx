import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  hint?: string
  className?: string
}

export function StatCard({ label, value, icon: Icon, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-xl p-3.5 transition-colors hover:border-white/20 hover:bg-white/[0.06]",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
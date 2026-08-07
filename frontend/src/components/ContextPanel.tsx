"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronRight, PanelRightClose, PanelRightOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContextPanelProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ContextPanel({ title, icon, children, className }: ContextPanelProps) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return true
    return window.localStorage.getItem("deeptrace:panel") !== "closed"
  })

  const toggle = () => {
    const next = !open
    setOpen(next)
    window.localStorage.setItem("deeptrace:panel", next ? "open" : "closed")
  }

  return (
    <aside
      aria-label={title}
      className={cn(
        "relative hidden shrink-0 border-l border-white/10 bg-white/[0.03] backdrop-blur-2xl lg:block",
        open ? "w-80" : "w-11",
        className
      )}
    >
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex h-full flex-col"
          >
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
              {icon}
              <h2 className="flex-1 truncate text-sm font-semibold text-foreground">{title}</h2>
              <button
                onClick={toggle}
                aria-label="Collapse panel"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <PanelRightClose className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <div className="flex flex-col items-center gap-2 py-3">
          <button
            onClick={toggle}
            aria-label="Expand panel"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <PanelRightOpen className="size-4" />
          </button>
          {icon && <span className="text-muted-foreground/70">{icon}</span>}
        </div>
      )}
    </aside>
  )
}

export function ContextSection({
  title,
  action,
  children,
  defaultOpen = true,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="glass mb-3 rounded-xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 rounded-t-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
      >
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.12 }}>
          <ChevronRight className="size-3.5 text-muted-foreground" />
        </motion.span>
        <h3 className="flex-1 text-[13px] font-semibold text-foreground">{title}</h3>
        {action}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
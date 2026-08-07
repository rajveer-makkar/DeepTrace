"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Search, Sparkles, Settings, CornerDownLeft } from "lucide-react"
import { listResearch } from "@/lib/api"

interface Item {
  id: string
  label: string
  group: string
  icon: typeof Search
  href?: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [sessions, setSessions] = useState<{ id: string; question: string }[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const openRef = useRef(open)

  useEffect(() => {
    openRef.current = open
  }, [open])

  const toggleOpen = useCallback((value: boolean) => {
    setOpen(value)
    if (value) {
      setQuery("")
      setActiveIdx(0)
    }
  }, [])

  const openPalette = useCallback(() => toggleOpen(!openRef.current), [toggleOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        openPalette()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openPalette])

  useEffect(() => {
    if (!open) return
    let active = true
    listResearch()
      .then((s) => {
        if (active) setSessions((s as { id: string; question: string }[]).slice(0, 6))
      })
      .catch(() => {})
    const t = window.setTimeout(() => inputRef.current?.focus(), 30)
    return () => {
      active = false
      window.clearTimeout(t)
    }
  }, [open])

  const items: Item[] = [
    { id: "new", label: "Start new research", group: "Actions", icon: Sparkles, href: "/research" },
    { id: "history", label: "Research history", group: "Actions", icon: Search, href: "/history" },
    { id: "settings", label: "Settings", group: "Actions", icon: Settings, href: "/settings" },
    ...sessions.map((s) => ({
      id: s.id,
      label: s.question,
      group: "Recent research",
      icon: Search,
      href: `/research/${s.id}`,
    })),
  ]

  const filtered = query
    ? items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : items

  const go = (item?: Item) => {
    if (!item) return
    setOpen(false)
    if (item.href) router.push(item.href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      go(filtered[activeIdx])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-[12vh] w-full max-w-lg overflow-hidden rounded-xl glass-strong shadow-2xl shadow-black/50"
            role="dialog"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIdx(0)
                }}
                onKeyDown={onKeyDown}
                placeholder="Search or jump to..."
                className="h-12 w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none"
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5">
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results</p>
              )}
              {filtered.map((item, i) => {
                const Icon = item.icon
                const groupHeader =
                  i === 0 || filtered[i - 1].group !== item.group ? item.group : null
                return (
                  <div key={item.id}>
                    {groupHeader && (
                      <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                        {groupHeader}
                      </p>
                    )}
                    <button
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => go(item)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        i === activeIdx ? "bg-accent text-accent-foreground" : "text-foreground"
                      }`}
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {i === activeIdx && (
                        <CornerDownLeft className="size-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><kbd className="rounded border border-border px-1">↑</kbd><kbd className="rounded border border-border px-1">↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-border px-1.5">↵</kbd> select</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
)
}
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sparkles,
  History,
  Settings,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Command,
  Radio,
} from "lucide-react"
import { Logo } from "@/components/Logo"
import { listResearch } from "@/lib/api"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: typeof Sparkles
  shortcut?: string
  live?: boolean
}

const NAV: NavItem[] = [
  { href: "/research", label: "New Research", icon: Sparkles, shortcut: "N" },
  { href: "/live", label: "Live", icon: Radio, shortcut: "L", live: true },
  { href: "/history", label: "History", icon: History, shortcut: "H" },
]

interface RecentItem {
  id: string
  question: string
  status: string
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [recent, setRecent] = useState<RecentItem[]>([])
  const pathname = usePathname()

  useEffect(() => {
    let active = true
    const load = () => {
      listResearch()
        .then((sessions) => {
          if (active) setRecent((sessions as RecentItem[]).slice(0, 5))
        })
        .catch(() => {})
    }
    load()
    window.addEventListener("deeptrace:research-started", load)
    return () => {
      active = false
      window.removeEventListener("deeptrace:research-started", load)
    }
  }, [pathname])

  const match = pathname.match(/^\/research\/([^/]+)/)
  const activeId = match ? match[1] : null

  const isActive = (href: string) =>
    href === "/research" ? pathname === "/research" : pathname.startsWith(href)
  return (
    <aside
      className={cn(
        "relative z-30 flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out",
        collapsed ? "w-14" : "w-60"
      )}
    >
      <div className={cn("flex h-14 items-center px-3", collapsed ? "justify-center" : "px-4")}>
        <Logo collapsed={collapsed} />
      </div>

      <nav className="px-2.5 space-y-0.5" aria-label="Main">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="size-4 shrink-0" />
          ) : (
            <>
              <ChevronsLeft className="size-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>

        {NAV.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                collapsed && "justify-center px-2",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <span className="relative">
                <Icon className="size-4 shrink-0" />
                {item.live && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-success" />
                  </span>
                )}
              </span>
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.shortcut && (
                <kbd className="rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </Link>
          )
        })}
      </nav>

      {!collapsed && recent.length > 0 && (
        <div className="mt-6 flex-1 overflow-y-auto px-3">
          <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Recent research
          </p>
          <ul className="space-y-0.5">
            {recent.map((r) => {
              const active = r.id === activeId
              return (
                <li key={r.id}>
                  <Link
                    href={`/research/${r.id}`}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        active ? "bg-primary" : "bg-muted-foreground/40"
                      )}
                    />
                    <span className="truncate">{r.question}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {!collapsed && <div className="flex-1" />}

      <div className="border-t border-sidebar-border p-2.5 space-y-0.5">
        {!collapsed && (
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors"
          >
            <Search className="size-4 shrink-0" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Command className="inline size-2.5" />K
            </kbd>
          </button>
        )}
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors",
            collapsed && "justify-center px-2",
            isActive("/settings") && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  )
}
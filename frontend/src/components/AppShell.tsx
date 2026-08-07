"use client"

import type { ReactNode } from "react"
import { Sidebar } from "@/components/Sidebar"
import { CommandPalette } from "@/components/CommandPalette"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-dvh overflow-hidden">
      {/* ambient background depth */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-drift absolute -top-40 left-1/4 size-[32rem] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="animate-drift-slow absolute -right-24 top-1/4 size-[26rem] rounded-full bg-violet-600/10 blur-3xl" />
        <div className="animate-drift absolute bottom-0 left-1/3 size-[28rem] rounded-full bg-sky-600/10 blur-3xl [animation-delay:7s]" />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <Sidebar />
      <main className="relative z-10 min-w-0 flex-1 overflow-y-auto">{children}</main>
      <CommandPalette />
    </div>
  )
}

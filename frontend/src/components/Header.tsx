"use client"

import Link from "next/link"

export function Header() {
  return (
    <header className="glass sticky top-0 z-50 mx-4 mt-4">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="font-bold text-xl tracking-tight text-foreground">
          DeepTrace
        </Link>
        <nav className="flex gap-2">
          <Link href="/research" className="glass-sm px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
            New Research
          </Link>
          <Link href="/history" className="glass-sm px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
            History
          </Link>
          <Link href="/settings" className="glass-sm px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
            Settings
          </Link>
        </nav>
      </div>
    </header>
  )
}

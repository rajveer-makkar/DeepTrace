"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; lang: string; code: string }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "hr" }

function parseBlocks(md: string): Block[] {
  const lines = md.split(/\r?\n/)
  const blocks: Block[] = []
  let i = 0

  const pushText = (type: "paragraph" | "quote", text: string) => {
    const prev = blocks[blocks.length - 1]
    if (prev?.type === type) {
      prev.text += "\n" + text
    } else {
      blocks.push({ type, text })
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    // code fence
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim()
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i])
        i++
      }
      i++
      blocks.push({ type: "code", lang, code: code.join("\n") })
      continue
    }

    // heading
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    if (h) {
      blocks.push({ type: "heading", level: h[1].length, text: h[2] })
      i++
      continue
    }

    // hr
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      blocks.push({ type: "hr" })
      i++
      continue
    }

    // table
    if (line.trim().startsWith("|")) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i]
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim())
        rows.push(cells)
        i++
      }
      if (rows.length >= 2) {
        const header = rows[0]
        const body = rows.slice(2).filter((r) => r.length > 0 && !r.every((c) => /^:?-{2,}:?$/.test(c)))
        blocks.push({ type: "table", header, rows: body.length ? body : [] })
      } else {
        blocks.push({ type: "paragraph", text: rows[0]?.join(" | ") ?? "" })
      }
      continue
    }

    // blockquote
    if (line.startsWith("> ")) {
      pushText("quote", line.slice(2))
      i++
      continue
    }

    // list
    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line)
      const items: string[] = []
      while (i < lines.length) {
        const m = /^\s*[-*+]\s+(.*)$/.exec(lines[i]) || /^\s*\d+[.)]\s+(.*)$/.exec(lines[i])
        if (!m) break
        items.push(m[1])
        i++
      }
      blocks.push({ type: "list", ordered, items })
      continue
    }

    if (line.trim() === "") {
      i++
      continue
    }

    // paragraph accumulation
    const para: string[] = []
    while (i < lines.length && lines[i].trim() !== "") {
      para.push(lines[i])
      i++
    }
    pushText("paragraph", para.join(" "))
  }
  return blocks
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function Inline({ text, onCite }: { text: string; onCite?: (n: number) => void }) {
  const nodes: React.ReactNode[] = []
  let buffer = ""
  let i = 0
  let key = 0

  const flush = () => {
    if (buffer) {
      nodes.push(buffer)
      buffer = ""
    }
  }

  while (i < text.length) {
    const ch = text[i]

    if (ch === "`") {
      const end = text.indexOf("`", i + 1)
      if (end > i) {
        flush()
        nodes.push(
          <code key={key++} className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em]">
            {text.slice(i + 1, end)}
          </code>
        )
        i = end + 1
        continue
      }
    }

    if (text.slice(i, i + 2) === "**") {
      const end = text.indexOf("**", i + 2)
      if (end > i) {
        flush()
        nodes.push(
          <strong key={key++} className="font-semibold text-foreground">
            {text.slice(i + 2, end)}
          </strong>
        )
        i = end + 2
        continue
      }
    }

    if (ch === "[") {
      const linkEnd = text.indexOf("](", i)
      if (linkEnd > i) {
        const close = text.indexOf(")", linkEnd)
        if (close > linkEnd) {
          flush()
          nodes.push(
            <a
              key={key++}
              href={text.slice(linkEnd + 2, close)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {text.slice(i + 1, linkEnd)}
            </a>
          )
          i = close + 1
          continue
        }
      }
      const cite = /^\[(\d+)\]/.exec(text.slice(i))
      if (cite) {
        flush()
        const n = Number(cite[1])
        nodes.push(
          <button
            key={key++}
            onClick={() => onCite?.(n)}
            className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded bg-primary/15 px-1 align-middle font-mono text-[10px] font-semibold text-primary transition-colors hover:bg-primary/25"
            aria-label={`Citation ${n}`}
          >
            {n}
          </button>
        )
        i += cite[0].length
        continue
      }
    }

    if (ch === "*") {
      const end = text.indexOf("*", i + 1)
      if (end > i) {
        flush()
        nodes.push(<em key={key++}>{text.slice(i + 1, end)}</em>)
        i = end + 1
        continue
      }
    }

    buffer += ch
    i++
  }
  flush()
  return <>{nodes}</>
}

export function extractToc(md: string): { id: string; level: number; text: string }[] {
  const items: { id: string; level: number; text: string }[] = []
  for (const block of parseBlocks(md)) {
    if (block.type === "heading" && block.level <= 3) {
      items.push({ id: slugify(block.text), level: block.level, text: block.text })
    }
  }
  return items
}

export interface ReportViewProps {
  text: string
  className?: string
  onCite?: (n: number) => void
}

export function Markdown({ text, onCite }: { text: string; onCite?: (n: number) => void }) {
  const blocks = useMemo(() => parseBlocks(text), [text])

  return (
    <div className="prose-deeptrace">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading": {
            const id = slugify(block.text)
            const Tag = `h${Math.max(2, block.level)}` as "h2" | "h3" | "h4"
            return (
              <Tag key={i} id={id} className="scroll-mt-24">
                <a href={`#${id}`} className="group relative no-underline">
                  <span className="absolute -left-5 hidden text-primary/60 group-hover:inline">#</span>
                  <Inline text={block.text} onCite={onCite} />
                </a>
              </Tag>
            )
          }
          case "paragraph":
            return (
              <p key={i}>
                <Inline text={block.text} onCite={onCite} />
              </p>
            )
          case "list":
            return block.ordered ? (
              <ol key={i}>
                {block.items.map((it, j) => (
                  <li key={j}>
                    <Inline text={it} onCite={onCite} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i}>
                {block.items.map((it, j) => (
                  <li key={j}>
                    <Inline text={it} onCite={onCite} />
                  </li>
                ))}
              </ul>
            )
          case "quote":
            return (
              <blockquote key={i}>
                <Inline text={block.text} onCite={onCite} />
              </blockquote>
            )
          case "code":
            return (
              <pre key={i}>
                <code className={block.lang ? `language-${block.lang}` : ""}>{block.code}</code>
              </pre>
            )
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-lg border border-border">
                <table>
                  <thead>
                    <tr>
                      {block.header.map((h, j) => (
                        <th key={j}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td key={k}>
                            <Inline text={cell} onCite={onCite} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case "hr":
            return <hr key={i} />
        }
      })}
    </div>
  )
}

export function ReportToc({ text, className }: { text: string; className?: string }) {
  const items = useMemo(() => extractToc(text), [text])
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    if (items.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )
    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav aria-label="Table of contents" className={className}>
      <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block rounded-md px-3 py-1.5 text-[13px] leading-snug transition-colors",
                item.level === 3 && "pl-6",
                active === item.id
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
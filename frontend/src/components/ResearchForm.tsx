"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, Globe, Loader2, SlidersHorizontal, Sparkles, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createResearch } from "@/lib/api"
import { cn } from "@/lib/utils"
import { depthBaseSeconds, formatEstimate } from "@/lib/eta"

export type DepthKey = "quick" | "standard" | "deep"

const DEPTHS: { key: DepthKey; label: string; desc: string }[] = [
  { key: "quick", label: "Quick", desc: "Fast overview" },
  { key: "standard", label: "Balanced", desc: "Thorough" },
  { key: "deep", label: "Deep", desc: "Exhaustive" },
]

interface ResearchFormProps {
  autoFocus?: boolean
  initial?: string
}

export function ResearchForm({ autoFocus, initial = "" }: ResearchFormProps) {
  const [question, setQuestion] = useState(initial)
  const [depth, setDepth] = useState<DepthKey>("standard")
  const [advanced, setAdvanced] = useState(false)
  const [urls, setUrls] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    const onPrompt = (e: Event) => setQuestion((e as CustomEvent<string>).detail)
    window.addEventListener("deeptrace:prompt", onPrompt)
    return () => window.removeEventListener("deeptrace:prompt", onPrompt)
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`
  }, [question])

  const canSubmit = question.trim().length > 0 && !loading

  async function submit() {
    if (!canSubmit) return
    setLoading(true)
    try {
      const { id } = await createResearch(question.trim(), depth)
      window.dispatchEvent(new CustomEvent("deeptrace:research-started", { detail: id }))
      router.push(`/research/${id}`)
    } catch {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="glass-strong w-full overflow-hidden rounded-2xl shadow-lg shadow-black/25 transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/15"
    >
      <textarea
        ref={textareaRef}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="What would you like to research?"
        aria-label="Research question"
        className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 outline-none sm:px-5"
      />

      <AnimatePresence>
        {advanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden px-4 sm:px-5"
          >
            <div className="border-t border-border/60 py-3">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Globe className="size-3.5" />
                Reference URLs <span className="font-normal text-muted-foreground/60">(optional)</span>
              </label>
              <Input
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="https://example.com, https://paper.org/..."
                className="bg-background/60"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-2 sm:px-5">
        <div className="flex items-center rounded-full bg-white/5 p-0.5 ring-1 ring-white/10">
          {DEPTHS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDepth(d.key)}
              title={d.desc}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
                depth === d.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>

        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {formatEstimate(depthBaseSeconds(depth))}
        </span>

        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
            advanced
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          Advanced
        </button>

        <div className="ml-auto flex items-center gap-2">
          <kbd className="hidden rounded-xl border border-border bg-background/60 px-3 py-1 text-xl font-medium text-muted-foreground sm:block">
            ⌘↵
          </kbd>
          <Button
            type="submit"
            disabled={!canSubmit}
            size="icon"
            className="size-9 rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_rgba(10,132,255,0.5)] hover:bg-primary/85 hover:brightness-[1.08]"
            aria-label="Start research"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </Button>
        </div>
      </div>
    </form>
  )
}

export const RESEARCH_PROMPTS: { icon: typeof Sparkles; label: string; prompt: string }[] = [
  {
    icon: Sparkles,
    label: "Future of fusion",
    prompt: "Research the future of fusion energy",
  },
  {
    icon: Sparkles,
    label: "Open-source LLMs",
    prompt: "Compare the best open-source LLMs",
  },
  {
    icon: Sparkles,
    label: "Apple's AI strategy",
    prompt: "Analyze Apple's AI strategy",
  },
  {
    icon: Sparkles,
    label: "MCP security",
    prompt: "Study the cybersecurity risks of MCP servers",
  },
]

export function fillPrompt(question: string) {
  window.dispatchEvent(new CustomEvent("deeptrace:prompt", { detail: question }))
}
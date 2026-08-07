"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { ResearchForm, RESEARCH_PROMPTS, fillPrompt } from "@/components/ResearchForm"

export default function NewResearch() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Start a deep research
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask a question and let the researcher dig into the web for you.
        </p>
        <div className="mt-8">
          <ResearchForm autoFocus />
        </div>

        <div className="mt-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Try an example
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {RESEARCH_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => fillPrompt(p.prompt)}
                className="group flex items-center gap-3 glass rounded-xl px-4 py-3.5 text-left transition-all hover:border-primary/40 hover:bg-white/[0.06]"
              >
                <span className="text-sm font-medium text-foreground">{p.label}</span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
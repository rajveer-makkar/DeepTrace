"use client"

import { motion } from "framer-motion"
import { ScanSearch, ArrowRight, Sparkles, Zap, Globe, Cpu } from "lucide-react"
import { ResearchForm, fillPrompt } from "@/components/ResearchForm"
import { BackgroundVideo } from "@/components/BackgroundVideo"
import { cn } from "@/lib/utils"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

const PROMPTS = [
  { label: "Future of fusion", prompt: "What is the current state and realistic timeline of commercial nuclear fusion energy?", icon: Sparkles, ring: "group-hover:border-sky-400/60 group-hover:shadow-[0_0_30px_-8px_rgba(56,189,248,0.4)]", iconCls: "text-sky-400" },
  { label: "Open-source LLMs", prompt: "Which open-source LLMs can realistically replace GPT-4-class models in production today?", icon: Cpu, ring: "group-hover:border-violet-400/60 group-hover:shadow-[0_0_30px_-8px_rgba(167,139,250,0.4)]", iconCls: "text-violet-400" },
  { label: "Apple's AI strategy", prompt: "What is Apple's AI strategy and how does it compare to Google and Microsoft?", icon: Globe, ring: "group-hover:border-emerald-400/60 group-hover:shadow-[0_0_30px_-8px_rgba(52,211,153,0.4)]", iconCls: "text-emerald-400" },
  { label: "MCP security", prompt: "What are the main security risks of the Model Context Protocol and how are they being mitigated?", icon: Zap, ring: "group-hover:border-rose-400/60 group-hover:shadow-[0_0_30px_-8px_rgba(251,113,133,0.4)]", iconCls: "text-rose-400" },
]

export default function Home() {
  return (
    <div className="relative min-h-full">
      <BackgroundVideo />

      {/* animated glow orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="animate-drift absolute -top-24 -left-24 size-[26rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="animate-drift-slow absolute -right-32 top-1/3 size-[28rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="animate-drift absolute bottom-0 left-1/4 size-[22rem] rounded-full bg-sky-500/10 blur-3xl [animation-delay:6s]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="relative mx-auto mb-6 inline-block">
            <div className="absolute inset-0 scale-150 rounded-full bg-primary/25 blur-2xl" />
            <div className="animate-float relative grid size-14 place-items-center rounded-2xl glass-strong brand-gradient shadow-[0_0_60px_-12px_rgba(10,132,255,0.5)]">
              <ScanSearch className="size-7 text-white" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            What would you like to{" "}
            <span className="text-gradient text-shimmer">research?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-zinc-300">
            DeepTrace autonomously searches the web, reads sources, reasons over
            evidence, and produces a cited report — in minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="mt-10"
        >
          <ResearchForm autoFocus />
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="mt-10">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">
            Try an example
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {PROMPTS.map((p) => {
              const Icon = p.icon
              return (
                <motion.button
                  key={p.label}
                  variants={item}
                  transition={{ duration: 0.2 }}
                  onClick={() => fillPrompt(p.prompt)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl glass px-4 py-3.5 text-left backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.07]",
                    p.ring
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", p.iconCls)} />
                  <span className="text-sm font-medium text-zinc-100">{p.label}</span>
                  <ArrowRight className="ml-auto size-4 shrink-0 text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
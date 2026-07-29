"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createResearch } from "@/lib/api"

export default function NewResearch() {
  const [question, setQuestion] = useState("")
  const [depth, setDepth] = useState<string>("standard")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    try {
      const { id } = await createResearch(question, depth)
      router.push(`/research/${id}`)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="glass-lg bg-card p-10">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">New Research</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-base font-medium mb-3">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Is nuclear energy actually better for the climate than solar?"
              rows={5}
              className="glass-inset w-full bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-3">Depth</label>
            <div className="flex gap-3">
              {["quick", "standard", "deep"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepth(d)}
                  className={`glass-sm flex-1 px-6 py-3 text-base font-medium capitalize transition-all ${
                    depth === d
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading || !question.trim()} size="lg" className="glass w-full py-4 text-base font-semibold bg-primary text-primary-foreground">
            {loading ? "Starting..." : "Start Research"}
          </Button>
        </form>
      </div>
    </div>
  )
}

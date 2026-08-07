"use client"

import { useEffect, useState } from "react"
import { Check, KeyRound, Loader2, Search, ServerCog, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getSettings, updateSettings } from "@/lib/api"
import { cn } from "@/lib/utils"

const LLM_PROVIDERS = [
  { value: "openai", label: "OpenAI", keyField: "openai_api_key", saved: "openai" },
  { value: "openrouter", label: "OpenRouter", keyField: "openrouter_api_key", saved: "openrouter" },
  { value: "anthropic", label: "Anthropic", keyField: "anthropic_api_key", saved: "anthropic" },
  { value: "opencode", label: "OpenCode Zen", keyField: "opencode_api_key", saved: "opencode" },
]

const SEARCH_PROVIDERS = [
  { value: "tavily", label: "Tavily", keyField: "tavily_api_key", saved: "tavily", placeholder: "tvly-..." },
  { value: "brave", label: "Brave", keyField: "brave_api_key", saved: "brave", placeholder: "BSA-..." },
]

const LLM_PLACEHOLDER: Record<string, string> = {
  openai: "sk-...",
  openrouter: "sk-or-...",
  anthropic: "sk-ant-...",
  opencode: "oc-...",
}

interface SettingsState {
  llm_provider: string
  llm_model: string
  search_provider: string
  openai_api_key: string
  openrouter_api_key: string
  anthropic_api_key: string
  opencode_api_key: string
  tavily_api_key: string
  brave_api_key: string
}

interface HasKeys {
  openai: boolean
  openrouter: boolean
  anthropic: boolean
  opencode: boolean
  tavily: boolean
  brave: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    llm_provider: "openai",
    llm_model: "",
    search_provider: "tavily",
    openai_api_key: "",
    openrouter_api_key: "",
    anthropic_api_key: "",
    opencode_api_key: "",
    tavily_api_key: "",
    brave_api_key: "",
  })
  const [hasKeys, setHasKeys] = useState<HasKeys>({
    openai: false,
    openrouter: false,
    anthropic: false,
    opencode: false,
    tavily: false,
    brave: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    getSettings()
      .then((s) => {
        setSettings((prev) => ({
          ...prev,
          llm_provider: s.llm_provider,
          llm_model: s.llm_model,
          search_provider: s.search_provider,
        }))
        setHasKeys({
          openai: s.has_openai_key,
          openrouter: s.has_openrouter_key,
          anthropic: s.has_anthropic_key,
          opencode: s.has_opencode_key,
          tavily: s.has_tavily_key,
          brave: s.has_brave_key,
        })
      })
      .catch(() => setError("Could not reach the backend. Is the server running?"))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      await updateSettings({
        llm_provider: settings.llm_provider,
        llm_model: settings.llm_model,
        search_provider: settings.search_provider,
        openai_api_key: settings.openai_api_key || null,
        openrouter_api_key: settings.openrouter_api_key || null,
        anthropic_api_key: settings.anthropic_api_key || null,
        opencode_api_key: settings.opencode_api_key || null,
        tavily_api_key: settings.tavily_api_key || null,
        brave_api_key: settings.brave_api_key || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError("Failed to save. Is the backend running?")
    } finally {
      setSaving(false)
    }
  }

  const set = (patch: Partial<SettingsState>) => setSettings((prev) => ({ ...prev, ...patch }))

  const llmReady = hasKeys.openai || hasKeys.openrouter || hasKeys.anthropic || hasKeys.opencode
  const searchReady = hasKeys.tavily || hasKeys.brave
  const ready = llmReady && searchReady

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 px-6 py-10">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure providers and API keys. Keys are stored securely and never displayed.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-6 glass rounded-2xl p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">Readiness</h2>
              <p className="text-xs text-muted-foreground">Confirm you can run a research session</p>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <StatusCard title="LLM provider" ready={llmReady}>
              {LLM_PROVIDERS.filter((p) => hasKeys[p.saved as keyof HasKeys]).map((p) => (
                <span key={p.value}>• {p.label}</span>
              ))}
              {!llmReady && "No keys configured"}
            </StatusCard>
            <StatusCard title="Search provider" ready={searchReady}>
              {SEARCH_PROVIDERS.filter((p) => hasKeys[p.saved as keyof HasKeys]).map((p) => (
                <span key={p.value}>• {p.label}</span>
              ))}
              {!searchReady && "No keys configured"}
            </StatusCard>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ring-1",
              ready
                ? "bg-success/10 text-success ring-success/20"
                : "bg-warning/10 text-warning ring-warning/20"
            )}
          >
            {ready ? (
              <>
                <Check className="size-4" /> Ready to research
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" /> Configure at least one LLM and one search key
              </>
            )}
          </div>
        </div>

        {/* LLM section */}
        <div className="space-y-5 glass rounded-2xl p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <ServerCog className="size-4" />
            </span>
            <h2 className="text-base font-semibold text-foreground">LLM provider</h2>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="llm-provider">Provider</Label>
                <Select
                  value={settings.llm_provider}
                  onValueChange={(v) => set({ llm_provider: String(v) })}
                >                  <SelectTrigger id="llm-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LLM_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="llm-model">Model</Label>
                <Input
                  id="llm-model"
                  value={settings.llm_model}
                  onChange={(e) => set({ llm_model: e.target.value })}
                  placeholder="gpt-4o"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {LLM_PROVIDERS.map((p) => (
                <KeyField
                  key={p.value}
                  label={p.label}
                  value={settings[p.keyField as keyof SettingsState] as string}
                  onChange={(v) => set({ [p.keyField]: v } as Partial<SettingsState>)}
                  saved={hasKeys[p.saved as keyof HasKeys]}
                  placeholder={LLM_PLACEHOLDER[p.keyField] ?? "..."}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Search section */}
        <div className="space-y-5 glass rounded-2xl p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Search className="size-4" />
            </span>
            <h2 className="text-base font-semibold text-foreground">Search provider</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="search-provider">Provider</Label>
              <Select
                value={settings.search_provider}
                onValueChange={(v) => set({ search_provider: String(v) })}
              >
                <SelectTrigger id="search-provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="hidden sm:block" />
            {SEARCH_PROVIDERS.map((p) => (
              <KeyField
                key={p.value}
                label={p.label}
                value={settings[p.keyField as keyof SettingsState]}
                onChange={(v) => set({ [p.keyField]: v } as Partial<SettingsState>)}
                saved={hasKeys[p.saved as keyof HasKeys]}
                placeholder={p.placeholder}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} className="rounded-full px-6">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            {saving ? "Saving…" : "Save settings"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-success">
              <Check className="size-4" /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

function StatusCard({
  title,
  ready,
  children,
}: {
  title: string
  ready: boolean
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
        <span className={cn("size-1.5 rounded-full", ready ? "bg-success" : "bg-warning")} />
        {title}
      </p>
      <p className={cn("text-xs leading-relaxed", ready ? "text-muted-foreground" : "text-warning")}>
        {children}
      </p>
    </div>
  )
}

function KeyField({
  label,
  value,
  onChange,
  saved,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  saved: boolean
  placeholder: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {saved && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-success">
            <Check className="size-3" /> Saved
          </span>
        )}
      </div>
      <Input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={saved ? "••••••••" : placeholder}
      />
    </div>
  )
}
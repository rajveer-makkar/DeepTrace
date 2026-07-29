"use client"

import { useEffect, useState } from "react"
import { getSettings, updateSettings } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    llm_provider: "openai",
    llm_model: "gpt-4o",
    search_provider: "tavily",
    openai_api_key: "",
    openrouter_api_key: "",
    anthropic_api_key: "",
    opencode_api_key: "",
    tavily_api_key: "",
    brave_api_key: "",
  })
  const [hasKeys, setHasKeys] = useState({
    openai: false,
    openrouter: false,
    anthropic: false,
    opencode: false,
    tavily: false,
    brave: false,
  })
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
      .catch(() => setError("Could not reach backend. Is the server running?"))
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Settings</h1>

      {error && (
        <div className="glass-sm bg-destructive/10 border-destructive/30 px-5 py-4 text-sm text-destructive font-medium mb-6">
          {error}
        </div>
      )}

      <div className="glass bg-card p-6 mb-8 text-sm space-y-3">
        <p className="font-bold text-base mb-2">Provider Status</p>
        <p className={hasKeys.openai || hasKeys.openrouter || hasKeys.anthropic || hasKeys.opencode ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}>
          LLM keys: {hasKeys.openai ? "✓ OpenAI" : ""}{hasKeys.openrouter ? " ✓ OpenRouter" : ""}{hasKeys.anthropic ? " ✓ Anthropic" : ""}{hasKeys.opencode ? " ✓ OpenCode" : ""}
          {!hasKeys.openai && !hasKeys.openrouter && !hasKeys.anthropic && !hasKeys.opencode ? "✗ None" : ""}
        </p>
        <p className={hasKeys.tavily || hasKeys.brave ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}>
          Search keys: {hasKeys.tavily ? "✓ Tavily" : ""}{hasKeys.brave ? " ✓ Brave" : ""}
          {!hasKeys.tavily && !hasKeys.brave ? "✗ None" : ""}
        </p>
        {settings.llm_provider === "openai" && !hasKeys.openai && hasKeys.openrouter && (
          <p className="text-amber-600 text-sm">OpenAI selected but no key — will use OpenRouter instead</p>
        )}
        {settings.llm_provider === "opencode" && !hasKeys.opencode && hasKeys.openai && (
          <p className="text-amber-600 text-sm">OpenCode selected but no key — will use OpenAI instead</p>
        )}
        {settings.search_provider === "brave" && !hasKeys.brave && hasKeys.tavily && (
          <p className="text-amber-600 text-sm">Brave selected but no key — will use Tavily instead</p>
        )}
        {settings.search_provider === "tavily" && !hasKeys.tavily && hasKeys.brave && (
          <p className="text-amber-600 text-sm">Tavily selected but no key — will use Brave instead</p>
        )}
        {(hasKeys.openai || hasKeys.openrouter || hasKeys.anthropic || hasKeys.opencode) && (hasKeys.tavily || hasKeys.brave) ? (
          <p className="text-green-700 dark:text-green-400 text-sm font-medium pt-2">Ready to research</p>
        ) : (
          <p className="text-destructive text-sm font-medium pt-2">Set at least one LLM key and one search key</p>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="glass bg-card p-8 space-y-6">
          <h2 className="text-xl font-bold">LLM Provider</h2>
          <div>
            <label className="block text-base font-medium mb-2">Provider</label>
            <select
              value={settings.llm_provider}
              onChange={(e) => setSettings((s) => ({ ...s, llm_provider: e.target.value }))}
              className="glass-inset w-full bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="openai">OpenAI</option>
              <option value="openrouter">OpenRouter</option>
              <option value="anthropic">Anthropic</option>
              <option value="opencode">OpenCode Zen</option>
            </select>
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Model</label>
            <input
              type="text"
              value={settings.llm_model}
              onChange={(e) => setSettings((s) => ({ ...s, llm_model: e.target.value }))}
              placeholder="gpt-4o"
              className="glass-inset w-full bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>

          <fieldset className="space-y-4 pt-2">
            <legend className="text-base font-medium mb-2">API Keys</legend>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                OpenAI {hasKeys.openai && "(saved)"}
              </label>
              <input
                type="password"
                value={settings.openai_api_key}
                onChange={(e) => setSettings((s) => ({ ...s, openai_api_key: e.target.value }))}
                placeholder={hasKeys.openai ? "sk-••••••••" : "sk-..."}
                className="glass-inset w-full bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                OpenRouter {hasKeys.openrouter && "(saved)"}
              </label>
              <input
                type="password"
                value={settings.openrouter_api_key}
                onChange={(e) => setSettings((s) => ({ ...s, openrouter_api_key: e.target.value }))}
                placeholder={hasKeys.openrouter ? "sk-or-••••" : "sk-or-..."}
                className="glass-inset w-full bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Anthropic {hasKeys.anthropic && "(saved)"}
              </label>
              <input
                type="password"
                value={settings.anthropic_api_key}
                onChange={(e) => setSettings((s) => ({ ...s, anthropic_api_key: e.target.value }))}
                placeholder={hasKeys.anthropic ? "sk-ant-••••" : "sk-ant-..."}
                className="glass-inset w-full bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                OpenCode Zen {hasKeys.opencode && "(saved)"}
              </label>
              <input
                type="password"
                value={settings.opencode_api_key}
                onChange={(e) => setSettings((s) => ({ ...s, opencode_api_key: e.target.value }))}
                placeholder={hasKeys.opencode ? "oc-••••" : "oc-..."}
                className="glass-inset w-full bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
          </fieldset>
        </div>

        <div className="glass bg-card p-8 space-y-6">
          <h2 className="text-xl font-bold">Search Provider</h2>
          <div>
            <label className="block text-base font-medium mb-2">Provider</label>
            <select
              value={settings.search_provider}
              onChange={(e) => setSettings((s) => ({ ...s, search_provider: e.target.value }))}
              className="glass-inset w-full bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="tavily">Tavily</option>
              <option value="brave">Brave</option>
            </select>
          </div>

          <fieldset className="space-y-4 pt-2">
            <legend className="text-base font-medium mb-2">API Keys</legend>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Tavily {hasKeys.tavily && "(saved)"}
              </label>
              <input
                type="password"
                value={settings.tavily_api_key}
                onChange={(e) => setSettings((s) => ({ ...s, tavily_api_key: e.target.value }))}
                placeholder={hasKeys.tavily ? "tvly-••••" : "tvly-..."}
                className="glass-inset w-full bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Brave {hasKeys.brave && "(saved)"}
              </label>
              <input
                type="password"
                value={settings.brave_api_key}
                onChange={(e) => setSettings((s) => ({ ...s, brave_api_key: e.target.value }))}
                placeholder={hasKeys.brave ? "BSA-••••" : "BSA-..."}
                className="glass-inset w-full bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
          </fieldset>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving} className="glass px-8 py-3 text-base font-semibold bg-primary text-primary-foreground">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
          {saved && <span className="text-base text-green-600 font-medium">Saved</span>}
        </div>
      </form>
    </div>
  )
}

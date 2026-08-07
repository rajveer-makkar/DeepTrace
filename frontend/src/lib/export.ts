function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function inlineHtml(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
}

function mdToHtml(md: string): string {
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  let inCode = false
  let inList = false

  const closeList = () => {
    if (inList) {
      out.push("</ul>")
      inList = false
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        out.push("</code></pre>")
        inCode = false
      } else {
        closeList()
        out.push("<pre><code>")
        inCode = true
      }
      continue
    }
    if (inCode) {
      out.push(esc(line))
      continue
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    if (h) {
      closeList()
      out.push(`<h${h[1].length}>${inlineHtml(h[2])}</h${h[1].length}>`)
      continue
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      if (!inList) {
        out.push("<ul>")
        inList = true
      }
      out.push(`<li>${inlineHtml(line.replace(/^\s*[-*+]\s+/, ""))}</li>`)
      continue
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      closeList()
      out.push(`<li>${inlineHtml(line.replace(/^\s*\d+[.)]\s+/, ""))}</li>`)
      continue
    }
    if (/^\s*(---|\*\*\*)\s*$/.test(line)) {
      closeList()
      out.push("<hr/>")
      continue
    }
    if (line.trim() === "") {
      closeList()
      continue
    }
    closeList()
    out.push(`<p>${inlineHtml(line)}</p>`)
  }
  if (inCode) out.push("</code></pre>")
  closeList()
  return out.join("\n")
}

export function downloadMarkdown(report: string, name: string) {
  const blob = new Blob([report], { type: "text/markdown" })
  triggerDownload(URL.createObjectURL(blob), `${name}.md`)
}

export function downloadHtml(report: string, name: string) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(name)}</title>
<style>
  body{font-family:Inter,system-ui,sans-serif;max-width:760px;margin:3rem auto;padding:0 1.5rem;line-height:1.7;color:#1a1a1a}
  h1,h2,h3{line-height:1.3} pre{background:#f5f5f5;padding:1rem;overflow:auto;border-radius:8px}
  code{background:#f5f5f5;padding:0.1em 0.3em;border-radius:4px}
  a{color:#0a84ff} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:0.4rem 0.6rem;text-align:left}
</style></head><body>${mdToHtml(report)}</body></html>`
  const blob = new Blob([html], { type: "text/html" })
  triggerDownload(URL.createObjectURL(blob), `${name}.html`)
}

export function downloadJson(data: unknown, name: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  triggerDownload(URL.createObjectURL(blob), `${name}.json`)
}

export function printReport(report: string, name: string) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<title>${esc(name)}</title>
<style>
  body{font-family:Inter,system-ui,sans-serif;max-width:760px;margin:2rem auto;padding:0 1.5rem;line-height:1.7;color:#111}
  pre{background:#f5f5f5;padding:1rem;overflow:auto;border-radius:8px} a{color:#0a84ff}
  table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:0.4rem 0.6rem;text-align:left}
</style></head><body>${mdToHtml(report)}</body></html>`
  const win = window.open("", "_blank")
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  win.onafterprint = () => win.close()
  win.print()
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
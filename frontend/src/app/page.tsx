import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
      <div className="glass-lg bg-card p-16 max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">DeepTrace</h1>
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
          Deep research engine. Ask a question and get a thoroughly researched answer with verified sources.
        </p>
        <Link
          href="/research"
          className="glass-lg inline-flex items-center justify-center px-10 py-4 text-base font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
        >
          Start Research
        </Link>
      </div>
    </div>
  )
}

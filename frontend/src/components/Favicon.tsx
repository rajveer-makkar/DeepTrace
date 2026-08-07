import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { hostname } from "@/lib/format"
import { cn } from "@/lib/utils"

export function Favicon({ url, size = "md" }: { url: string; size?: "sm" | "md" }) {
  const host = hostname(url)
  const src = `https://www.google.com/s2/favicons?domain=${host}&sz=64`
  return (
    <Avatar className={cn("rounded-md bg-surface ring-1 ring-border", size === "sm" ? "size-5" : "size-7")}>
      <AvatarImage src={src} alt="" />
      <AvatarFallback className="rounded-md text-[10px] uppercase text-muted-foreground">
        {host.slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  )
}
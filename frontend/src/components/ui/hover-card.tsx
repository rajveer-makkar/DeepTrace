"use client"

import * as React from "react"
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card"

import { cn } from "@/lib/utils"

function HoverCard(props: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({
  className,
  ...props
}: PreviewCardPrimitive.Trigger.Props & { className?: string }) {
  return <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" className={cn("", className)} {...props} />
}

function HoverCardContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner sideOffset={8}>
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "z-50 w-80 rounded-xl border border-border bg-popover p-4 text-sm text-popover-foreground shadow-xl shadow-black/40 outline-none",
            className
          )}
        >
          {children}
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
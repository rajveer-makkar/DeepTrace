"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({ children, ...props }: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider delay={150} {...props}>
      {children}
    </TooltipPrimitive.Provider>
  )
}

function Tooltip({
  children,
  ...props
}: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>
}

function TooltipTrigger({ children, ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger {...props}>{children}</TooltipPrimitive.Trigger>
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: TooltipPrimitive.Positioner.Props & { className?: string; sideOffset?: number }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={sideOffset} {...props}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 max-w-xs rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg shadow-black/30",
            className
          )}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
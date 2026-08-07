"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ChevronDown, Check } from "lucide-react"

import { cn } from "@/lib/utils"

function Select(props: SelectPrimitive.Root.Props<string>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props & { className?: string }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-surface px-3 text-sm text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/30 data-[popup-open]:border-primary/50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
    </SelectPrimitive.Trigger>
  )
}

function SelectValue({
  className,
  children,
  ...props
}: SelectPrimitive.Value.Props & { className?: string }) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex-1 truncate text-left", className)}
      {...props}
    >
      {children}
    </SelectPrimitive.Value>
  )
}

function SelectContent({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner align="start" sideOffset={6}>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "z-50 min-w-[var(--anchor-width)] overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl shadow-black/40 outline-none",
            className
          )}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props & { className?: string }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 pl-8 text-sm text-foreground outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-selected:bg-accent data-selected:text-accent-foreground",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator
        data-slot="select-item-indicator"
        className="absolute left-2 inline-flex items-center"
      >
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
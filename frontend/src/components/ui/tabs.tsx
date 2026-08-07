"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: TabsPrimitive.Root.Props & { className?: string }) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("w-full", className)} {...props} />
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.List.Props & { className?: string }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-0.5 rounded-lg border border-border bg-surface p-0.5",
        className
      )}
      {...props}
    />
  )
}

function TabsTab({
  className,
  ...props
}: TabsPrimitive.Tab.Props & { className?: string }) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-[calc(var(--radius-md)-3px)] px-3 py-1 text-sm font-medium text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-selected:bg-card data-selected:text-foreground data-selected:shadow-sm data-selected:border data-selected:border-border",
        className
      )}
      {...props}
    />
  )
}

function TabsPanel({
  className,
  ...props
}: TabsPrimitive.Panel.Props & { className?: string }) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn("mt-4 w-full", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTab, TabsPanel }
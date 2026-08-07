"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  className,
  ...props
}: AccordionPrimitive.Root.Props & { className?: string }) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("divide-y divide-border rounded-lg border border-border bg-surface", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: AccordionPrimitive.Item.Props & { className?: string }) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("", className)} {...props} />
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props & { className?: string }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-foreground transition-colors outline-none hover:bg-accent/50 data-panel-open:bg-accent/30",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform data-panel-open:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props & { className?: string }) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn("overflow-hidden text-sm text-muted-foreground", className)}
      {...props}
    >
      <div className="px-4 pb-4 pt-0.5">{children}</div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
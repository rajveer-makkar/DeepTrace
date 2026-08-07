"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ className, ...props }: DialogPrimitive.Trigger.Props & { className?: string }) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" className={cn("", className)} {...props} />
}

function DialogContent({
  className,
  title,
  children,
}: {
  className?: string
  title?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 glass-strong rounded-xl p-6 shadow-2xl shadow-black/50 outline-none",
          className
        )}
      >
        {title && <DialogPrimitive.Title className="text-lg font-semibold text-foreground">{title}</DialogPrimitive.Title>}
        {children}
        <DialogPrimitive.Close
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

export { Dialog, DialogTrigger, DialogContent }
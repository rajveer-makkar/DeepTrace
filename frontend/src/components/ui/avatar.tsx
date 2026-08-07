"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@/lib/utils"

function Avatar({ className, ...props }: AvatarPrimitive.Root.Props & { className?: string }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props & { className?: string }) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("size-full object-cover", className)} {...props} />
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props & { className?: string }) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("grid size-full place-items-center bg-muted text-xs font-medium", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
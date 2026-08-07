"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger({
  className,
  ...props
}: MenuPrimitive.Trigger.Props & { className?: string }) {
  return <MenuPrimitive.Trigger data-slot="dropdown-trigger" className={cn("", className)} {...props} />
}

function DropdownMenuContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner align="end" sideOffset={6}>
        <MenuPrimitive.Popup
          data-slot="dropdown-content"
          className={cn(
            "z-50 min-w-44 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl shadow-black/40 outline-none",
            className
          )}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-label"
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <MenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
}

function DropdownMenuItem({
  className,
  children,
  ...props
}: MenuPrimitive.Item.Props & { className?: string }) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </MenuPrimitive.Item>
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: MenuPrimitive.CheckboxItem.Props & { className?: string }) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-checkbox"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2.5 rounded-md py-2 pr-2.5 pl-8 text-sm text-foreground outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 inline-flex items-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <Check className="size-4" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
}
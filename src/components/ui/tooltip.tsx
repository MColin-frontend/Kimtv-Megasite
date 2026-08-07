"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// CSS-only tooltip — replaces @base-ui/react/tooltip + floating-ui (~184 KB) with zero JS.
// Hover state is driven by Tailwind group-hover; no event listeners, no positioning library.

function TooltipProvider({ children }: { children?: ReactNode; delay?: number }) {
  return <>{children}</>
}

function Tooltip({ children, className }: { children?: ReactNode; className?: string }) {
  return <span className={cn("group/tip relative inline-flex", className)}>{children}</span>
}

function TooltipTrigger({
  children,
  className,
  ...props
}: {
  children?: ReactNode
  className?: string
  [key: string]: unknown
}) {
  return (
    <span data-slot="tooltip-trigger" className={className} {...props}>
      {children}
    </span>
  )
}

const SIDE_CLASSES: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
  left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
  right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
}

function TooltipContent({
  children,
  className,
  side = "top",
  // accept but ignore the old positioner props to keep call-sites unchanged
  sideOffset: _so,
  align: _a,
  alignOffset: _ao,
  ...props
}: {
  children?: ReactNode
  className?: string
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  align?: string
  alignOffset?: number
  [key: string]: unknown
}) {
  return (
    <span
      role="tooltip"
      data-slot="tooltip-content"
      className={cn(
        // hidden by default, visible on group hover
        "pointer-events-none absolute z-[999] hidden group-hover/tip:inline-flex",
        // appearance
        "bg-foreground text-background w-max max-w-xs items-center rounded-md px-3 py-1.5 text-xs",
        SIDE_CLASSES[side] ?? SIDE_CLASSES.top,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

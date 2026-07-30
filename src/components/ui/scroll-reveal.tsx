"use client"

import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react"
import { Children, cloneElement, isValidElement } from "react"

import { cn } from "@/lib/utils"
import { useInView } from "@/hooks/use-in-view"

export type RevealVariant =
  "fade-up" | "fade-down" | "fade-left" | "fade-right" | "fade" | "scale" | "blur" | "clip"

interface ScrollRevealProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  children: ReactNode
  variant?: RevealVariant
  delay?: number
  duration?: number
  distance?: number
  threshold?: number
  once?: boolean
  className?: string
}

interface StaggerRevealProps {
  children: ReactNode
  variant?: RevealVariant
  /** ms giữa mỗi item */
  stagger?: number
  delay?: number
  duration?: number
  threshold?: number
  className?: string
}

/* ── Tính style ẩn / hiện theo variant ─────────────────────── */

function getStyles(
  variant: RevealVariant,
  distance: number,
  duration: number,
  delay: number
): { hidden: CSSProperties; visible: CSSProperties } {
  const transition = `opacity ${duration}ms cubic-bezier(.22,1,.36,1), transform ${duration}ms cubic-bezier(.22,1,.36,1), filter ${duration}ms ease`
  const base = { transition, transitionDelay: `${delay}ms` }

  const map: Record<RevealVariant, { hidden: CSSProperties; visible: CSSProperties }> = {
    "fade-up": {
      hidden: { ...base, opacity: 0, transform: `translateY(${distance}px)` },
      visible: { ...base, opacity: 1, transform: "translateY(0)" },
    },
    "fade-down": {
      hidden: { ...base, opacity: 0, transform: `translateY(-${distance}px)` },
      visible: { ...base, opacity: 1, transform: "translateY(0)" },
    },
    "fade-left": {
      hidden: { ...base, opacity: 0, transform: `translateX(${distance}px)` },
      visible: { ...base, opacity: 1, transform: "translateX(0)" },
    },
    "fade-right": {
      hidden: { ...base, opacity: 0, transform: `translateX(-${distance}px)` },
      visible: { ...base, opacity: 1, transform: "translateX(0)" },
    },
    fade: {
      hidden: { ...base, opacity: 0 },
      visible: { ...base, opacity: 1 },
    },
    scale: {
      hidden: { ...base, opacity: 0, transform: "scale(0.92)" },
      visible: { ...base, opacity: 1, transform: "scale(1)" },
    },
    blur: {
      hidden: {
        ...base,
        opacity: 0,
        filter: "blur(12px)",
        transform: `translateY(${distance * 0.5}px)`,
      },
      visible: { ...base, opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
    },
    clip: {
      hidden: { ...base, opacity: 1, clipPath: "inset(100% 0 0 0)" },
      visible: { ...base, opacity: 1, clipPath: "inset(0% 0 0 0)" },
    },
  }

  return map[variant]
}

/* ── ScrollReveal — wrap 1 element ─────────────────────────── */

export function ScrollReveal({
  as: Tag = "div",
  children,
  variant = "fade-up",
  delay = 0,
  duration = 550,
  distance = 28,
  threshold = 0.1,
  once = true,
  className,
  style,
  ...props
}: ScrollRevealProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold, once })
  const { hidden, visible } = getStyles(variant, distance, duration, delay)

  return (
    <Tag
      ref={ref}
      className={cn("will-change-[opacity,transform,filter]", className)}
      style={{ ...(inView ? visible : hidden), ...style }}
      {...props}
    >
      {children}
    </Tag>
  )
}

/* ── StaggerReveal — wrap list, mỗi child delay stagger ────── */

export function StaggerReveal({
  children,
  variant = "fade-up",
  stagger = 80,
  delay = 0,
  duration = 500,
  threshold = 0.08,
  className,
}: StaggerRevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold, once: true })

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child
        const { hidden, visible } = getStyles(variant, 20, duration, delay + i * stagger)
        return cloneElement(
          child as React.ReactElement<{ style?: CSSProperties; className?: string }>,
          {
            style: {
              ...(inView ? visible : hidden),
              willChange: "opacity, transform",
              ...(child.props as { style?: CSSProperties }).style,
            },
          }
        )
      })}
    </div>
  )
}

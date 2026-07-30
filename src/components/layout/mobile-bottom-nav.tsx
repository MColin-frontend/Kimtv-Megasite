"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { useBoolean } from "@/hooks/use-boolean"

import { SLUG_MAP, useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"
import { MAIN_NAV_ITEMS } from "@/constants/component/layout.constants"

import { Img } from "@/components/ui/image"

const BAR_COLOR = "#111d35" // noticeably lighter than page (#091320) so notch is visible
const BAR_H = 64
const CIRCLE_R = 35
const NOTCH_R = 39 // tight around circle: gap = 39-35 = 4px

/** SVG path: bar with true circular notch using 2-segment bezier approximation */
function buildPath(W: number, cx: number): string {
  const H = BAR_H
  const R = NOTCH_R
  const k = 0.5523 // magic number for quarter-circle bezier

  const lx = cx - R
  const rx = cx + R

  return [
    `M 0,${H}`,
    `L 0,0`,
    `L ${lx},0`,
    // Left quarter-circle: (lx,0) → (cx,R)
    // CP1: go down from lx (vertical tangent)
    // CP2: approach from left at depth R (horizontal tangent)
    `C ${lx},${R * k} ${cx - R * k},${R} ${cx},${R}`,
    // Right quarter-circle: (cx,R) → (rx,0)
    `C ${cx + R * k},${R} ${rx},${R * k} ${rx},0`,
    `L ${W},0`,
    `L ${W},${H}`,
    `Z`,
  ].join(" ")
}

export function MobileBottomNav() {
  const { locale, t } = useTranslation()
  const pathname = usePathname()
  const routes = getRoutes(locale)
  const navRef = useRef<HTMLDivElement>(null)
  const [cx, setCx] = useState(0)
  const [W, setW] = useState(375)
  const { value: ready, on: setReady } = useBoolean()

  function isActive(href: string, relatedSlugs?: string[]): boolean {
    if (href === `/${locale}`) return pathname === `/${locale}`
    const viSlug = href.split("/")[2] ?? ""
    const localizedSlugs = Object.values(SLUG_MAP[viSlug] ?? {})
    if (pathname.includes(`/${viSlug}`) || localizedSlugs.some((s) => pathname.includes(`/${s}`)))
      return true
    return !!relatedSlugs?.some((s) => pathname.includes(`/${s}`))
  }

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const width = nav.offsetWidth
    setW(width)
    const active = nav.querySelector<HTMLElement>("[data-active='true']")
    if (active) setCx(active.offsetLeft + active.offsetWidth / 2)
    setReady()
  }, [pathname])

  const path = ready ? buildPath(W, cx) : null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <div ref={navRef} className="relative" style={{ height: BAR_H }}>
        {/* Bar SVG */}
        {path ? (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 w-full overflow-visible"
            height={BAR_H}
            viewBox={`0 0 ${W} ${BAR_H}`}
            preserveAspectRatio="none"
            style={{ filter: "drop-shadow(0 -6px 28px rgba(0,0,0,0.7))" }}
          >
            <path d={path} fill={BAR_COLOR} />
          </svg>
        ) : (
          <div className="absolute inset-0" style={{ background: BAR_COLOR }} />
        )}

        {/* Items */}
        <div className="relative flex h-full items-center justify-around">
          {MAIN_NAV_ITEMS.map((item) => {
            const href = item.getHref(routes)
            const active = isActive(href, item.relatedSlugs)
            const Icon = item.icon
            if (!Icon) return null

            return (
              <Link
                key={item.labelKey}
                href={href}
                data-active={active}
                className="group relative flex flex-1 flex-col items-center justify-center gap-1"
              >
                <div
                  className={cn(
                    "relative flex items-center justify-center transition-all duration-300 ease-out",
                    active ? "-translate-y-9" : "translate-y-0"
                  )}
                >
                  {/* Circle wrapper — only for active */}
                  {active && (
                    <div
                      className="absolute rounded-full"
                      style={{
                        background: BAR_COLOR,
                        boxShadow: [
                          "0 20px 48px -4px rgba(0,0,0,0.95)",
                          "0 10px 20px -2px rgba(0,0,0,0.85)",
                          "inset 0 1px 0 rgba(255,255,255,0.08)", // top highlight
                        ].join(", "),
                        width: CIRCLE_R * 2,
                        height: CIRCLE_R * 2,
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10">
                    {item.iconSrc ? (
                      <Img
                        src={item.iconSrc}
                        alt=""
                        width={28}
                        height={28}
                        objectFit="contain"
                        className={cn(
                          "transition-all duration-300",
                          active ? "size-[26px]" : "size-[22px] opacity-55 group-hover:opacity-80"
                        )}
                        style={
                          active
                            ? {
                                filter: [
                                  "drop-shadow(0 0 2px rgba(246,195,67,1))",
                                  "drop-shadow(0 0 10px rgba(246,195,67,1))",
                                  "drop-shadow(0 0 24px rgba(246,195,67,0.85))",
                                  "brightness(1.2) sepia(1) saturate(3) hue-rotate(5deg)",
                                ].join(" "),
                              }
                            : undefined
                        }
                      />
                    ) : Icon ? (
                      <Icon
                        weight={active ? "fill" : "regular"}
                        size={active ? 28 : 22}
                        className={cn(
                          "transition-all duration-300",
                          active ? "text-gold" : "text-white/55 group-hover:text-white/80"
                        )}
                        style={
                          active
                            ? {
                                filter: [
                                  "drop-shadow(0 0 2px rgba(246,195,67,1))",
                                  "drop-shadow(0 0 10px rgba(246,195,67,1))",
                                  "drop-shadow(0 0 24px rgba(246,195,67,0.85))",
                                ].join(" "),
                              }
                            : undefined
                        }
                      />
                    ) : null}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 flex size-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-90" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-red-600 shadow-[0_0_6px_2px_rgba(220,38,38,1),0_0_12px_4px_rgba(220,38,38,0.6)]" />
                      </span>
                    )}
                  </div>
                </div>
                {!active && (
                  <span className="font-500 text-[9px] leading-none text-white/40 transition-colors group-hover:text-white/65">
                    {t(item.labelKey)}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* iPhone safe area */}
      <div style={{ height: "env(safe-area-inset-bottom,0px)", background: BAR_COLOR }} />
    </nav>
  )
}

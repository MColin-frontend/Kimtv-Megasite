"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

import { SLUG_MAP, useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"
import { MAIN_NAV_ITEMS } from "@/constants/component/layout.constants"

import { Img } from "@/components/ui/image"

const BAR_COLOR = "#111d35"
const BAR_H = 64
const CIRCLE_R = 35
const NOTCH_R = 39

function buildPath(W: number, cx: number): string {
  const H = BAR_H
  const R = NOTCH_R
  const k = 0.5523

  const lx = cx - R
  const rx = cx + R

  return [
    `M 0,${H}`,
    `L 0,0`,
    `L ${lx},0`,
    `C ${lx},${R * k} ${cx - R * k},${R} ${cx},${R}`,
    `C ${cx + R * k},${R} ${rx},${R * k} ${rx},0`,
    `L ${W},0`,
    `L ${W},${H}`,
    `Z`,
  ].join(" ")
}

// Only items that render (have an icon)
const NAV_ITEMS = MAIN_NAV_ITEMS.filter((item) => item.icon)

export function MobileBottomNav() {
  const { locale, t } = useTranslation()
  const pathname = usePathname()
  const routes = getRoutes(locale)

  // window.innerWidth does NOT force layout — it's a global value always available.
  // Replaces el.offsetWidth + active.offsetLeft + active.offsetWidth (3 layout reads)
  // with pure arithmetic from item index and viewport width.
  const [W, setW] = useState<number>(() => typeof window !== "undefined" ? window.innerWidth : 0)

  useEffect(() => {
    function onResize() {
      setW(window.innerWidth)
    }
    window.addEventListener("resize", onResize, { passive: true })
    return () => window.removeEventListener("resize", onResize)
  }, [])

  function isActive(href: string, relatedSlugs?: string[]): boolean {
    if (href === `/${locale}`) return pathname === `/${locale}`
    const viSlug = href.split("/")[2] ?? ""
    const localizedSlugs = Object.values(SLUG_MAP[viSlug] ?? {})
    if (pathname.includes(`/${viSlug}`) || localizedSlugs.some((s) => pathname.includes(`/${s}`)))
      return true
    return !!relatedSlugs?.some((s) => pathname.includes(`/${s}`))
  }

  // Compute active item center from index — nav is fixed inset-x-0 with equal flex-1 items,
  // so center of item k = (k + 0.5) * W / itemCount. No DOM geometry read needed.
  const activeIndex = NAV_ITEMS.findIndex((item) =>
    isActive(item.getHref(routes), item.relatedSlugs)
  )
  const cx = activeIndex >= 0 ? ((activeIndex + 0.5) * W) / NAV_ITEMS.length : null
  const path = cx !== null ? buildPath(W, cx) : null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <div className="relative" style={{ height: BAR_H }}>
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

        <div className="relative flex h-full items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const href = item.getHref(routes)
            const active = isActive(href, item.relatedSlugs)
            const Icon = item.icon

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
                  {active && (
                    <div
                      className="absolute rounded-full"
                      style={{
                        background: BAR_COLOR,
                        boxShadow: [
                          "0 20px 48px -4px rgba(0,0,0,0.95)",
                          "0 10px 20px -2px rgba(0,0,0,0.85)",
                          "inset 0 1px 0 rgba(255,255,255,0.08)",
                        ].join(", "),
                        width: CIRCLE_R * 2,
                        height: CIRCLE_R * 2,
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}

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

      <div style={{ height: "env(safe-area-inset-bottom,0px)", background: BAR_COLOR }} />
    </nav>
  )
}

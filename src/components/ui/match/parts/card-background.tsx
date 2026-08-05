import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import imgStadiumBg from "@assets/images/common/img-stadium-card-bg.webp"
import imgStadiumUpcoming from "@assets/images/common/img-stadium-upcoming.webp"

interface CardBackgroundProps {
  thumbnail?: string | null
  homeLogo?: string | null
  awayLogo?: string | null
  isUpcoming?: boolean
  stadiumSrc?: string
  stadiumClassName?: string
  thumbnailExtras?: ReactNode
  stadiumExtras?: ReactNode
  priority?: boolean
}

export function CardBackground({
  thumbnail,
  homeLogo,
  awayLogo,
  isUpcoming,
  stadiumSrc,
  stadiumClassName,
  thumbnailExtras,
  stadiumExtras,
  priority,
}: CardBackgroundProps) {
  const resolvedStadiumSrc =
    stadiumSrc ?? (isUpcoming ? imgStadiumUpcoming.src : imgStadiumBg.src)

  const fetchPri = priority ? "high" : "auto"
  const loading = priority ? "eager" : "lazy"

  return (
    <>
      {thumbnail ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt=""
            fetchPriority={fetchPri}
            loading={loading}
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-top"
          />
          <div className="card-thumbnail-overlay pointer-events-none absolute inset-0 z-[1]" />
          {thumbnailExtras}
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedStadiumSrc}
            alt=""
            fetchPriority={fetchPri}
            loading={loading}
            className={cn(
              "pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center",
              stadiumClassName,
            )}
          />
          {homeLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0 scale-[1.6] bg-no-repeat opacity-[0.13] [background-position:-10px_center] [background-size:160px] [filter:blur(55px)_saturate(2)]"
              style={{ backgroundImage: `url(${homeLogo})` }}
            />
          )}
          {awayLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0 scale-[1.6] bg-no-repeat opacity-10 [background-position:calc(100%_+_10px)_center] [background-size:160px] [filter:blur(55px)_saturate(2)]"
              style={{ backgroundImage: `url(${awayLogo})` }}
            />
          )}
          <div className="card-stadium-overlay pointer-events-none absolute inset-0 z-[1]" />
          {stadiumExtras}
        </>
      )}
    </>
  )
}

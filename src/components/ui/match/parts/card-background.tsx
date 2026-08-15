import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import imgStadiumBg from "@assets/images/common/img-stadium-card-bg.webp"
import imgStadiumUpcoming from "@assets/images/common/img-stadium-upcoming.webp"

// Route external logo URLs through Next.js image optimization (WebP, resized to 256px for 2x displays)
function optimizedLogoUrl(src: string) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=256&q=40`
}

interface CardBackgroundProps {
  thumbnail?: string | null
  homeLogo?: string | null
  awayLogo?: string | null
  isUpcoming?: boolean
  stadiumSrc?: string
  stadiumClassName?: string
  thumbnailExtras?: ReactNode
  stadiumExtras?: ReactNode
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
}: CardBackgroundProps) {
  const resolvedStadiumSrc = stadiumSrc ?? (isUpcoming ? imgStadiumUpcoming.src : imgStadiumBg.src)

  return (
    <>
      {thumbnail ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-[center_top]"
            style={{ backgroundImage: `url(${thumbnail})` }}
          />
          <div className="card-thumbnail-overlay pointer-events-none absolute inset-0 z-[1]" />
          {thumbnailExtras}
        </>
      ) : (
        <>
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-0 bg-cover bg-center",
              stadiumClassName
            )}
            style={{ backgroundImage: `url(${resolvedStadiumSrc})` }}
          />
          {homeLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0 [background-size:160px] [background-position:left_center] bg-no-repeat opacity-[0.13] [filter:blur(20px)_saturate(2)]"
              style={{ backgroundImage: `url(${optimizedLogoUrl(homeLogo)})` }}
            />
          )}
          {awayLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0 [background-size:160px] [background-position:right_center] bg-no-repeat opacity-10 [filter:blur(20px)_saturate(2)]"
              style={{ backgroundImage: `url(${optimizedLogoUrl(awayLogo)})` }}
            />
          )}
          <div className="card-stadium-overlay pointer-events-none absolute inset-0 z-[1]" />
          {stadiumExtras}
        </>
      )}
    </>
  )
}

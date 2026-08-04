import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// Team logos used as blurred color-glow backgrounds (blur 55px, opacity ≤ 13%).
// Route through /_next/image so the browser receives WebP at 128px instead of
// the raw PNG/JPEG from the CDN (~60-100 KiB each → ~3-5 KiB after conversion).
function blurLogoUrl(url: string) {
  return `/_next/image?url=${encodeURIComponent(url)}&w=128&q=20`
}

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
  const resolvedStadiumSrc =
    stadiumSrc ?? (isUpcoming ? imgStadiumUpcoming.src : imgStadiumBg.src)

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
              stadiumClassName,
            )}
            style={{ backgroundImage: `url(${resolvedStadiumSrc})` }}
          />
          {homeLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0 scale-[1.6] bg-no-repeat opacity-[0.13] [background-position:-10px_center] [background-size:160px] [filter:blur(55px)_saturate(2)]"
              style={{ backgroundImage: `url(${blurLogoUrl(homeLogo)})` }}
            />
          )}
          {awayLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0 scale-[1.6] bg-no-repeat opacity-10 [background-position:calc(100%_+_10px)_center] [background-size:160px] [filter:blur(55px)_saturate(2)]"
              style={{ backgroundImage: `url(${blurLogoUrl(awayLogo)})` }}
            />
          )}
          <div className="card-stadium-overlay pointer-events-none absolute inset-0 z-[1]" />
          {stadiumExtras}
        </>
      )}
    </>
  )
}

import type { ReactNode } from "react"
import NextImage from "next/image"

import { cn } from "@/lib/utils"
import { MATCH_CARD_IMG_QUALITY, MATCH_CARD_IMG_SIZES, nextImgUrl } from "@/lib/next-image.utils"

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

  return (
    <>
      {thumbnail ? (
        <>
          <NextImage
            src={thumbnail}
            alt=""
            fill
            priority={priority}
            sizes={MATCH_CARD_IMG_SIZES}
            quality={MATCH_CARD_IMG_QUALITY}
            className="pointer-events-none z-0 object-cover object-top"
          />
          <div className="card-thumbnail-overlay pointer-events-none absolute inset-0 z-[1]" />
          {thumbnailExtras}
        </>
      ) : (
        <>
          <NextImage
            src={resolvedStadiumSrc}
            alt=""
            fill
            priority={priority}
            sizes={MATCH_CARD_IMG_SIZES}
            quality={MATCH_CARD_IMG_QUALITY}
            className={cn(
              "pointer-events-none z-0 object-cover object-center",
              stadiumClassName,
            )}
          />
          {homeLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0 scale-[1.6] bg-no-repeat opacity-[0.13] [background-position:-10px_center] [background-size:160px] [filter:blur(55px)_saturate(2)]"
              style={{ backgroundImage: `url(${nextImgUrl(homeLogo, 64, 20)})` }}
            />
          )}
          {awayLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0 scale-[1.6] bg-no-repeat opacity-10 [background-position:calc(100%_+_10px)_center] [background-size:160px] [filter:blur(55px)_saturate(2)]"
              style={{ backgroundImage: `url(${nextImgUrl(awayLogo, 64, 20)})` }}
            />
          )}
          <div className="card-stadium-overlay pointer-events-none absolute inset-0 z-[1]" />
          {stadiumExtras}
        </>
      )}
    </>
  )
}

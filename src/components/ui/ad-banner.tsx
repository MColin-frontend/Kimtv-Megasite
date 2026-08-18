"use client"

import { useEffect, useRef } from "react"
import type { StaticImageData } from "next/image"

import { VIDEO_EXT_RE } from "@/lib/regex"
import { cn } from "@/lib/utils"
import { useBoolean } from "@/hooks/use-boolean"
import { useTracking } from "@/hooks/use-tracking"

import { TrackingValueEnum } from "@/enums/tracking.enum"

import { Img } from "@/components/ui/image"
import { Skeleton } from "@/components/ui/skeleton"

interface AdBannerProps {
  src?: string | null
  href?: string | null
  fallback?: string | StaticImageData | null
  isLoading?: boolean
  rounded?: string
  className?: string
  skeletonClassName?: string
  sizes?: string
  "aria-label"?: string
  matchId?: string
}

function AdMedia({
  src,
  fallback,
  rounded,
  sizes,
}: {
  src: string | StaticImageData | null
  fallback: string | StaticImageData | null
  rounded?: string
  sizes?: string
}) {
  const { value: errored, on: setErrored } = useBoolean()
  const url = errored && fallback ? fallback : src

  if (VIDEO_EXT_RE.test(url as string)) {
    return (
      <video
        key={url as string}
        autoPlay
        loop
        muted
        playsInline
        className={cn("w-full", rounded)}
        onError={() => fallback && !errored && setErrored()}
      >
        <source src={url as string} />
      </video>
    )
  }

  return (
    <Img
      src={url}
      alt=""
      width={0}
      height={0}
      sizes={sizes ?? "100vw"}
      className={cn("h-auto w-full", rounded)}
      onError={() => fallback && !errored && setErrored()}
    />
  )
}

export function AdBanner({
  src,
  href,
  fallback,
  isLoading,
  rounded = "",
  className,
  skeletonClassName,
  sizes,
  "aria-label": ariaLabel = "Quảng cáo",
  matchId = "",
}: AdBannerProps) {
  const wrapperRef = useRef<HTMLElement | null>(null)
  const impressionSentRef = useRef(false)

  // Dùng onClickAd + onAdImpression giống PC
  const { onClickAd, onAdImpression } = useTracking()

  useEffect(() => {
    const el = wrapperRef.current
    if (!el || !href || impressionSentRef.current) return
    if (typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || impressionSentRef.current) return
        impressionSentRef.current = true
        // Giống PC: onAdImpression({ matchId, ctaTrackingLink, ctaContent })
        onAdImpression({
          matchId,
          ctaTrackingLink: href,
          ctaContent: TrackingValueEnum.BANNER_ADS,
        })
        observer.disconnect()
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href])

  if (isLoading) {
    return <Skeleton className={cn("w-full", rounded, skeletonClassName)} />
  }

  const activeSrc = src || fallback
  if (!activeSrc) return null

  const media = (
    <AdMedia
      src={activeSrc as string}
      fallback={fallback as string}
      rounded={rounded}
      sizes={sizes}
    />
  )

  if (href) {
    return (
      <a
        ref={(el) => {
          wrapperRef.current = el
        }}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        onClick={(e) =>
          // Giống PC: onClickAd({ event, targetLink, ctaType, ctaPosition, matchId })
          onClickAd({
            event: e.nativeEvent,
            targetLink: href,
            ctaType: "banner_overlay",
            ctaPosition: "overlay",
            matchId,
          })
        }
        className={cn("overflow-hidden", rounded, className)}
      >
        {media}
      </a>
    )
  }

  return (
    <div
      ref={(el) => {
        wrapperRef.current = el
      }}
      className={cn("overflow-hidden", rounded, className)}
    >
      {media}
    </div>
  )
}

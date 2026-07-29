"use client"

import { useState } from "react"
import type { StaticImageData } from "next/image"

import { VIDEO_EXT_RE } from "@/lib/regex"
import { cn } from "@/lib/utils"

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
}

function AdMedia({
  src,
  fallback,
  rounded,
}: {
  src: string | StaticImageData | null
  fallback: string | StaticImageData | null
  rounded?: string
}) {
  const [errored, setErrored] = useState(false)
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
        onError={() => fallback && !errored && setErrored(true)}
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
      sizes="100vw"
      className={cn("h-auto w-full", rounded)}
      onError={() => fallback && !errored && setErrored(true)}
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
}: AdBannerProps) {
  if (isLoading) {
    return <Skeleton className={cn("w-full", rounded, skeletonClassName)} />
  }

  const activeSrc = src || fallback
  if (!activeSrc) return null

  const media = (
    <AdMedia src={activeSrc as string} fallback={fallback as string} rounded={rounded} />
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("overflow-hidden", rounded, className)}
      >
        {media}
      </a>
    )
  }

  return <div className={cn("overflow-hidden", rounded, className)}>{media}</div>
}

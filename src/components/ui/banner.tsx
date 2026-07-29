"use client"

import Link from "next/link"

import type { BannerItem } from "@/features/home/home.models"
import CarouselInfinity from "@/components/ui/carousel/carousel-infinity"
import { Img } from "@/components/ui/image"

interface BannerProps {
  alt: string
  data?: BannerItem[]
  autoPlayDelay?: number
  className?: string
}

function isInternal(url: string): boolean {
  return url.startsWith("/") || url.startsWith("#")
}

function BannerSlide({
  item,
  alt,
  className,
}: {
  item: BannerItem
  alt: string
  className?: string
}) {
  const img = (
    <Img
      src={item.imageUrl}
      alt={alt}
      priority
      width={item.width ?? 1660}
      height={item.height ?? 480}
      className="h-auto w-full"
    />
  )

  const wrapperClass = className ?? "block overflow-hidden rounded-8"

  if (!item.url) return <div className={wrapperClass}>{img}</div>

  if (isInternal(item.url)) {
    return (
      <Link href={item.url} className={wrapperClass}>
        {img}
      </Link>
    )
  }

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={wrapperClass}>
      {img}
    </a>
  )
}

export function Banner({ alt, data, autoPlayDelay = 3000, className }: BannerProps) {
  if (!data || data?.length === 0) return null

  if (data?.length > 1) {
    return (
      <CarouselInfinity
        items={data}
        renderItem={(item) => <BannerSlide item={item} alt={alt} className="block" />}
        keyExtractor={(_, i) => i}
        autoPlayDelay={autoPlayDelay}
        slideClassName="basis-full !pl-0"
        viewportClassName="rounded-12"
      />
    )
  }

  return <BannerSlide item={data?.[0]} alt={alt} className={className} />
}

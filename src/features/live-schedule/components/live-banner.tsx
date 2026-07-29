"use client"

import dynamic from "next/dynamic"

import { useAdPlacements } from "@/hooks/tanstack/use-ad-placements"

import heroBanner from "@assets/videos/common/video-wc-banner.mp4"

const AdBanner = dynamic(() => import("@/components/ui/ad-banner").then((m) => m.AdBanner), {
  ssr: false,
})

export function LiveBanner() {
  const { data: ads, isLoading } = useAdPlacements()
  const scheduleBanner = ads?.scheduleBanner

  return (
    <AdBanner
      src={scheduleBanner?.enabled ? scheduleBanner.mediaPc : null}
      href={scheduleBanner?.jumpUrl || null}
      fallback={heroBanner}
      isLoading={isLoading}
      skeletonClassName="aspect-[1660/132]"
      className="w-full"
      rounded="rounded-12 max-sm:rounded-4"
    />
  )
}

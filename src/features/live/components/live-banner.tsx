"use client"

import dynamic from "next/dynamic"

import { useAdPlacements } from "@/hooks/tanstack/use-ad-placements"

import heroBanner from "@assets/videos/common/video-wc-banner.mp4"

const AdBanner = dynamic(() => import("@/components/ui/ad-banner").then((m) => m.AdBanner), {
  ssr: false,
})

export function LiveBanner() {
  const { data: ads, isLoading } = useAdPlacements()
  const liveBanner = ads?.liveBanner

  return (
    <AdBanner
      src={liveBanner?.enabled ? liveBanner?.mediaPc : null}
      href={liveBanner?.jumpUrl || null}
      fallback={heroBanner}
      isLoading={isLoading}
      skeletonClassName="aspect-[1660/132]"
      className="w-full"
      rounded="rounded-8 max-sm:rounded-4"
    />
  )
}

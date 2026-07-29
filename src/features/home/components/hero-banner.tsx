"use client"

import dynamic from "next/dynamic"

import { useAdPlacements } from "@/hooks/tanstack/use-ad-placements"

import heroBanner from "@assets/videos/common/video-wc-banner.mp4"

const AdBanner = dynamic(() => import("@/components/ui/ad-banner").then((m) => m.AdBanner), {
  ssr: false,
})

export function HeroBanner() {
  const { data: ads, isLoading } = useAdPlacements()
  const homeBanner = ads?.homeBanner

  return (
    <AdBanner
      src={homeBanner?.enabled ? homeBanner.mediaPc : null}
      href={homeBanner?.jumpUrl || null}
      fallback={heroBanner}
      isLoading={isLoading}
      skeletonClassName="aspect-[1660/132]"
      className="w-full"
      rounded="rounded-12 max-md:rounded-4"
    />
  )
}

"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { initTrackingGeo } from "@/lib/tracking.constants"
import { useAuth } from "@/hooks/use-auth"
import { useTracking } from "@/hooks/use-tracking"

export function TrackingProvider() {
  const pathname = usePathname()
  const { user } = useAuth()

  const userId =
    user?.userId != null ? String(user.userId) : user?.uid != null ? String(user.uid) : null

  const { onPageView, onTimeOnPage } = useTracking({ userId })

  // Prefetch geo on mount so the first event has country/region populated
  useEffect(() => {
    initTrackingGeo()
  }, [])

  // Track page_view on each route change; return time_on_page cleanup
  useEffect(() => {
    onPageView()
    return onTimeOnPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}

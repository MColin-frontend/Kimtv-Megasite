"use client"

import { useQuery } from "@tanstack/react-query"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "@/hooks/useRouter"

import { useTranslation } from "@/i18n/use-translation"

import { fetchAnchorInfo } from "@/features/broadcast/broadcast.api"
import { Empty } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import { BroadcastCenterTabEnum } from "../broadcast.constants"
import { AnchorRegistrationPage } from "./anchor-registration"
import { BroadcastHero } from "./broadcast-hero"
import { BroadcastReservation } from "./broadcast-reservation"
import { BroadcastRules } from "./broadcast-rules"
import { BroadcastCenterSidebar, BroadcastCenterSidebarSkeleton } from "./center-sidebar"
import { StreamPanel } from "./stream-panel"
import { StreamSettings } from "./stream-settings"

function BroadcastHeroSkeleton() {
  return (
    <div className="card-glow rounded-16 p-6">
      <div className="flex items-center gap-5">
        <Skeleton className="size-[90px] shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="rounded-8 h-7 w-48" />
          <Skeleton className="rounded-6 h-4 w-64" />
        </div>
        <Skeleton className="rounded-4 h-7 w-24" />
      </div>
    </div>
  )
}

export function BroadcastPage() {
  const { data: anchorInfo, isLoading } = useQuery({
    queryKey: ["anchor-info"],
    queryFn: fetchAnchorInfo,
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="container flex flex-col gap-5">
        <BroadcastHeroSkeleton />
        <Skeleton className="rounded-16 h-80 w-full" />
      </div>
    )
  }

  if (!anchorInfo?.anchorId) {
    return (
      <div className="container flex flex-col gap-5">
        <AnchorRegistrationPage />
      </div>
    )
  }

  return (
    <div className="container flex flex-col gap-5">
      <BroadcastHero />

      <div className="grid grid-cols-[7fr_3fr] items-start gap-5 max-lg:grid-cols-1">
        <div className="flex flex-col gap-5">
          <StreamPanel />
          <StreamSettings />
        </div>
        <BroadcastRules />
      </div>
    </div>
  )
}

function TabContent() {
  const { t } = useTranslation()
  const { getParam } = useRouter()
  const { isLoading: authLoading } = useAuth()
  const tab = (getParam("tab") as BroadcastCenterTabEnum) ?? BroadcastCenterTabEnum.SETTINGS

  const { data: anchorInfo, isLoading: anchorLoading } = useQuery({
    queryKey: ["anchor-info"],
    queryFn: fetchAnchorInfo,
    staleTime: 60_000,
  })

  const isBLV = !!anchorInfo?.userId

  const content = (() => {
    if (anchorLoading) {
      return (
        <div className="flex flex-col gap-5">
          <BroadcastHeroSkeleton />
          <Skeleton className="rounded-16 h-80 w-full" />
        </div>
      )
    }

    if (!isBLV || tab === BroadcastCenterTabEnum.REGISTRATION) return <AnchorRegistrationPage />

    switch (tab) {
      case BroadcastCenterTabEnum.SETTINGS:
        return (
          <div className="flex flex-col gap-5">
            {authLoading ? <BroadcastHeroSkeleton /> : <BroadcastHero />}
            <StreamPanel />
            <StreamSettings />
          </div>
        )
      case BroadcastCenterTabEnum.RESERVATION:
        return <BroadcastReservation />
      case BroadcastCenterTabEnum.GUIDE:
        return <BroadcastRules />
      default:
        return (
          <Empty tip={t("broadcast-center.empty")} className="min-h-[40vh] [&_p]:text-white/30" />
        )
    }
  })()

  return (
    <div key={tab} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
      {content}
    </div>
  )
}

export function BroadcastCenterPage() {
  const { isLoading: authLoading } = useAuth()

  return (
    <div className="container py-4 sm:py-6">
      <div className="flex items-start gap-5 max-lg:flex-col max-lg:gap-4">
        <div className="sticky top-20 max-lg:static max-lg:top-0 max-lg:w-full">
          {authLoading ? <BroadcastCenterSidebarSkeleton /> : <BroadcastCenterSidebar />}
        </div>
        <div className="w-full min-w-0 flex-1 overflow-hidden">
          <TabContent />
        </div>
      </div>
    </div>
  )
}

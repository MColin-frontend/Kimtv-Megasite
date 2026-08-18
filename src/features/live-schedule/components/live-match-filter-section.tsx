"use client"

import type React from "react"
import { Fragment } from "react"
import NextImage from "next/image"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { payloadFilterClicked } from "@/lib/tracking.constants"
import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/use-router"
import { useTracking } from "@/hooks/use-tracking"

import { useTranslation } from "@/i18n"
import { TrackingPayloadKeyEnum } from "@/enums/tracking.enum"
import type { LiveSearchMatchInterface } from "@/models/match.models"

import {
  LIVE_MATCHES_PAGE_SIZE,
  liveMatchesGridQueryOptions,
} from "@/features/live-schedule/live-schedule.api"
import {
  LIVE_SCHEDULE_DEFAULT_TAB,
  LIVE_SCHEDULE_FILTER_OPTIONS,
  LIVE_SCHEDULE_TAB_ICONS,
  LIVE_SCHEDULE_TAB_PARAM,
  type LiveScheduleTab,
} from "@/features/live-schedule/live-schedule.constants"
import CarouselInfinity from "@/components/ui/carousel/carousel-infinity"
import { Empty } from "@/components/ui/empty"
import { BadgeStatus } from "@/components/ui/match/badge-status"
import { MatchCardLive } from "@/components/ui/match/card-live"
import { CardBasicSkeleton, CardLiveSkeleton } from "@/components/ui/match/skeleton"
import { Pagination } from "@/components/ui/pagination"

function getTypeScreen(tab: LiveScheduleTab): number {
  return LIVE_SCHEDULE_FILTER_OPTIONS.find((o) => o.value === tab)?.typeScreen ?? 0
}

const LIVE_PAGE_PARAM = "match-page"

interface LiveMatchFilterSectionProps {
  renderCard?: (match: LiveSearchMatchInterface) => React.ReactNode
  hideFilter?: boolean
  cols?: 3 | 4
  paginate?: boolean
}

export function LiveMatchFilterSection({
  renderCard,
  hideFilter,
  cols = 4,
  paginate = false,
}: LiveMatchFilterSectionProps = {}) {
  const { t } = useTranslation()
  const { setParams, getParam } = useRouter()
  const { onClick: track } = useTracking()
  const searchParams = useSearchParams()
  const tab = (searchParams.get(LIVE_SCHEDULE_TAB_PARAM) ??
    LIVE_SCHEDULE_DEFAULT_TAB) as LiveScheduleTab

  const typeScreen = getTypeScreen(tab)
  const keyword = searchParams.get("search-key") ?? undefined
  const page = paginate ? Number(getParam(LIVE_PAGE_PARAM) ?? 1) : 1

  const { data, isLoading } = useQuery({
    ...liveMatchesGridQueryOptions(typeScreen, keyword, paginate ? page : undefined),
    ...(paginate ? { refetchOnMount: "always" as const } : {}),
  })

  const matches = data?.records ?? []
  const total = data?.total ?? 0

  function handleTabChange(value: LiveScheduleTab) {
    track({
      ...payloadFilterClicked,
      [TrackingPayloadKeyEnum.CONTENT]: value,
      [TrackingPayloadKeyEnum.PREVIOUS_TAB]: tab,
    })
    setParams(
      {
        [LIVE_SCHEDULE_TAB_PARAM]: value,
        ...(paginate ? { [LIVE_PAGE_PARAM]: null } : {}),
      },
      { scroll: false }
    )
  }

  function handlePageChange(p: number) {
    if (!paginate) return
    setParams({ [LIVE_PAGE_PARAM]: p }, { scroll: false })
  }

  const gridClassName = cn(
    "grid gap-4 max-lg:grid-cols-2 max-sm:hidden",
    cols === 3 ? "grid-cols-3" : "grid-cols-4 max-xl:grid-cols-3"
  )

  return (
    <section className="card-glow rounded-12 flex min-w-0 flex-col gap-4 overflow-x-clip p-5 max-sm:gap-3 max-sm:p-3">
      <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
        <BadgeStatus type="live" />

        {!hideFilter && (
          <div className="rounded-10 flex items-center gap-0.5 bg-white/5 p-1 max-sm:w-full max-sm:scrollbar-none max-sm:overflow-x-auto">
            {LIVE_SCHEDULE_FILTER_OPTIONS.map((o) => {
              const iconSrc = LIVE_SCHEDULE_TAB_ICONS[o.value]
              const isActive = tab === o.value
              return (
                <button
                  key={o.value}
                  onClick={() => handleTabChange(o.value)}
                  className={cn(
                    "rounded-8 font-500 flex shrink-0 items-center gap-1 px-2.5 py-1.5 transition-all duration-150 max-sm:flex-1 max-sm:flex-col max-sm:gap-0.5 max-sm:px-2 max-sm:py-1",
                    "text-13 max-sm:text-10",
                    isActive
                      ? "bg-amber-400/15 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                      : "text-white/50 hover:bg-white/6 hover:text-white/80"
                  )}
                >
                  <NextImage
                    src={iconSrc}
                    alt=""
                    width={20}
                    height={20}
                    unoptimized
                    className={cn(
                      "size-5 shrink-0 max-sm:size-4",
                      isActive ? "opacity-100" : "opacity-50"
                    )}
                  />
                  <span className="whitespace-nowrap">
                    {t(o.labelKey as Parameters<typeof t>[0])}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Mobile: carousel | Desktop: grid */}
      {isLoading ? (
        <>
          {/* Mobile skeleton carousel */}
          <div className="hidden max-sm:block">
            <div className="-ml-4 flex overflow-x-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="shrink-0 basis-[85vw] pl-4">
                  {renderCard ? <CardBasicSkeleton /> : <CardLiveSkeleton />}
                </div>
              ))}
            </div>
          </div>
          {/* Desktop skeleton grid */}
          <div className={gridClassName}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CardLiveSkeleton key={i} />
            ))}
          </div>

          <Pagination
            className="max-sm:hidden"
            page={page}
            pageSize={LIVE_MATCHES_PAGE_SIZE}
            total={total}
            loading={isLoading}
            onPageChange={handlePageChange}
          />
        </>
      ) : matches.length > 0 ? (
        <div className="flex flex-col gap-8">
          {/* Mobile carousel */}
          <div className="hidden max-sm:block">
            <CarouselInfinity
              items={matches}
              renderItem={(match, i) =>
                renderCard ? (
                  renderCard(match)
                ) : (
                  <MatchCardLive key={`${match.matchId}-${i}`} match={match} />
                )
              }
              slideClassName="basis-full min-w-0"
              gapClassName="gap-3"
              keyExtractor={(m, i) => `${m.matchId}-${i}`}
            />
          </div>
          {/* Desktop grid */}
          <div className={gridClassName}>
            {matches.map((match, i) =>
              renderCard ? (
                <Fragment key={`${match.matchId}-${i}`}>{renderCard(match)}</Fragment>
              ) : (
                <MatchCardLive key={`${match.matchId}-${i}`} match={match} />
              )
            )}
          </div>
          {paginate && total > LIVE_MATCHES_PAGE_SIZE && (
            <Pagination
              className="max-sm:hidden"
              page={page}
              pageSize={LIVE_MATCHES_PAGE_SIZE}
              total={total}
              loading={isLoading}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : (
        <Empty tip={t("common.empty")} />
      )}
    </section>
  )
}

"use client"

import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { LIVE_MATCH_TYPE } from "@/lib/match.utils"
import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/use-router"

import { useTranslation } from "@/i18n"
import type { LiveSearchMatchInterface, MatchInterface } from "@/models/match.models"

import {
  LIVE_MATCHES_PAGE_SIZE,
  matchesByStatusQueryOptions,
} from "@/features/live-schedule/live-schedule.api"
import { SEARCH_QUERY_KEY } from "@/features/search/search.constants"
import CarouselInfinity from "@/components/ui/carousel/carousel-infinity"
import { Empty } from "@/components/ui/empty"
import { BadgeStatus } from "@/components/ui/match/badge-status"
import { Card } from "@/components/ui/match/card-basic"
import { CardFinishedSkeleton, CardUpcomingSkeleton } from "@/components/ui/match/skeleton"
import { Pagination } from "@/components/ui/pagination"

const STATUS_PAGE_KEY: Record<"upcoming" | "finished", string> = {
  upcoming: "upcoming-page",
  finished: "finished-page",
}

interface StatusMatchFilterSectionProps {
  status: "upcoming" | "finished"
  cols?: 3 | 4
}

function StatusMatchFilterSection({ status, cols = 4 }: StatusMatchFilterSectionProps) {
  const { t } = useTranslation()
  const { setParams, getParam } = useRouter()
  const searchParams = useSearchParams()

  const pageKey = STATUS_PAGE_KEY[status]
  const page = Number(getParam(pageKey) ?? 1)
  const keyword = searchParams.get(SEARCH_QUERY_KEY) || undefined

  const { data, isLoading } = useQuery(matchesByStatusQueryOptions(status, keyword, page))

  const matches = data?.records ?? []
  const total = data?.total ?? 0

  function handlePageChange(p: number) {
    setParams({ [pageKey]: p }, { scroll: false })
  }

  const gridClassName = cn(
    "grid gap-4 max-lg:grid-cols-2 max-sm:hidden",
    cols === 3 ? "grid-cols-3" : "grid-cols-4 max-xl:grid-cols-3"
  )

  return (
    <section className="card-glow rounded-12 flex min-w-0 flex-col gap-4 overflow-x-clip p-5 max-sm:gap-3 max-sm:p-3">
      <div className="flex items-center gap-3">
        <BadgeStatus type={status} />
      </div>

      {isLoading ? (
        <>
          <div className="hidden max-sm:block">
            <div className="-ml-4 flex overflow-x-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="shrink-0 basis-[85vw] pl-4">
                  {status === LIVE_MATCH_TYPE.UPCOMING ? (
                    <CardUpcomingSkeleton />
                  ) : (
                    <CardFinishedSkeleton />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className={gridClassName}>
            {Array.from({ length: 6 }).map((_, i) =>
              status === LIVE_MATCH_TYPE.UPCOMING ? (
                <CardUpcomingSkeleton key={i} />
              ) : (
                <CardFinishedSkeleton key={i} />
              )
            )}
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
          <div className="hidden max-sm:block">
            <CarouselInfinity
              items={matches}
              renderItem={(match: LiveSearchMatchInterface, i: number) => (
                <Card key={`${match.matchId}-${i}`} match={match as unknown as MatchInterface} />
              )}
              slideClassName="basis-full min-w-0"
              gapClassName="gap-3"
              keyExtractor={(m: LiveSearchMatchInterface, i: number) => `${m.matchId}-${i}`}
            />
          </div>
          <div className={gridClassName}>
            {matches.map((match: LiveSearchMatchInterface, i: number) => (
              <Card key={`${match.matchId}-${i}`} match={match as unknown as MatchInterface} />
            ))}
          </div>
          {pageKey && total > LIVE_MATCHES_PAGE_SIZE && (
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

export function UpcomingMatchFilterSection({ cols }: { cols?: 3 | 4 }) {
  return <StatusMatchFilterSection status={LIVE_MATCH_TYPE.UPCOMING} cols={cols} />
}

export function FinishedMatchFilterSection({ cols }: { cols?: 3 | 4 }) {
  return <StatusMatchFilterSection status={LIVE_MATCH_TYPE.FINISHED} cols={cols} />
}

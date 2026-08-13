"use client"

import { HTTP_METHOD, LIVE_MATCH_TYPE, MATCH_API } from "@/lib/match.utils"
import { useRouter } from "@/hooks/use-router"

import { useTranslation } from "@/i18n"
import { COLS_CLASS } from "@/constants/common.constants"
import { FOOTBALL_GAME_ID, FOOTBALL_GAME_MONGO_ID } from "@/constants/component/home.constants"
import type { LiveSearchMatchInterface, MatchInterface } from "@/models/match.models"

import { SEARCH_QUERY_KEY } from "@/features/search/search.constants"
import CarouselInfinityApi from "@/components/ui/carousel/carousel-infinity-api"
import { Empty } from "@/components/ui/empty"
import { BadgeStatus, type MatchStatusType } from "@/components/ui/match/badge-status"
import { Card } from "@/components/ui/match/card-basic"
import { CardBasicSkeleton } from "@/components/ui/match/skeleton"

interface MatchScheduleProps {
  cols?: number
  slideClassName?: string
  typeScreen?: number
  status?: MatchStatusType
}

export function MatchSchedule({
  cols = 5,
  slideClassName,
  typeScreen = 0,
  status = LIVE_MATCH_TYPE.LIVE,
}: MatchScheduleProps) {
  const { t } = useTranslation()
  const { getParam } = useRouter()
  const keyword = getParam(SEARCH_QUERY_KEY) ?? undefined
  const slideClass = slideClassName ?? COLS_CLASS[cols] ?? `basis-1/${cols} max-sm:basis-full`

  const isLive = status === LIVE_MATCH_TYPE.LIVE
  const endpoint = isLive ? MATCH_API.LIVE_SEARCH : MATCH_API.LIST
  const method = isLive ? HTTP_METHOD.GET : HTTP_METHOD.POST
  const params = isLive
    ? { id: FOOTBALL_GAME_MONGO_ID, keyword: keyword || undefined }
    : {
        gameId: FOOTBALL_GAME_ID,
        option: status === LIVE_MATCH_TYPE.UPCOMING ? 1 : 2,
        lot: null,
        keyword: keyword,
      }

  return (
    <section className="card-glow rounded-12 flex min-w-0 flex-col gap-4 overflow-x-clip p-5 max-sm:gap-3 max-sm:p-3">
      <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
        <BadgeStatus type={status} />
      </div>

      <CarouselInfinityApi<LiveSearchMatchInterface>
        key={`${status}-${typeScreen}-${keyword ?? ""}`}
        endpoint={endpoint}
        method={method}
        params={params}
        skeletonCount={cols}
        renderItem={(match, _, isLoading) =>
          isLoading ? <CardBasicSkeleton /> : <Card match={match as unknown as MatchInterface} />
        }
        renderEmpty={() => <Empty tip={t("common.empty")} />}
        slideClassName={slideClass}
        gapClassName="gap-3"
        keyExtractor={(m, i) => `${m.matchId}-${i}`}
      />
    </section>
  )
}

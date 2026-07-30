"use client"

import { HTTP_METHOD, LIVE_MATCH_TYPE, MATCH_QUERY_PARAMS } from "@/lib/match.utils"

import { useTranslation } from "@/i18n"
import type { MatchInterface } from "@/models/match.models"

import CarouselInfinityApi from "@/components/ui/carousel/carousel-infinity-api"
import { Empty } from "@/components/ui/empty"

import { Card } from "./card-basic"
import { BadgeStatus, type MatchStatusType } from "./badge-status"

interface CarouselProps {
  title?: string
  statusType?: MatchStatusType
  endpoint: string
  method?: (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD]
  params?: Record<string, unknown>
  matchType?: (typeof LIVE_MATCH_TYPE)[keyof typeof LIVE_MATCH_TYPE]
  hideFilter?: boolean
}

export function Carousel({
  statusType,
  endpoint,
  method = HTTP_METHOD.POST,
  params = MATCH_QUERY_PARAMS.ALL_GAMES,
  matchType = LIVE_MATCH_TYPE.LIVE,
}: CarouselProps) {
  const { t } = useTranslation()
  const isLive =
    statusType === LIVE_MATCH_TYPE.LIVE || (!statusType && matchType === LIVE_MATCH_TYPE.LIVE)

  return (
    <section className="card-glow rounded-12 flex flex-col gap-4 p-5 max-sm:gap-2 max-sm:p-3">
      <BadgeStatus type={statusType || LIVE_MATCH_TYPE.LIVE} />

      <CarouselInfinityApi<MatchInterface>
        endpoint={endpoint}
        method={method}
        params={params}
        renderItem={(match, _, isLoading) => (
          <Card match={match} isLoading={isLoading} matchType={matchType} />
        )}
        renderEmpty={() => <Empty tip={t("common.empty")} />}
        slideClassName={
          isLive
            ? "basis-1/5 max-lg:basis-1/3 max-sm:basis-full"
            : "basis-[350px] max-sm:basis-full"
        }
        gapClassName="gap-3"
      />
    </section>
  )
}

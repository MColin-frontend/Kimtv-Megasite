"use client"

import { useQuery } from "@tanstack/react-query"

import { useTranslation } from "@/i18n"

import { liveMatchCardQueryOptions } from "@/features/live-schedule/live-schedule.api"
import CarouselInfinity from "@/components/ui/carousel/carousel-infinity"
import { Empty } from "@/components/ui/empty"
import { Card } from "@/components/ui/match/card-basic"
import { BadgeStatus } from "@/components/ui/match/badge-status"
import { CardBasicSkeleton } from "@/components/ui/match/skeleton"

export function MatchSchedule() {
  const { t } = useTranslation()
  const { data: matches = [], isLoading } = useQuery(liveMatchCardQueryOptions())

  return (
    <section className="card-glow rounded-12 flex flex-col gap-4 p-5 max-sm:gap-3 max-sm:p-3">
      <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
        <BadgeStatus type="live" />
      </div>

      {isLoading ? (
        <>
          <div className="hidden max-sm:block">
            <div className="-ml-4 flex overflow-x-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="shrink-0 basis-[85vw] pl-4">
                  <CardBasicSkeleton />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardBasicSkeleton key={i} />
            ))}
          </div>
        </>
      ) : matches.length > 0 ? (
        <CarouselInfinity
          items={matches}
          renderItem={(match, i) => <Card key={`${match.matchId}-${i}`} match={match} />}
          slideClassName="basis-1/5 max-lg:basis-1/3 max-sm:basis-full"
          gapClassName="gap-3"
          keyExtractor={(m, i) => `${m.matchId}-${i}`}
        />
      ) : (
        <Empty tip={t("common.empty")} />
      )}
    </section>
  )
}

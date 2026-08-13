"use client"

import { useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { useLeagues } from "@/hooks/tanstack/use-leagues"
import { useFixtureData } from "@/hooks/use-fixture-data"
import { useFixturesFilter } from "@/hooks/use-fixtures-filter"

import { useTranslation } from "@/i18n/use-translation"
import type { MatchInterface } from "@/models/match.models"

import {
  createReservation,
  deleteReservation,
  fetchReservationList,
} from "@/features/broadcast/broadcast.api"
import { ScheduleFilter } from "@/components/ui/filters/schedule-filter"
import { Fixtures, groupMatches } from "@/components/ui/match/fixtures"
import { ScheduleHeader } from "@/components/ui/match/parts/schedule-header"
import {
  buildHotLeaguesFromApi,
  buildLeagueGroupsFromApi,
} from "@/components/ui/select/league-select"
import { Typography } from "@/components/ui/typography"

import { BroadcastReservationSkeleton } from "./skeleton"

export function BroadcastReservation() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const filter = useFixturesFilter()
  const { data: leaguesData } = useLeagues()
  const { filteredMatches, total, loading } = useFixtureData(filter)
  const groups = useMemo(() => groupMatches(filteredMatches), [filteredMatches])

  const dateStamp = Math.floor(filter.pickedDate.getTime() / 1000)
  const leagueStr = filter.leagueIds.join(",")

  const { data: rawReservations } = useQuery({
    queryKey: ["reservation-list", dateStamp, leagueStr],
    queryFn: () => fetchReservationList({ date: dateStamp, gameId: 202, leagueIds: leagueStr }),
    staleTime: Infinity,
  })

  // reservation-list trả object hoặc array — extract matchIds an toàn
  const bookedIds = useMemo(() => {
    if (!rawReservations) return new Set<number>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr: any[] = Array.isArray(rawReservations)
      ? rawReservations
      : (Object.values(rawReservations).find(Array.isArray) ?? [])
    return new Set<number>(arr.filter((r) => r?.isReservation).map((r) => Number(r.matchId)))
  }, [rawReservations])

  const hotLeagues = buildHotLeaguesFromApi(leaguesData?.hotLeagus ?? [])
  const leagueGroups = buildLeagueGroupsFromApi(leaguesData?.moreLeagus ?? [])

  async function handleToggle(match: MatchInterface) {
    if (bookedIds.has(match.matchId)) {
      await deleteReservation(match.matchId, match.gameId)
    } else {
      await createReservation(match.matchId, match.gameId)
    }
    await queryClient.invalidateQueries({ queryKey: ["reservation-list"] })
    await queryClient.invalidateQueries({ queryKey: ["reservations"] })
  }

  if (!leaguesData && loading) {
    return <BroadcastReservationSkeleton />
  }

  return (
    <section className="card-glow rounded-12 flex flex-col gap-4 p-3 sm:p-5">
      <ScheduleHeader />

      <ScheduleFilter
        groups={leagueGroups}
        hotLeagues={hotLeagues}
        pickedDate={filter.pickedDate}
        status={filter.status}
        selectedLeagues={filter.leagueIds}
        disabled={loading}
        minDate={new Date()}
        onPickedDateChange={filter.setPickedDate}
        onStatusChange={filter.setStatus}
        onLeagueChange={filter.setLeagueIds}
      />
      <Fixtures
        groups={groups}
        loading={loading}
        page={filter.page}
        pageSize={filter.pageSize}
        total={total}
        onPageChange={filter.setPage}
        extraColumn={{
          header: t("broadcast-center.reservation.book"),
          width: "120px",
          render: (match: MatchInterface) => {
            if (match.status !== 1) return null
            const isBooked = bookedIds.has(match.matchId)
            return (
              <Typography
                as="button"
                variant="caption"
                weight="500"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  handleToggle(match)
                }}
                className={
                  isBooked
                    ? "rounded-4 bg-live-green-bg text-live-green px-2 py-0.5 transition-opacity hover:opacity-70"
                    : "rounded-4 bg-red-500/10 px-2 py-0.5 text-red-400 transition-colors hover:bg-red-500/20"
                }
              >
                {isBooked
                  ? t("broadcast-center.reservation.booked")
                  : t("broadcast-center.reservation.book")}
              </Typography>
            )
          },
        }}
      />
    </section>
  )
}

"use client"

import { useMemo } from "react"

import { useLeagues } from "@/hooks/tanstack/use-leagues"
import { useFixtureData } from "@/hooks/use-fixture-data"
import { useFixturesFilter } from "@/hooks/use-fixtures-filter"

import { ScheduleFilter } from "@/components/ui/filters/schedule-filter"
import { Fixtures, groupMatches } from "@/components/ui/match/fixtures"
import { ScheduleHeader } from "@/components/ui/match/parts/schedule-header"
import {
  buildHotLeaguesFromApi,
  buildLeagueGroupsFromApi,
} from "@/components/ui/select/league-select"

export default function ScheduleList() {
  const filter = useFixturesFilter()
  const { data: leaguesData } = useLeagues()
  const { filteredMatches, total, loading } = useFixtureData(filter)
  const groups = useMemo(() => groupMatches(filteredMatches), [filteredMatches])

  const hotLeagues = buildHotLeaguesFromApi(leaguesData?.hotLeagus ?? [])
  const leagueGroups = buildLeagueGroupsFromApi(leaguesData?.moreLeagus ?? [])

  return (
    <section className="rounded-12 card-glow flex h-full flex-col gap-4 p-5 max-sm:p-3">
      <ScheduleHeader />
      <ScheduleFilter
        groups={leagueGroups}
        hotLeagues={hotLeagues}
        pickedDate={filter.pickedDate}
        status={filter.status}
        selectedLeagues={filter.leagueIds}
        disabled={loading}
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
        className="flex-1"
      />
    </section>
  )
}

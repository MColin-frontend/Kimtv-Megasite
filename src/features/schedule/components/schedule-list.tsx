"use client"

import { useMemo } from "react"

import { useLeagues } from "@/hooks/tanstack/use-leagues"
import { useFixtureData } from "@/hooks/use-fixture-data"
import { useFixturesFilter } from "@/hooks/use-fixtures-filter"

import { ScheduleFilter } from "@/components/ui/filters/schedule-filter"
import { FixtureList, groupMatches } from "@/components/ui/match/fixture-list"
import { ScheduleSectionHeader } from "@/components/ui/match/schedule-section-header"
import { buildLeagueGroupsFromApi } from "@/components/ui/select/league-select"

export default function ScheduleList() {
  const filter = useFixturesFilter()
  const { data: leaguesData } = useLeagues()
  const { filteredMatches, total, loading } = useFixtureData(filter)
  const groups = useMemo(() => groupMatches(filteredMatches), [filteredMatches])

  const hotLeagues = (leaguesData?.hotLeagus ?? []).map((l) => ({
    id: l.leagueId,
    name: l.name,
    count: l.gameCount,
  }))
  const leagueGroups = buildLeagueGroupsFromApi(leaguesData?.moreLeagus ?? [])

  return (
    <section className="rounded-12 card-glow flex flex-col gap-4 p-5 max-sm:p-3">
      <ScheduleSectionHeader />
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

      <FixtureList
        groups={groups}
        loading={loading}
        page={filter.page}
        pageSize={filter.pageSize}
        total={total}
        onPageChange={filter.setPage}
      />
    </section>
  )
}

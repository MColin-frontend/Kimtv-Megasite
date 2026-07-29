"use client"

import dynamic from "next/dynamic"

import { useLeagues } from "@/hooks/tanstack/use-leagues"
import { useFixturesFilter } from "@/hooks/use-fixtures-filter"

import { FixtureListSkeleton } from "@/components/ui/match/fixture-list"
import { ScheduleSectionHeader } from "@/components/ui/match/schedule-section-header"
import { buildLeagueGroupsFromApi } from "@/components/ui/select/league-select"

import HeroFixtures from "./hero-banner"

const FixturesList = dynamic(() => import("./fixtures"), {
  loading: () => <FixtureListSkeleton />,
})

function Fixtures() {
  const filter = useFixturesFilter()
  const { data: leaguesData } = useLeagues()

  const hotLeagues = (leaguesData?.hotLeagus ?? []).map((l) => ({
    id: l.leagueId,
    name: l.name,
    count: l.gameCount,
  }))
  const groups = buildLeagueGroupsFromApi(leaguesData?.moreLeagus ?? [])

  return (
    <section className="rounded-12 card-glow flex h-full flex-col gap-4 p-5 max-sm:p-3">
      <ScheduleSectionHeader />

      <HeroFixtures
        groups={groups}
        hotLeagues={hotLeagues}
        pickedDate={filter.pickedDate}
        statusFilter={filter.status}
        selectedLeagues={filter.leagueIds}
        onPickedDateChange={filter.setPickedDate}
        onStatusChange={(val) => filter.setStatus(val as Parameters<typeof filter.setStatus>[0])}
        onLeagueChange={filter.setLeagueIds}
      />
      <FixturesList />
    </section>
  )
}

export default Fixtures

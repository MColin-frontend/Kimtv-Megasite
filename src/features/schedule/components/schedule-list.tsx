"use client"

import { useMemo } from "react"

import { useLeagues } from "@/hooks/tanstack/use-leagues"
import { useFixtureData } from "@/hooks/use-fixture-data"
import { useFixturesFilter } from "@/hooks/use-fixtures-filter"

import { useTranslation } from "@/i18n"

import { ScheduleFilter } from "@/components/ui/filters/schedule-filter"
import { Img } from "@/components/ui/image"
import { FixtureList, groupMatches } from "@/components/ui/match/fixture-list"
import { buildLeagueGroupsFromApi } from "@/components/ui/select/league-select"
import { Typography } from "@/components/ui/typography"

import imgTrophy from "@assets/images/common/img-trophy.png"

export default function ScheduleList() {
  const { t } = useTranslation()
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
      {/* Section header */}
      <div className="relative flex items-center">
        {/* Trophy — nền đen blend với background tối */}
        <div className="img-blend-light relative shrink-0">
          <Img
            src={imgTrophy}
            alt=""
            width={80}
            height={80}
            className="max-sm:!h-16 max-sm:!w-16"
          />
        </div>

        {/* Divider vàng */}
        <div className="bg-gold mr-5 h-8 w-0.5 shrink-0 shadow-[0_0_12px_4px_rgba(246,195,67,0.6)] max-sm:mr-3 max-sm:h-6" />

        {/* Text */}
        <div className="flex min-w-0 flex-col gap-1 overflow-visible">
          <Typography variant="h1" className="text-gradient-white max-sm:text-24">
            {t("schedule.page-title")} {t("schedule.header-suffix")}
          </Typography>
          <Typography variant="body" className="max-sm:text-12 uppercase">
            {t("schedule.header-desc")}
          </Typography>
        </div>
      </div>
      <div className="sticky top-22 z-20">
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
      </div>

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

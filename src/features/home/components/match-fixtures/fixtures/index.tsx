"use client"

import dynamic from "next/dynamic"

import { useLeagues } from "@/hooks/tanstack/use-leagues"
import { useFixturesFilter } from "@/hooks/use-fixtures-filter"

import { useTranslation } from "@/i18n"

import { Img } from "@/components/ui/image"
import { FixtureListSkeleton } from "@/components/ui/match/fixture-list"
import { buildLeagueGroupsFromApi } from "@/components/ui/select/league-select"
import { Typography } from "@/components/ui/typography"

import imgTrophy from "@assets/images/common/img-trophy.png"

import HeroFixtures from "./hero-banner"

const FixturesList = dynamic(() => import("./fixtures"), {
  loading: () => <FixtureListSkeleton />,
})

function Fixtures() {
  const { t } = useTranslation()
  const filter = useFixturesFilter()
  const { data: leaguesData } = useLeagues()

  const hotLeagues = (leaguesData?.hotLeagus ?? []).map((l) => ({
    id: l.leagueId,
    name: l.name,
    count: l.gameCount,
  }))
  const groups = buildLeagueGroupsFromApi(leaguesData?.moreLeagus ?? [])

  return (
    <section className="rounded-12 card-glow flex flex-col gap-4 p-5 max-sm:p-3">
      {/* Section header */}
      <div className="relative flex items-center">
        <div className="img-blend-light relative shrink-0">
          <Img
            src={imgTrophy}
            alt=""
            width={80}
            height={80}
            className="max-sm:!h-16 max-sm:!w-16"
          />
        </div>
        <div className="bg-gold mr-5 h-8 w-0.5 shrink-0 shadow-[0_0_12px_4px_rgba(246,195,67,0.6)] max-sm:mr-3 max-sm:h-6" />
        <div className="flex min-w-0 flex-col gap-1 overflow-visible">
          <Typography variant="h1" className="text-gradient-white">
            {t("schedule.page-title")} {t("schedule.header-suffix")}
          </Typography>
          <Typography variant="body" className="uppercase">
            {t("schedule.header-desc")}
          </Typography>
        </div>
      </div>

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

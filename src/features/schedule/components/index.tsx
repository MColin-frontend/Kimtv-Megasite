import { Suspense } from "react"
import dynamic from "next/dynamic"

import { ScrollReveal } from "@/components/ui/scroll-reveal"
import {
  HotLeaguesList,
  HotLeaguesListSkeleton,
  HotTeamsList,
  HotTeamsListSkeleton,
} from "@/features/home/components/football-hub"

import { ScheduleSkeleton } from "./skeleton"

const ScheduleList = dynamic(() => import("./schedule-list"), {
  loading: () => <ScheduleSkeleton />,
})

export async function SchedulePage() {
  return (
    <div className="container flex flex-col gap-8 py-8 max-lg:gap-6 max-lg:py-6 max-md:gap-4 max-md:py-4">
      <ScrollReveal variant="fade-up" duration={600} distance={32} threshold={0.04}>
        <div className="flex w-full gap-4 max-lg:flex-col">
          <div className="min-w-0 flex-1 max-lg:order-1">
            <Suspense fallback={<ScheduleSkeleton />}>
              <ScheduleList />
            </Suspense>
          </div>

          <div className="flex w-[min(30vw,420px)] shrink-0 flex-col gap-4 self-start sticky top-23 max-lg:order-2 max-lg:static max-lg:w-full">
            <Suspense fallback={<HotLeaguesListSkeleton />}>
              <HotLeaguesList />
            </Suspense>
            <Suspense fallback={<HotTeamsListSkeleton />}>
              <HotTeamsList />
            </Suspense>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}

import { Suspense } from "react"
import dynamic from "next/dynamic"

import { ScrollReveal } from "@/components/ui/scroll-reveal"

import { FootballHub, FootballHubSkeleton } from "./football-hub"
import { HeroBanner } from "./hero-banner"
import { HeroVideo } from "./hero-video"
import { HeroVideoClientSkeleton } from "./hero-video-client"
import MatchFixtures from "./match-fixtures/index"

// Deferred — pulls in Embla Carousel + react-query hooks; not needed for initial paint
const MatchSchedule = dynamic(() => import("./match-schedule").then((m) => m.MatchSchedule))

export function HomePage() {
  return (
    <div className="relative container flex flex-col gap-10 max-lg:gap-6 max-md:gap-4">
      <Suspense fallback={<HeroVideoClientSkeleton />}>
        <HeroVideo />
      </Suspense>

      <ScrollReveal variant="blur" duration={600} distance={32} threshold={0.06}>
        <Suspense>
          <MatchSchedule />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal variant="fade-down" duration={700} distance={16} threshold={0.1}>
        <HeroBanner />
      </ScrollReveal>

      <ScrollReveal variant="fade-up" duration={600} distance={28} threshold={0.1}>
        <Suspense fallback={<FootballHubSkeleton />}>
          <FootballHub />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal variant="scale" duration={600} distance={28} threshold={0.1}>
        <Suspense>
          <MatchFixtures />
        </Suspense>
      </ScrollReveal>
    </div>
  )
}

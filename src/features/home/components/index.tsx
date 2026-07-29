import { Suspense } from "react"

import { ScrollReveal } from "@/components/ui/scroll-reveal"

import { HeroBanner } from "./hero-banner"
import { HeroVideo } from "./hero-video"
import { HeroVideoClientSkeleton } from "./hero-video-client"
import MatchFixtures from "./match-fixtures/index"
import { MatchSchedule } from "./match-schedule"

export function HomePage() {
  return (
    <div className="relative container flex flex-col gap-10 max-lg:gap-6 max-md:gap-4">
      <ScrollReveal variant="scale" duration={700} threshold={0.04}>
        <Suspense fallback={<HeroVideoClientSkeleton />}>
          <HeroVideo />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" duration={600} distance={32} threshold={0.06}>
        <Suspense>
          <MatchSchedule />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal variant="blur" duration={700} distance={16} threshold={0.1}>
        <HeroBanner />
      </ScrollReveal>

      <ScrollReveal variant="fade-up" duration={600} distance={28} threshold={0.04}>
        <Suspense>
          <MatchFixtures />
        </Suspense>
      </ScrollReveal>
    </div>
  )
}

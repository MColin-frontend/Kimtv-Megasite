import { Suspense } from "react"
import dynamic from "next/dynamic"

import { ScrollReveal } from "@/components/ui/scroll-reveal"

import { ScheduleSidebar } from "./schedule-sidebar"
import { ScheduleSkeleton } from "./skeleton"

const ScheduleList = dynamic(() => import("./schedule-list"), {
  loading: () => <ScheduleSkeleton />,
})

export async function SchedulePage() {
  return (
    <div className="container flex flex-col gap-8 py-8 max-lg:gap-6 max-lg:py-6 max-md:gap-4 max-md:py-4">
      <ScrollReveal variant="fade-up" duration={600} distance={32} threshold={0.04}>
        <div className="grid grid-cols-10 gap-4 max-lg:flex max-lg:flex-col">
          <div className="col-span-7 max-lg:order-1">
            <Suspense fallback={<ScheduleSkeleton />}>
              <ScheduleList />
            </Suspense>
          </div>

          <div className="col-span-3 max-lg:order-2 max-lg:w-full lg:sticky lg:top-19 lg:self-start">
            <Suspense fallback={null}>
              <ScheduleSidebar />
            </Suspense>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}

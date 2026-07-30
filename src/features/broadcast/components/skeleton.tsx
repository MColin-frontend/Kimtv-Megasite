import { cn } from "@/lib/utils"

import { FixturesSkeleton } from "@/components/ui/match/fixtures"
import { Skeleton } from "@/components/ui/skeleton"

export function BroadcastHeroSkeleton() {
  return (
    <div className="card-glow rounded-16 relative overflow-hidden p-6">
      <div className="relative flex items-center gap-5 max-sm:flex-col max-sm:items-center">
        <Skeleton className="size-[90px] shrink-0 rounded-full !border-[4px] border-transparent" />
        <div className="flex min-w-0 flex-1 flex-col gap-2 max-sm:items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="rounded-6 h-7 w-40" />
            <Skeleton className="rounded-4 h-5 w-14" />
          </div>
          <Skeleton className="rounded-4 h-4 w-56 max-sm:w-44" />
        </div>
        <Skeleton className="rounded-4 h-6 w-24 max-sm:mx-auto" />
      </div>
    </div>
  )
}

export function BroadcastStreamPanelSkeleton() {
  return (
    <div className="card-glow rounded-12 flex flex-col gap-5 p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="rounded-8 h-6 w-36" />
        <Skeleton className="rounded-8 h-8 w-24" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="rounded-4 h-4 w-20" />
          <Skeleton className="rounded-8 h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

export function BroadcastStreamSettingsSkeleton() {
  return (
    <div className="card-glow rounded-12 flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="rounded-8 h-6 w-40" />
        <Skeleton className="rounded-6 h-6 w-24" />
      </div>
      <Skeleton className="rounded-8 h-10 w-full" />
      <Skeleton className="rounded-10 h-12 w-full" />
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="rounded-4 h-4 w-24" />
            <Skeleton className="rounded-8 h-9 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="rounded-10 h-12 w-full" />
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="rounded-4 h-4 w-20" />
            <Skeleton className="rounded-8 h-9 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full rounded-full" />
    </div>
  )
}

export function BroadcastSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <BroadcastHeroSkeleton />
      <BroadcastStreamPanelSkeleton />
      <BroadcastStreamSettingsSkeleton />
    </div>
  )
}

export function BroadcastRulesSkeleton() {
  return (
    <section className="card-glow rounded-12 flex h-full min-h-0 flex-col overflow-hidden border border-red-500/15">
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
        <div className="flex shrink-0 items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="rounded-10 size-10 shrink-0" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="rounded-4 h-5 w-40" />
              <Skeleton className="rounded-4 h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="rounded-10 h-14 w-full shrink-0" />
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-10 flex gap-3 border border-white/6 bg-white/[0.03] p-3"
            >
              <Skeleton className="rounded-8 size-8 shrink-0" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="rounded-4 h-4 w-48" />
                <Skeleton className="rounded-4 h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="rounded-8 h-10 w-full shrink-0" />
      </div>
    </section>
  )
}

export function BroadcastReservationSkeleton() {
  return (
    <section className="card-glow rounded-12 flex flex-col gap-4 p-3 sm:p-5">
      <div className="relative flex items-center">
        <Skeleton className="size-20 shrink-0 rounded-full max-sm:size-16" />
        <div className="bg-gold/40 mr-5 h-8 w-0.5 shrink-0 max-sm:mr-3 max-sm:h-6" />
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="rounded-4 h-8 w-56 max-sm:h-6 max-sm:w-40" />
          <Skeleton className="rounded-4 h-4 w-32" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 max-sm:flex-wrap">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="rounded-8 h-9 w-28 max-sm:w-[calc(50%-4px)] max-sm:grow" />
        ))}
      </div>
      <FixturesSkeleton />
    </section>
  )
}

export function BroadcastCenterSidebarSkeleton() {
  return (
    <div className="flex w-80 shrink-0 flex-col gap-3 max-lg:w-full">
      <aside className="card-glow rounded-12 overflow-hidden">
        <div className="flex w-full items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Skeleton className="rounded-6 size-6 shrink-0" />
            <Skeleton className="rounded-4 h-3 w-28" />
          </div>
          <Skeleton className="size-3.5 shrink-0 rounded-sm" />
        </div>

        <div className="border-t border-white/6">
          <nav className="flex flex-col gap-0.5 p-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-8 flex items-center gap-3 px-3 py-2">
                <Skeleton className="rounded-4 size-[15px] shrink-0" />
                <Skeleton className={cn("rounded-4 h-3.5", i === 0 ? "w-36" : "w-24")} />
              </div>
            ))}
          </nav>

          <div className="mx-3 h-px bg-white/6" />

          <nav className="flex flex-col gap-0.5 p-2">
            <div className="rounded-8 flex items-center gap-3 px-3 py-2">
              <Skeleton className="rounded-4 size-[15px] shrink-0" />
              <Skeleton className="rounded-4 h-3.5 w-32" />
            </div>
          </nav>
        </div>
      </aside>
    </div>
  )
}

export function AnchorRegistrationSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="rounded-12 h-[350px] w-full" />

      <div className="card-glow rounded-16 flex flex-col gap-6 p-6 max-sm:p-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="rounded-4 h-4 w-32" />
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="rounded-4 h-3.5 w-24" />
                <Skeleton className="rounded-8 h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Skeleton className="rounded-4 h-3.5 w-28" />
          <Skeleton className="rounded-8 h-20 w-full" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-1.5">
            <Skeleton className="rounded-4 h-3.5 w-32" />
            <Skeleton className="rounded-4 h-3 w-48" />
          </div>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="rounded-4 h-3.5 w-24" />
                <Skeleton className="rounded-8 aspect-video w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Skeleton className="rounded-8 h-11 w-full max-w-sm" />
          <Skeleton className="rounded-4 h-3 w-56" />
        </div>
      </div>
    </div>
  )
}

export function BroadcastPageSkeleton() {
  return (
    <div className="container flex flex-col gap-5">
      <BroadcastHeroSkeleton />
      <div className="grid grid-cols-[7fr_3fr] items-stretch gap-5 max-lg:grid-cols-1">
        <div className="flex flex-col gap-5">
          <BroadcastStreamPanelSkeleton />
          <BroadcastStreamSettingsSkeleton />
        </div>
        <BroadcastRulesSkeleton />
      </div>
    </div>
  )
}

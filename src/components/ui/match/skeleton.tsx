"use client"

import { cn } from "@/lib/utils"

import { SKELETON_BG } from "@/constants/common.constants"

import { Skeleton } from "@/components/ui/skeleton"

/* ── Shared layout constant ─────────────────────────────────────── */

export const FIXTURE_ROW_CLASS =
  "grid items-center gap-x-3 px-3 xl:gap-x-8 xl:px-4 " +
  "grid-cols-[8rem_1fr_4.5rem_5rem_3rem_3rem_3rem] xl:grid-cols-[11rem_1fr_5rem_5.5rem_3.5rem_3.5rem_3.5rem]"

/* ── FixtureRowSkeleton ─────────────────────────────────────────── */

export function FixtureRowSkeleton() {
  return (
    <div
      className={cn(
        FIXTURE_ROW_CLASS,
        "rounded-10 mb-1.5 border border-white/8 bg-white/[0.04] py-3"
      )}
    >
      <div className="flex items-center gap-2">
        <Skeleton className={cn("rounded-6 size-9 shrink-0", SKELETON_BG)} />
        <Skeleton className={cn("h-3.5 w-20", SKELETON_BG)} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className={cn("size-[30px] shrink-0 rounded-full", SKELETON_BG)} />
          <Skeleton className={cn("h-3.5 w-32", SKELETON_BG)} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className={cn("size-[30px] shrink-0 rounded-full", SKELETON_BG)} />
          <Skeleton className={cn("h-3.5 w-28", SKELETON_BG)} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Skeleton className={cn("h-3.5 w-10", SKELETON_BG)} />
        <Skeleton className={cn("h-3.5 w-12", SKELETON_BG)} />
      </div>
      <div className="flex justify-center">
        <Skeleton className={cn("h-3.5 w-10", SKELETON_BG)} />
      </div>
      <Skeleton className={cn("mx-auto h-3 w-8", SKELETON_BG)} />
      <Skeleton className={cn("mx-auto h-3 w-8", SKELETON_BG)} />
      <Skeleton className={cn("mx-auto h-3 w-8", SKELETON_BG)} />
    </div>
  )
}

/* ── FixtureListSkeleton ────────────────────────────────────────── */

export function FixtureListSkeleton() {
  return (
    <div className="rounded-12 overflow-hidden">
      <div className={cn(FIXTURE_ROW_CLASS, "py-2.5 max-md:hidden")}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className={cn("mx-auto h-3 w-14", SKELETON_BG)} />
        ))}
      </div>
      {Array.from({ length: 15 }).map((_, i) => (
        <FixtureRowSkeleton key={i} />
      ))}
    </div>
  )
}

/* ── MatchCardSkeleton ──────────────────────────────────────────── */

export function MatchCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("card-glow rounded-12 relative w-full overflow-hidden", className)}>
      <div className="flex flex-col gap-3 p-3.5">
        {/* Row 1: LIVE + time */}
        <div className="flex items-center justify-between">
          <Skeleton className="rounded-6 h-6 w-14" />
          <Skeleton className="rounded-4 h-5 w-12" />
        </div>
        {/* Row 2: BLV */}
        <div className="flex min-h-[52px] items-center gap-2">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        {/* Row 3: Teams + Score */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex basis-2/5 flex-col items-center gap-2">
            <Skeleton className="size-[60px] rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex basis-1/5 flex-col items-center gap-1">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="rounded-4 h-4 w-14" />
          </div>
          <div className="flex basis-2/5 flex-col items-center gap-2">
            <Skeleton className="size-[60px] rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        {/* Row 4: Stats */}
        <Skeleton className="rounded-8 h-10 w-full" />
        {/* Row 5: Bottom */}
        <Skeleton className="rounded-4 h-6 w-full" />
      </div>
    </div>
  )
}

/* ── MatchCardLiveSkeleton ─────────────────────────────────── */

export function MatchCardLiveSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("card-glow rounded-12 relative w-full overflow-hidden", className)}>
      <Skeleton className="aspect-video w-full" />
      <div className="flex flex-col gap-2 p-3">
        {/* BLV row */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-2.5 w-12 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        {/* Teams */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex basis-2/5 flex-col items-center gap-1.5">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-3 w-14" />
          </div>
          <div className="flex basis-1/5 flex-col items-center gap-1">
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="flex basis-2/5 flex-col items-center gap-1.5">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
        {/* Stats */}
        <Skeleton className="rounded-8 h-8 w-full" />
        {/* League */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

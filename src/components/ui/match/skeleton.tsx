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

/* ── FixturesSkeleton ────────────────────────────────────────── */

export function FixturesSkeleton() {
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

/* ── Shared: bottom row (league + date) ─────────────────────────── */

function SkeletonBottomRow() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Skeleton className={cn("size-4 shrink-0 rounded-full max-sm:size-3.5", SKELETON_BG)} />
        <Skeleton className={cn("h-3 w-24 max-sm:w-16", SKELETON_BG)} />
      </div>
      <Skeleton className={cn("h-3 w-20 max-sm:w-14", SKELETON_BG)} />
    </div>
  )
}

/* ── Shared: stat bar (yellow / red / corner) ───────────────────── */

function SkeletonStatBar() {
  return (
    <div className="rounded-8 flex items-center justify-between bg-white/[0.04] px-2 py-1.5 max-sm:px-1 max-sm:py-0.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-0.5 px-2 max-sm:px-1">
          <div className="flex items-center gap-1">
            <Skeleton className={cn("size-4 shrink-0 max-sm:size-3", SKELETON_BG)} />
            <Skeleton className={cn("h-3 w-8 max-sm:w-6", SKELETON_BG)} />
          </div>
          <Skeleton className={cn("h-2.5 w-10 max-sm:w-8", SKELETON_BG)} />
        </div>
      ))}
    </div>
  )
}

/* ── Shared: team column ──────────────────────────────────────── */

function SkeletonTeam() {
  return (
    <div className="flex basis-2/5 flex-col items-center gap-1.5">
      <Skeleton
        className={cn(
          "size-[80px] shrink-0 rounded-full max-md:size-[60px] max-sm:size-[44px]",
          SKELETON_BG
        )}
      />
      <Skeleton className={cn("h-3 w-16 max-sm:w-12", SKELETON_BG)} />
    </div>
  )
}

/* ── CardUpcomingSkeleton ───────────────────────────────────────── */
/* Layout: empty row | teams+VS | countdown | league+date           */

export function CardUpcomingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "card-match-bg rounded-12 relative min-h-[300px] w-full overflow-hidden max-sm:min-h-[250px]",
        className
      )}
    >
      {/* stadium bg shimmer */}
      <Skeleton className="absolute inset-0 rounded-none" />

      <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between gap-2 p-3.5 max-md:gap-1.5 max-md:p-2.5 max-sm:min-h-[250px] max-sm:gap-1.5 max-sm:p-2">
        {/* Row 1: empty top */}
        <div className="flex h-5 items-center max-sm:h-4" />

        {/* Row 2: teams + VS */}
        <div className="flex flex-1 items-center justify-between gap-2">
          <SkeletonTeam />
          {/* VS placeholder */}
          <div className="flex basis-1/5 flex-col items-center">
            <Skeleton
              className={cn("size-14 rounded-full max-md:size-12 max-sm:size-10", SKELETON_BG)}
            />
          </div>
          <SkeletonTeam />
        </div>

        {/* Row 3: countdown (Giờ : Phút : Giây) */}
        <div className="flex items-center justify-center gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex flex-col items-center gap-1">
                <Skeleton className={cn("h-7 w-10 max-sm:h-5 max-sm:w-8", SKELETON_BG)} />
                <Skeleton className={cn("h-2.5 w-6 max-sm:w-4", SKELETON_BG)} />
              </div>
              {i < 2 && (
                <Skeleton className={cn("mt-0.5 h-5 w-3 max-sm:h-4 max-sm:w-2", SKELETON_BG)} />
              )}
            </div>
          ))}
        </div>

        {/* Row 4: league + date */}
        <SkeletonBottomRow />
      </div>
    </div>
  )
}

/* ── CardFinishedSkeleton ───────────────────────────────────────── */
/* Layout: empty row | teams+score+badge | stats bar | league+date  */

export function CardFinishedSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "card-match-bg rounded-12 relative min-h-[300px] w-full overflow-hidden max-sm:min-h-[250px]",
        className
      )}
    >
      <Skeleton className="absolute inset-0 rounded-none" />

      <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between gap-2 p-3.5 max-md:gap-1.5 max-md:p-2.5 max-sm:min-h-[250px] max-sm:gap-1.5 max-sm:p-2">
        {/* Row 1: empty */}
        <div className="flex h-5 items-center max-sm:h-4" />

        {/* Row 2: teams + score */}
        <div className="flex flex-1 items-center justify-between gap-2">
          <SkeletonTeam />
          {/* Score + badge */}
          <div className="flex basis-1/5 flex-col items-center gap-1.5">
            <Skeleton
              className={cn("h-10 w-16 max-md:h-8 max-md:w-12 max-sm:h-7 max-sm:w-10", SKELETON_BG)}
            />
            <Skeleton className={cn("rounded-4 h-5 w-14 max-sm:h-4 max-sm:w-10", SKELETON_BG)} />
          </div>
          <SkeletonTeam />
        </div>

        {/* Row 3: stats bar */}
        <SkeletonStatBar />

        {/* Row 4: league + date */}
        <SkeletonBottomRow />
      </div>
    </div>
  )
}

/* ── CardBasicSkeleton ──────────────────────────────────────────── */
/* Generic – dùng cho live/stream card basic (có BLV row)           */

export function CardBasicSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "card-match-bg rounded-12 relative min-h-[300px] w-full overflow-hidden max-sm:min-h-[250px]",
        className
      )}
    >
      <Skeleton className="absolute inset-0 rounded-none" />

      <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between gap-2 p-3.5 max-md:gap-1.5 max-md:p-2.5 max-sm:min-h-[250px] max-sm:gap-1.5 max-sm:p-2">
        {/* Row 1: badge row */}
        <div className="flex items-center justify-between">
          <Skeleton className={cn("rounded-6 h-6 w-14 max-sm:h-5 max-sm:w-11", SKELETON_BG)} />
          <div className="flex items-center gap-1.5">
            <Skeleton className={cn("rounded-4 h-6 w-10 max-sm:h-5 max-sm:w-8", SKELETON_BG)} />
            <Skeleton className={cn("rounded-6 h-6 w-14 max-sm:h-5 max-sm:w-10", SKELETON_BG)} />
          </div>
        </div>

        {/* Row 2: BLV */}
        <div className="flex items-center gap-1.5">
          <Skeleton className={cn("size-8 shrink-0 rounded-full max-sm:size-6", SKELETON_BG)} />
          <div className="flex flex-col gap-1">
            <Skeleton className={cn("h-2.5 w-10 rounded-full max-sm:w-8", SKELETON_BG)} />
            <Skeleton className={cn("h-3 w-20 max-sm:w-14", SKELETON_BG)} />
          </div>
        </div>

        {/* Row 3: teams + score */}
        <div className="flex flex-1 items-center justify-between gap-2">
          <SkeletonTeam />
          <div className="flex basis-1/5 flex-col items-center gap-1">
            <Skeleton
              className={cn("h-10 w-16 max-md:h-8 max-md:w-12 max-sm:h-7 max-sm:w-10", SKELETON_BG)}
            />
          </div>
          <SkeletonTeam />
        </div>

        {/* Row 4: stats bar */}
        <SkeletonStatBar />

        {/* Row 5: league + date */}
        <SkeletonBottomRow />
      </div>
    </div>
  )
}

/* ── CardLiveSkeleton ─────────────────────────────────────────── */
/* Layout: LIVE+HD+viewers | BLV | teams+score | stats | league    */

export function CardLiveSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "card-match-bg rounded-12 relative min-h-[300px] w-full overflow-hidden max-sm:min-h-[250px]",
        className
      )}
    >
      {/* Live thumbnail shimmer */}
      <Skeleton className="absolute inset-0 rounded-none opacity-40" />

      <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between gap-2 p-3.5 max-md:gap-1.5 max-md:p-2.5 max-sm:min-h-[250px] max-sm:gap-1.5 max-sm:p-2">
        {/* Row 1: LIVE badge (left) | HD + viewer count (right) */}
        <div className="flex items-start justify-between">
          <Skeleton
            className={cn("rounded-6 h-7 w-16 max-md:h-6 max-sm:h-5 max-sm:w-12", SKELETON_BG)}
          />
          <div className="flex items-center gap-1.5 max-sm:gap-1">
            <Skeleton
              className={cn("rounded-4 h-7 w-10 max-md:h-6 max-sm:h-5 max-sm:w-8", SKELETON_BG)}
            />
            <Skeleton
              className={cn("rounded-6 h-7 w-16 max-md:h-6 max-sm:h-5 max-sm:w-12", SKELETON_BG)}
            />
          </div>
        </div>

        {/* Row 2: BLV info */}
        <div className="flex items-center gap-1.5">
          <Skeleton className={cn("size-9 shrink-0 rounded-full max-sm:size-7", SKELETON_BG)} />
          <div className="flex flex-col gap-1">
            <Skeleton className={cn("h-4 w-16 rounded-full max-sm:h-3 max-sm:w-12", SKELETON_BG)} />
            <Skeleton className={cn("h-3 w-24 max-sm:w-16", SKELETON_BG)} />
          </div>
        </div>

        {/* Row 3: teams + score (larger score than basic) */}
        <div className="flex flex-1 items-center justify-between gap-2">
          <SkeletonTeam />
          <div className="flex basis-1/5 flex-col items-center gap-1">
            {/* Score: text-72 on live */}
            <Skeleton
              className={cn(
                "h-14 w-20 max-md:h-10 max-md:w-16 max-sm:h-8 max-sm:w-12",
                SKELETON_BG
              )}
            />
          </div>
          <SkeletonTeam />
        </div>

        {/* Row 4: stats bar */}
        <SkeletonStatBar />

        {/* Row 5: league + date */}
        <SkeletonBottomRow />
      </div>
    </div>
  )
}

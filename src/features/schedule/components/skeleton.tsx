import { cn } from "@/lib/utils"

import { SKELETON_BG } from "@/constants/common.constants"

import { FixtureListSkeleton } from "@/components/ui/match/fixture-list"
import { Skeleton } from "@/components/ui/skeleton"

export function ScheduleSkeleton() {
  return (
    <div className="rounded-12 card-glow flex flex-col gap-4 p-5 max-sm:p-3">
      <div className="rounded-12 bg-background/90 border border-white/10 px-5 py-3">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className={cn("h-9 w-32", SKELETON_BG)} />
          <Skeleton className={cn("h-9 w-40", SKELETON_BG)} />
          <Skeleton className={cn("h-9 w-36", SKELETON_BG)} />
        </div>
      </div>
      <FixtureListSkeleton />
    </div>
  )
}

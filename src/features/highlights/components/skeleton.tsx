import { cn } from "@/lib/utils"

import { Skeleton } from "@/components/ui/skeleton"

// ─── Comment skeletons ────────────────────────────────────────────────────────

/** Skeleton 1 dòng comment (avatar + 3 lines) */
function CommentRowSkeleton({ size = "md" }: { size?: "sm" | "md" }) {
  const avatarSize = size === "sm" ? "h-7 w-7" : "h-9 w-9"
  const nameWidth = size === "sm" ? "w-20" : "w-24"
  return (
    <div className="flex gap-2.5">
      <Skeleton className={cn("shrink-0 rounded-full", avatarSize)} />
      <div className="flex flex-1 flex-col gap-2 pt-1">
        <Skeleton className={cn("h-3", nameWidth)} />
        <Skeleton className="h-3 w-full" />
        {size === "md" && <Skeleton className="h-3 w-3/4" />}
      </div>
    </div>
  )
}

/** Skeleton danh sách bình luận ban đầu */
export function CommentListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      {Array.from({ length: count }).map((_, i) => (
        <CommentRowSkeleton key={i} />
      ))}
    </div>
  )
}

/** Skeleton comment đang pending (optimistic, mờ hơn) */
export function CommentPendingSkeleton({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div className="opacity-50">
      <CommentRowSkeleton size={size} />
    </div>
  )
}

/** Skeleton load-more (1 item) */
export function CommentLoadMoreSkeleton() {
  return <CommentRowSkeleton />
}

export interface FeedSkeletonProps {
  playerWidth: number
  stageHeight: number
}

export function FeedSkeleton({ playerWidth, stageHeight }: FeedSkeletonProps) {
  const pw = Math.max(playerWidth, 260)
  const ph = Math.max(stageHeight, 360)

  return (
    <div
      className="flex w-full items-center justify-center bg-black"
      style={{ height: ph }}
      aria-hidden="true"
    >
      <div className="flex h-full items-stretch gap-3">
        {/* ── Player ─────────────────────────────────────────────── */}
        <Skeleton className="relative rounded" style={{ width: pw, height: ph }}>
          {/* Mute btn */}
          <Skeleton className="absolute top-4 left-4 h-12 w-12 rounded-full" />

          {/* Play btn */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-[72px] w-[72px] rounded-full border-2 border-white/10" />
          </div>

          {/* Bottom gradient + meta */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pt-16 pb-14">
            <Skeleton className="mb-3 h-4 w-28 rounded-full" />
            <Skeleton className="mb-2 h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>

          {/* Progress bar */}
          <div className="absolute right-2 bottom-5 left-2">
            <div className="mb-1.5 flex justify-end">
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-[3px] w-full rounded-full" />
          </div>
        </Skeleton>

        {/* ── Rail ───────────────────────────────────────────────── */}
        <aside className="flex shrink-0 flex-col items-center justify-center gap-7 self-stretch py-4 max-md:hidden">
          {/* Avatar + follow dot */}
          <div className="relative">
            <Skeleton className="h-14 w-14 rounded-full border-2 border-white/10" />
            <Skeleton className="absolute -bottom-2.5 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full" />
          </div>

          {/* Like, Comment, Share */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-14 w-14 rounded-full" />
              {i < 3 && <Skeleton className="h-3 w-8" />}
            </div>
          ))}
        </aside>
      </div>

      {/* ── Nav btns ───────────────────────────────────────────────── */}
      <div className="absolute top-1/2 right-1 flex -translate-y-1/2 flex-col gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  )
}

export function MenuSkeleton() {
  return (
    <aside className="sticky w-24 shrink-0 self-start pt-6 max-md:hidden" aria-hidden="true">
      <div className="flex flex-col gap-0.5 rounded-2xl border border-white/8 bg-[rgba(22,24,35,0.92)] px-2 py-2.5 shadow-xl backdrop-blur-xl">
        {/* 3 filter items */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex min-h-[64px] flex-col items-center justify-center gap-2 rounded-xl px-1 py-2.5"
          >
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}

        {/* Divider */}
        <div className="mx-1.5 my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* 2 link items */}
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex min-h-[64px] flex-col items-center justify-center gap-2 rounded-xl px-1 py-2.5"
          >
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </aside>
  )
}

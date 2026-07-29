import { Skeleton } from "@/components/ui/skeleton"

/* ─── Profile Panel ──────────────────────────────────────── */
export function ProfilePanelSkeleton() {
  const statBar = (
    <div className="card-glow rounded-8 grid w-fit grid-cols-4 gap-0 px-2 py-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center">
          {i > 0 && <div className="mr-1 h-10 w-px bg-white/10" />}
          <div className="flex flex-1 flex-col items-center gap-1.5 px-2">
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-3.5 w-14 rounded" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-10 max-md:gap-4">
        <Skeleton className="size-[140px] shrink-0 rounded-full max-md:size-[90px]" />
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-4">
            <Skeleton className="rounded-8 h-12 w-48 max-md:h-9 max-md:w-36" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-80 max-md:w-full" />
            <Skeleton className="h-4 w-64 max-md:w-4/5" />
          </div>
          <div className="mt-2 max-md:hidden">{statBar}</div>
        </div>
      </div>
      <div className="hidden max-md:block">{statBar}</div>
    </div>
  )
}

/* ─── Hero Card ──────────────────────────────────────────── */
function HeroCardSkeleton() {
  return (
    <div className="relative aspect-[992/560] w-full overflow-hidden rounded-lg max-md:aspect-[4/3]">
      <Skeleton className="size-full" />
    </div>
  )
}

/* ─── Grid Cards (4 thumbnails) ─────────────────────────── */
function GridCardsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="rounded-10 aspect-[284/200] w-full" />
      ))}
    </div>
  )
}

/* ─── Compact Card ───────────────────────────────────────── */
function CompactSkeleton() {
  return (
    <div className="flex gap-4 border-b border-white/6 pb-4 last:border-0 last:pb-0 max-sm:flex-col max-sm:gap-2">
      <Skeleton className="rounded-8 aspect-video w-[320px] shrink-0 max-sm:w-full" />
      {/* Text */}
      <div className="flex flex-1 flex-col gap-2 py-0.5">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        {/* Like count */}
        <div className="mt-auto flex items-center gap-1.5">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </div>
  )
}

/* ─── Article Section (card-glow wrapper) ───────────────── */
function ArticleSectionSkeleton() {
  return (
    <div className="card-glow rounded-12 flex flex-col gap-4 p-4">
      <HeroCardSkeleton />
      <GridCardsSkeleton />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CompactSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/* ─── Video Panel (carousel right col) ──────────────────── */
function VideoPanelSkeleton() {
  return (
    <div className="card-glow rounded-12 flex flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
      {/* Video slide 16/17 */}
      <Skeleton className="rounded-10 aspect-[16/17] w-full" />
      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className={`rounded-full ${i === 0 ? "h-1.5 w-4" : "size-1.5"}`} />
        ))}
      </div>
    </div>
  )
}

/* ─── All Tab Skeleton (7/3 grid) ────────────────────────── */
export function AllTabSkeleton({ showVideo = true }: { showVideo?: boolean }) {
  return (
    <div
      className={
        showVideo
          ? "mt-8 grid grid-cols-10 gap-7 max-lg:grid-cols-1 max-md:mt-4 max-md:gap-4"
          : "mt-8 max-md:mt-4"
      }
    >
      <div className={showVideo ? "col-span-7 max-lg:col-span-full" : undefined}>
        <ArticleSectionSkeleton />
      </div>
      {showVideo && (
        <div className="col-span-3 max-lg:order-first max-lg:col-span-full">
          <VideoPanelSkeleton />
        </div>
      )}
    </div>
  )
}

/* ─── Video Tab Skeleton ─────────────────────────────────── */
export function VideoSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Thumbnail 2/3 portrait */}
      <Skeleton className="rounded-10 aspect-[2/3] w-full" />
      {/* Title 2 lines */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

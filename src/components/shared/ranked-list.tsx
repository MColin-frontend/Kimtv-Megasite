import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { Empty } from "@/components/ui/empty"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Typography } from "@/components/ui/typography"

/* ── Rank badge ────────────────────────────────────────────── */

const RANK_BADGE_STYLE: Record<number, { bg: string; shadow: string }> = {
  1: {
    bg: "linear-gradient(160deg, #ffd75a 0%, #f6c343 45%, #c8872a 100%)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.35), 2px 0 8px rgba(246,195,67,0.25)",
  },
  2: {
    bg: "linear-gradient(160deg, #e4e4e4 0%, #c0c0c0 45%, #909090 100%)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.4), 2px 0 8px rgba(150,150,150,0.2)",
  },
  3: {
    bg: "linear-gradient(160deg, #e8a870 0%, #cd7f32 45%, #9e5a1e 100%)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.35), 2px 0 8px rgba(205,127,50,0.25)",
  },
}
const DEFAULT_RANK_BADGE = {
  bg: "linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 100%)",
  shadow: "inset 0 1px 0 rgba(255,255,255,0.2), 2px 0 6px rgba(0,0,0,0.15)",
}

function RankBadge({ rank }: { rank: number }) {
  const style = RANK_BADGE_STYLE[rank] ?? DEFAULT_RANK_BADGE
  return (
    <div
      className="relative flex w-11 shrink-0 items-center justify-center self-stretch pr-1 max-sm:w-9"
      style={{
        background: style.bg,
        clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
        boxShadow: style.shadow,
      }}
    >
      <span className="text-16 font-800 max-sm:text-14 leading-none select-none text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
        {rank}
      </span>
    </div>
  )
}

/* ── Props ─────────────────────────────────────────────────── */

interface RankedListProps<T> {
  title: React.ReactNode
  titleClassName?: string
  viewAllHref?: string
  viewAllLabel?: string
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  emptyNode?: React.ReactNode
  className?: string
  keyExtractor?: (item: T, index: number) => string
  hideRankBadge?: boolean
}

/* ── Component ─────────────────────────────────────────────── */

export function RankedList<T>({
  title,
  titleClassName,
  viewAllHref,
  viewAllLabel,
  items,
  renderItem,
  emptyNode = <Empty />,
  className,
  keyExtractor,
  hideRankBadge = false,
}: RankedListProps<T>) {
  return (
    <div
      className={cn(
        "card-glow rounded-12 flex flex-col gap-4 p-4 max-sm:gap-2 max-sm:p-3",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "text-24 max-lg:text-20 max-md:text-18 max-sm:text-14 font-800 leading-138 tracking-widest uppercase italic",
            titleClassName
          )}
        >
          {title}
        </div>
        {viewAllHref && viewAllLabel && (
          <Link
            href={viewAllHref}
            className="group/btn hover:text-gold flex items-center gap-1 overflow-hidden pr-1 transition-colors"
          >
            <Typography
              as="span"
              variant="caption"
              weight="500"
              color="muted"
              className="group-hover/btn:text-gold transition-all duration-200 group-hover/btn:italic"
            >
              {viewAllLabel}
            </Typography>
            <ArrowRight
              size={16}
              className="-translate-x-4 opacity-0 transition-all duration-200 group-hover/btn:translate-x-0 group-hover/btn:opacity-100"
              aria-hidden
            />
          </Link>
        )}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">{emptyNode}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <ScrollReveal
              key={keyExtractor ? keyExtractor(item, index) : index}
              variant="scale"
              duration={600}
              distance={28}
              threshold={0.1}
            >
              {hideRankBadge ? (
                <>{renderItem(item, index)}</>
              ) : (
                <div className="rounded-8 flex items-stretch overflow-hidden border border-white/[0.06] bg-white/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.07] hover:shadow-[0_6px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <RankBadge rank={index + 1} />
                  <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
                </div>
              )}
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}

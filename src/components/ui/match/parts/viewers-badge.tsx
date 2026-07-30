import { Users } from "lucide-react"

import { formatViewers } from "@/lib/utils"
import { cn } from "@/lib/utils"

import { Typography } from "@/components/ui/typography"

interface ViewersBadgeProps {
  count: number | null | undefined
  className?: string
}

export function ViewersBadge({ count, className }: ViewersBadgeProps) {
  if (!count || count <= 0) return null

  return (
    <div
      className={cn(
        "rounded-6 flex h-[30px] items-center gap-1 border border-white/20 bg-black/60 px-2 shadow-[0_2px_12px_rgba(0,0,0,0.7),0_0_6px_rgba(255,255,255,0.05)] backdrop-blur-md max-sm:h-5 max-sm:px-1",
        className,
      )}
    >
      <Users className="size-3.5 shrink-0 text-white/80 max-sm:size-2.5" aria-hidden />
      <Typography variant="label" className="max-sm:!text-10 leading-none text-white tabular-nums">
        {formatViewers(count)}
      </Typography>
    </div>
  )
}

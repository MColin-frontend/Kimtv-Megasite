import { cn } from "@/lib/utils"

import { Typography } from "@/components/ui/typography"

type MatchStatusBadgeType = "live" | "finished"

interface MatchStatusBadgeProps {
  label: string
  type: MatchStatusBadgeType
  className?: string
}

const STYLES: Record<MatchStatusBadgeType, { container: string; text: string }> = {
  live: {
    container: "border-live-green/30 bg-live-green-bg shadow-live-green-glow backdrop-blur-2xl",
    text: "text-live-green drop-shadow-live-green",
  },
  finished: {
    container: "border-gold/30 bg-gold/10 shadow-gold-glow",
    text: "text-gold drop-shadow-gold-sm",
  },
}

export function MatchStatusBadge({ label, type, className }: MatchStatusBadgeProps) {
  const s = STYLES[type]
  return (
    <div
      className={cn(
        "rounded-4 flex !h-[30px] items-center border px-2 max-sm:!h-5 max-sm:px-1.5",
        s.container,
        className
      )}
    >
      <Typography
        as="span"
        variant="caption"
        weight="600"
        className={cn("max-sm:!text-10 leading-none whitespace-nowrap", s.text)}
      >
        {label}
      </Typography>
    </div>
  )
}

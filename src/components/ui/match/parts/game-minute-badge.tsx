import { formatFootballGameTime } from "@/lib/date"
import { cn } from "@/lib/utils"

import { Typography } from "@/components/ui/typography"

interface GameMinuteBadgeProps {
  minute: number
  variant?: "compact" | "pill"
  className?: string
}

const VARIANT = {
  compact:
    "rounded-4 border-gold/30 bg-gold/10 border px-1.5 py-0.5 max-sm:px-1 max-sm:py-0",
  pill: "rounded-4 border-gold/50 bg-gold/20 flex h-[30px] items-center border px-1.5 shadow-[0_0_12px_rgba(245,197,24,0.5),0_2px_8px_rgba(0,0,0,0.6)] backdrop-blur-sm max-md:h-6 max-sm:h-6",
}

export function GameMinuteBadge({ minute, variant = "compact", className }: GameMinuteBadgeProps) {
  return (
    <div className={cn(VARIANT[variant], className)}>
      <Typography
        as="span"
        variant="label"
        weight="700"
        className="text-gold drop-shadow-gold max-sm:!text-10"
      >
        {formatFootballGameTime(minute)}
        <span className="animate-blink">&apos;</span>
      </Typography>
    </div>
  )
}

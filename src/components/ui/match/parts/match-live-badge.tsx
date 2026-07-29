import { cn } from "@/lib/utils"

import { MATCH_GOLD_GLOW_CLASS } from "@/constants/ui/ui-match.constants"

import { Typography } from "@/components/ui/typography"

interface MatchLiveBadgeProps {
  halfLabel: string
  displayMinute: number | string
  className?: string
}

export function MatchLiveBadge({ halfLabel, displayMinute, className }: MatchLiveBadgeProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1.5", className)}>
      <span className="relative flex size-4 shrink-0 items-center justify-center">
        <span className="absolute size-full animate-ping rounded-full bg-red-500 opacity-40" />
        <span className="absolute size-2.5 rounded-full bg-red-500/30 blur-[2px]" />
        <span className="relative size-2 rounded-full bg-linear-to-br from-red-400 to-rose-600 shadow-[0_0_10px_4px_rgba(239,68,68,0.9),inset_0_1px_1px_rgba(255,255,255,0.3)]" />
      </span>
      <Typography variant="label" weight="600" className={MATCH_GOLD_GLOW_CLASS}>
        {halfLabel}: {displayMinute}
        <span className="animate-blink">&apos;</span>
      </Typography>
    </div>
  )
}

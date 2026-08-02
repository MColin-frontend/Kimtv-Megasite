import { Calendar, Trophy } from "lucide-react"

import { formatMatchDate, formatMatchTime } from "@/lib/date"
import { cn } from "@/lib/utils"

import { Img } from "@/components/ui/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

type LeagueTimeVariant = "card" | "live" | "info"

interface LeagueTimeRowProps {
  leagueLogo?: string | null
  leagueName?: string | null
  startTime?: number | null
  variant?: LeagueTimeVariant
  className?: string
}

const V = {
  card: {
    wrapper: "",
    innerGap: "gap-1.5",
    logoClass: "size-5 shrink-0 max-md:size-4 max-sm:size-3.5",
    nameClass: "!text-14 max-sm:!text-10 block truncate text-white/90",
    showTooltip: true,
    calendarClass: "size-3.5 shrink-0 text-white/80 max-md:size-3 max-sm:size-2.5",
    timeWrapperClass: "gap-1",
    timeClass: "!text-14 max-sm:!text-10 text-white/70 tabular-nums",
  },
  live: {
    wrapper: "",
    innerGap: "gap-1.5 max-md:gap-1 max-sm:gap-1",
    logoClass: "size-3.5 shrink-0 max-md:size-3 max-sm:size-3",
    nameClass: "max-md:!text-10 max-sm:!text-10 block truncate text-white",
    showTooltip: true,
    calendarClass: "size-3 shrink-0 text-white/90 max-md:size-2.5 max-sm:size-2.5",
    timeWrapperClass: "gap-1 max-md:gap-0.5 max-sm:gap-0.5",
    timeClass: "max-md:!text-10 max-sm:!text-10 text-white/90 tabular-nums",
  },
  info: {
    wrapper: "",
    innerGap: "gap-1.5",
    logoClass: "size-5 shrink-0 max-md:size-4 max-sm:size-3.5",
    nameClass: "!text-14 max-sm:!text-10 min-w-0 truncate text-white/90",
    showTooltip: false,
    calendarClass: "size-3.5 shrink-0 text-white/50 max-md:size-3 max-sm:size-2.5",
    timeWrapperClass: "gap-1",
    timeClass: "!text-14 max-sm:!text-10 text-white/70 tabular-nums",
  },
} as const

export function LeagueTimeRow({
  leagueLogo,
  leagueName,
  startTime,
  variant = "card",
  className,
}: LeagueTimeRowProps) {
  const v = V[variant]

  const leagueNameEl = (
    <Typography as="span" variant="caption" weight="500" className={v.nameClass}>
      {leagueName}
    </Typography>
  )

  return (
    <div className={cn("flex items-center justify-between", v.wrapper, className)}>
      <div className={cn("flex min-w-0 flex-1 items-center overflow-hidden", v.innerGap)}>
        {leagueLogo ? (
          <Img
            src={leagueLogo}
            alt=""
            width={20}
            height={20}
            objectFit="contain"
            className={v.logoClass}
          />
        ) : (
          <Trophy className="text-gold size-3.5 shrink-0" />
        )}
        {v.showTooltip ? (
          <Tooltip>
            <TooltipTrigger className="block max-w-[120px] min-w-0 overflow-hidden">
              {leagueNameEl}
            </TooltipTrigger>
            <TooltipContent>{leagueName}</TooltipContent>
          </Tooltip>
        ) : (
          leagueNameEl
        )}
      </div>
      {startTime && (
        <div className={cn("flex shrink-0 items-center", v.timeWrapperClass)}>
          <Calendar className={v.calendarClass} />
          <Typography as="span" variant="caption" weight="500" className={v.timeClass}>
            {formatMatchTime(startTime)}
            <span className="mx-1 inline-block h-2.5 w-px bg-white/30 align-middle" />
            {formatMatchDate(startTime)}
          </Typography>
        </div>
      )}
    </div>
  )
}

"use client"

import { Clock, Flag } from "lucide-react"

import { type MatchStatusType } from "@/lib/match.utils"
import { cn } from "@/lib/utils"

import { useTranslation } from "@/i18n"
import { MATCH_STATUS_LABEL_CONFIG } from "@/constants/component/match-card.constants"

import { Typography } from "@/components/ui/typography"

export type { MatchStatusType }

interface BadgeStatusProps {
  type: MatchStatusType
  label?: string
  className?: string
}

function LiveDot() {
  return (
    <span className="relative flex size-[22px] shrink-0 items-center justify-center max-sm:size-[11px]">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 [animation-duration:0.8s]" />
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40 [animation-delay:0.2s] [animation-duration:1.2s]" />
      <span className="shadow-live-red relative inline-flex size-[14px] rounded-full bg-red-600 max-sm:size-[7px]" />
    </span>
  )
}

export function BadgeStatus({ type, label, className }: BadgeStatusProps) {
  const { t } = useTranslation()
  const config = MATCH_STATUS_LABEL_CONFIG[type]
  const defaultLabel = t(config.i18nKey as Parameters<typeof t>[0])

  return (
    <div
      className={cn(
        "relative inline-flex h-[56px] w-fit items-stretch overflow-hidden rounded-l-[6px] rounded-r-full border max-sm:h-[28px]",
        config.wrapperClass,
        className
      )}
    >
      {/* Left accent bar */}
      <div className={cn("absolute top-0 left-0 h-full w-[3px]", config.leftAccentClass)} />

      {/* Icon + label */}
      <div className="flex shrink-0 items-center gap-3 pr-5 pl-5 max-sm:gap-1.5 max-sm:px-2">
        {/* Left-pointing triangle */}
        <div
          className={cn(
            "size-0 shrink-0 border-y-[5px] border-r-[6px] border-y-transparent",
            config.triangleClass
          )}
        />

        {type === "live" && <LiveDot />}
        {type === "upcoming" && (
          <Clock className="text-gold size-[22px] shrink-0 drop-shadow-[0_0_8px_rgba(246,195,67,0.9)] max-sm:size-[11px]" />
        )}
        {type === "finished" && (
          <Flag className="size-[22px] shrink-0 text-white/35 max-sm:size-[11px]" />
        )}

        <Typography
          as="span"
          size="20"
          weight="700"
          className={cn(
            "tracking-4 max-sm:!text-10 max-sm:tracking-1 whitespace-nowrap uppercase",
            config.textClass
          )}
        >
          {label ?? defaultLabel}
        </Typography>
      </div>

      {/* Badge */}
      <div className={cn("flex shrink-0 items-center px-5 max-sm:px-2", config.badgeClass)}>
        <Typography
          as="span"
          size="14"
          weight="700"
          className="tracking-2 max-sm:!text-10 max-sm:tracking-1 whitespace-nowrap uppercase"
        >
          {config.badge}
        </Typography>
      </div>
    </div>
  )
}

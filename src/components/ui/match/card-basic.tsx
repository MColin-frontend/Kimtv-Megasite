"use client"

import "react"

import { Users, Video } from "lucide-react"

import { deriveMatchStatusFlags, LIVE_MATCH_TYPE } from "@/lib/match.utils"
import { cn, formatViewers } from "@/lib/utils"
import { useCountdown } from "@/hooks/use-countdown"
import { useFakeGameMinute } from "@/hooks/use-fake-game-minute"
import { useLiveNavigate } from "@/hooks/use-live-navigate"

import { useTranslation } from "@/i18n"
import {
  buildMatchStats,
  COUNTDOWN_ITEMS_CONFIG,
  MATCH_CARD_I18N_KEYS,
} from "@/constants/component/match-card.constants"
import type { AnchorRoomVo, MatchInterface } from "@/models/match.models"

import icMic from "@assets/icons/match/ic-mic.svg"
import imgVs from "@assets/images/common/img-vs.png"

import { Avatar, AvatarImage } from "../avatar"
import { Img } from "../image"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"
import { Typography } from "../typography"
import { BadgeLive } from "./parts/badge-live"
import { CardBackground } from "./parts/card-background"
import { GameMinuteBadge } from "./parts/game-minute-badge"
import { LeagueTimeRow } from "./parts/league-time-row"
import { MatchStatBar } from "./parts/stat-bar"
import { StatusBadge } from "./parts/status-badge"
import { ViewersBadge } from "./parts/viewers-badge"
import { CardBasicSkeleton } from "./skeleton"

type MatchCardType = (typeof LIVE_MATCH_TYPE)[keyof typeof LIVE_MATCH_TYPE]

interface CardProps {
  match?: MatchInterface
  isLoading?: boolean
  matchType?: MatchCardType
  className?: string
}

/* ── Main Component ──────────────────────────────────────── */

export function Card({ match, isLoading, className }: CardProps) {
  const { t } = useTranslation()
  const navigateToLive = useLiveNavigate()

  const anchors: AnchorRoomVo[] = match?.anchorRoomVos ?? []
  const firstAnchor = anchors[0] ?? null

  const { isStream, isLive, isUpcoming, isFinished } = deriveMatchStatusFlags({
    status: match?.status,
    anchor: match?.anchor,
    hasAnchorRoom: !!firstAnchor,
  })

  // Only run countdown interval for upcoming cards — avoids per-second re-renders on live/finished slides
  const countdown = useCountdown(isUpcoming ? match?.startTime : null)
  const countdownDone =
    !!match?.startTime &&
    countdown.hours === 0 &&
    countdown.minutes === 0 &&
    countdown.seconds === 0

  const displayMinute = useFakeGameMinute(match?.gameTime ?? null, isStream || isLive)

  if (isLoading || !match) return <CardBasicSkeleton className={className} />

  const thumbnail = firstAnchor?.cover ?? match.animationUrl ?? null

  function handleClick() {
    if (!match?.matchId || !match?.gameId) return
    if (!isLive && !isStream) return
    navigateToLive(match.matchId, match.gameId)
  }

  const stats = buildMatchStats(match, (key) => t(key as Parameters<typeof t>[0]))

  return (
    <div
      onClick={handleClick}
      className={cn(
        "card-match-bg rounded-12 shadow-card relative h-full w-full overflow-hidden transition-[box-shadow]",
        (isLive || isStream) && match?.matchId && match?.gameId
          ? "hover:shadow-card-hover cursor-pointer"
          : "cursor-default",
        className
      )}
    >
      <CardBackground
        thumbnail={thumbnail}
        homeLogo={match.homeLogo}
        awayLogo={match.awayLogo}
        isUpcoming={isUpcoming}
      />

      <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between gap-2 p-3.5 max-md:gap-1.5 max-md:p-2.5 max-sm:min-h-[250px] max-sm:gap-1.5 max-sm:p-2">
        {/* Row 1: LIVE badge | viewers + time (right) */}
        <div className="flex items-center justify-between max-sm:-my-1 max-sm:origin-left">
          <div className="flex items-center gap-2 max-sm:gap-1.5">
            {isStream && <BadgeLive label="Stream" />}
            {isLive && <BadgeLive label="LIVE" />}
          </div>
          <div className="flex items-center gap-1.5 max-sm:gap-1">
            {isLive && <ViewersBadge count={match.onlineNum} />}
            {isLive && displayMinute != null && displayMinute !== 0 && (
              <GameMinuteBadge minute={displayMinute} />
            )}
          </div>
        </div>

        {/* Row 2: BLV info */}
        {isStream && firstAnchor && (
          <div className="mt-1 flex items-center gap-1.5">
            {/* Avatar với mic icon overlay */}
            {firstAnchor.userAvatar && (
              <div className="relative shrink-0">
                <Avatar size={32} className="ring-live-green ring-1">
                  <AvatarImage src={firstAnchor.userAvatar} />
                </Avatar>
                <div className="bg-live-green-bg shadow-white-soft absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full">
                  <Img src={icMic} alt="mic" width={14} height={14} objectFit="contain" />
                </div>
              </div>
            )}

            {/* Text info */}
            <div className="flex min-w-0 flex-col gap-0.5">
              {/* Label badge */}
              <div className="border-live-green/60 bg-live-green-bg shadow-live-green-sm flex w-fit items-center gap-1 rounded-full border px-2 py-1 backdrop-blur-2xl">
                <Img src={icMic} alt="mic" width={10} height={10} objectFit="contain" />
                <Typography
                  as="span"
                  size="10"
                  weight="600"
                  className="text-live-green leading-none uppercase"
                >
                  {t(MATCH_CARD_I18N_KEYS.blvLabel)}
                </Typography>
              </div>
              {/* Name */}
              <Tooltip>
                <TooltipTrigger className="block min-w-0 overflow-hidden">
                  <Typography
                    as="span"
                    variant="caption"
                    weight="700"
                    className="truncate text-white"
                  >
                    {firstAnchor.userName}
                  </Typography>
                </TooltipTrigger>
                <TooltipContent>{firstAnchor.userName}</TooltipContent>
              </Tooltip>
              {/* Viewers */}
              {firstAnchor.popularity != null && firstAnchor.popularity > 0 && (
                <Tooltip>
                  <TooltipTrigger className="block min-w-0 overflow-hidden">
                    <div className="flex w-fit items-center gap-1">
                      <Users className="size-3 text-white/80" />
                      <Typography
                        as="span"
                        variant="caption"
                        weight="500"
                        className="text-white/60 tabular-nums"
                      >
                        {formatViewers(firstAnchor.popularity)} {t(MATCH_CARD_I18N_KEYS.watching)}
                      </Typography>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {firstAnchor.popularity.toLocaleString("vi-VN")}{" "}
                    {t(MATCH_CARD_I18N_KEYS.watchingTooltip)}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Row 3: Teams + Score */}
        <div className="flex flex-1 items-center justify-between gap-2">
          {/* Home */}
          <div className="flex basis-2/5 flex-col items-center gap-1.5">
            <div className="flex size-[80px] shrink-0 items-center justify-center max-md:size-[60px] max-sm:size-[44px]">
              <Img
                src={match.homeLogo}
                alt={match.homeName ?? ""}
                width={80}
                height={80}
                objectFit="contain"
              />
            </div>
            <Tooltip>
              <TooltipTrigger className="block min-w-0 overflow-hidden">
                <Typography
                  as="span"
                  variant="label"
                  weight="500"
                  className="max-sm:!text-10 line-clamp-1 w-full text-center text-white"
                >
                  {match.homeName}
                </Typography>
              </TooltipTrigger>
              <TooltipContent>{match.homeName}</TooltipContent>
            </Tooltip>
          </div>

          {/* Score */}
          <div className="flex basis-1/5 flex-col items-center gap-0.5">
            {isUpcoming ? (
              <Img
                src={imgVs}
                alt="VS"
                width={72}
                height={72}
                objectFit="contain"
                className="max-md:size-14 max-sm:size-10"
              />
            ) : (
              <>
                <div className="flex items-center gap-0.5">
                  <span className="text-60 font-700 text-gold drop-shadow-gold-score max-md:!text-48 max-sm:!text-36 leading-none tabular-nums">
                    {match.homeScore ?? 0}
                  </span>
                  <span className="text-30 font-500 text-gold/60 max-md:!text-24 max-sm:!text-20 px-0.5 leading-100">
                    :
                  </span>
                  <span className="text-60 font-700 text-gold drop-shadow-gold-score max-md:!text-48 max-sm:!text-36 leading-none tabular-nums">
                    {match.awayScore ?? 0}
                  </span>
                </div>
                {/* TODO: {isLive && <StatusBadge type="live" label={periodLabel} />} */}
                {isFinished && (
                  <StatusBadge type="finished" label={t(MATCH_CARD_I18N_KEYS.finished)} />
                )}
              </>
            )}
          </div>

          {/* Away */}
          <div className="flex basis-2/5 flex-col items-center gap-1.5">
            <div className="flex size-[80px] shrink-0 items-center justify-center max-md:size-[60px] max-sm:size-[44px]">
              <Img
                src={match.awayLogo}
                alt={match.awayName ?? ""}
                width={80}
                height={80}
                objectFit="contain"
              />
            </div>
            <Tooltip>
              <TooltipTrigger className="block min-w-0 overflow-hidden">
                <Typography
                  as="span"
                  variant="label"
                  weight="500"
                  className="max-sm:!text-10 line-clamp-1 w-full text-center text-white"
                >
                  {match.awayName}
                </Typography>
              </TooltipTrigger>
              <TooltipContent>{match.awayName}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Row 4: Countdown (upcoming) */}
        {isUpcoming &&
          (countdownDone ? (
            <div className="rounded-8 flex flex-col items-center justify-center gap-1 bg-white/[0.06] px-3 py-2 text-center backdrop-blur-2xl max-md:px-2 max-md:py-1 max-sm:px-1 max-sm:py-0.5">
              <span className="flex items-center gap-1">
                <Video
                  className="text-gold size-4 drop-shadow-[0_0_8px_rgba(245,197,24,0.8)]"
                  aria-hidden
                />
                <Typography
                  as="span"
                  variant="overline"
                  className="text-gold drop-shadow-[0_0_8px_rgba(245,197,24,0.8)]"
                >
                  {t(MATCH_CARD_I18N_KEYS.streamUpcomingLabel as Parameters<typeof t>[0])}
                </Typography>
              </span>
              <Typography
                variant="h6"
                weight="700"
                className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
              >
                {t(MATCH_CARD_I18N_KEYS.streamUpcomingTitle as Parameters<typeof t>[0])}
              </Typography>
              <Typography as="span" variant="caption" color="white/80">
                {t(MATCH_CARD_I18N_KEYS.streamUpcomingSubtitle as Parameters<typeof t>[0])}
              </Typography>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              {COUNTDOWN_ITEMS_CONFIG.map((cfg) => ({
                value: countdown[cfg.valueKey],
                label: t(cfg.labelKey as Parameters<typeof t>[0]),
              })).map(({ value, label }, i) => (
                <div key={label} className="flex items-start gap-2">
                  <div className="flex flex-col items-center">
                    <Typography
                      variant="h3"
                      weight="700"
                      className="text-gold leading-100 tabular-nums"
                    >
                      {String(value).padStart(2, "0")}
                    </Typography>
                    <Typography as="span" size="12" className="text-muted mt-1">
                      {label}
                    </Typography>
                  </div>
                  {i < 2 && (
                    <Typography variant="h3" weight="700" className="text-gold/60 leading-100">
                      :
                    </Typography>
                  )}
                </div>
              ))}
            </div>
          ))}

        {/* Row 4: Stats (live/finished) */}
        {!isUpcoming && <MatchStatBar stats={stats} />}

        <LeagueTimeRow
          leagueLogo={match.leagueLogo}
          leagueName={match.leagueName}
          startTime={match.startTime}
        />
      </div>
    </div>
  )
}

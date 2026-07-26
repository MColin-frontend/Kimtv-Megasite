"use client"

import "react"

import { Calendar, Trophy, Users } from "lucide-react"

import { formatFootballGameTime, formatMatchDate, formatMatchTime } from "@/lib/date"
import { LIVE_MATCH_TYPE } from "@/lib/match.utils"
import { cn, formatViewers } from "@/lib/utils"
import { useCountdown } from "@/hooks/use-countdown"
import { useLiveNavigate } from "@/hooks/use-live-navigate"
import { useFakeGameMinute } from "@/hooks/useFakeGameMinute"

import { useTranslation } from "@/i18n"
import { MATCH_HALF_LABEL } from "@/constants/common.constants"
import {
  COUNTDOWN_I18N_KEYS,
  MATCH_CARD_I18N_KEYS,
  MATCH_HALF_LABEL_I18N_KEY,
  MATCH_STAT_CONFIG,
} from "@/constants/component/match-card.constants"
import { MatchFootballStateEnum, MatchStatusEnum } from "@/enums/match.enum"
import type { AnchorRoomVo, MatchInterface } from "@/models/match.models"

import icMic from "@assets/icons/match/ic-mic.svg"
import imgStadiumBg from "@assets/images/common/img-stadium-card-bg.png"
import imgStadiumUpcoming from "@assets/images/common/img-stadium-upcoming.png"
import imgVs from "@assets/images/common/img-vs.png"

import { Avatar, AvatarImage } from "../avatar"
import { Img } from "../image"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"
import { Typography } from "../typography"
import { MatchLiveIndicator } from "./parts/match-live-indicator"
import { MatchStatusBadge } from "./parts/match-status-badge"
import { MatchCardSkeleton } from "./skeleton"

type MatchCardType = (typeof LIVE_MATCH_TYPE)[keyof typeof LIVE_MATCH_TYPE]

interface MatchCardProps {
  match?: MatchInterface
  isLoading?: boolean
  matchType?: MatchCardType
  className?: string
}

/* ── Main Component ──────────────────────────────────────── */

export function MatchCard({ match, isLoading, className }: MatchCardProps) {
  const { t } = useTranslation()
  const navigateToLive = useLiveNavigate()
  const countdown = useCountdown(match?.startTime)

  function handleClick() {
    if (!match?.matchId || !match?.gameId) return
    navigateToLive(match.matchId, match.gameId)
  }

  if (isLoading || !match) return <MatchCardSkeleton className={className} />

  const anchors: AnchorRoomVo[] = match.anchorRoomVos ?? []
  const firstAnchor = anchors[0] ?? null
  const thumbnail = firstAnchor?.cover ?? match.animationUrl ?? null

  const isUpcoming =
    match.status === MatchStatusEnum.UPCOMING || match.status === MatchStatusEnum.UNKNOWN
  const isFinished = match.status === MatchStatusEnum.FINISHED
  const isMatchLive = match.status === MatchStatusEnum.LIVE
  // BLV đang stream → "Stream" (bất kể status trận)
  const isStream = !!match.anchor || !!firstAnchor
  // Trận live nhưng không có BLV → "LIVE"
  const isLive = isMatchLive && !isStream
  const halfLabel = MATCH_HALF_LABEL[match.state as MatchFootballStateEnum] ?? "LIVE"
  const periodI18nKey = MATCH_HALF_LABEL_I18N_KEY[halfLabel]
  const periodLabel = periodI18nKey ? t(periodI18nKey as Parameters<typeof t>[0]) : halfLabel
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const displayMinute = useFakeGameMinute(match.gameTime, isStream || isLive)

  const statValues = [
    0,
    (match.homeYellowCard ?? 0) + (match.awayYellowCard ?? 0),
    (match.homeRedCard ?? 0) + (match.awayRedCard ?? 0),
    (match.homeCornerKick ?? 0) + (match.awayCornerKick ?? 0),
  ]
  const stats = MATCH_STAT_CONFIG.map((cfg, i) => ({
    ...cfg,
    label: t(cfg.labelKey as Parameters<typeof t>[0]),
    value: statValues[i],
  }))

  return (
    <div
      onClick={handleClick}
      className={cn(
        "card-match-bg rounded-12 relative h-full w-full overflow-hidden shadow-none transition-all",
        match?.matchId && match?.gameId
          ? "hover:shadow-card-hover cursor-pointer"
          : "cursor-default",
        className
      )}
    >
      {thumbnail ? (
        <>
          {/* Thumbnail image bg */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${thumbnail})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          />
          {/* Gradient: rõ trên, mờ dần xuống dưới */}
          <div className="card-thumbnail-overlay pointer-events-none absolute inset-0 z-[1]" />
        </>
      ) : (
        <>
          {/* Fallback: stadium bg */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${isUpcoming ? imgStadiumUpcoming.src : imgStadiumBg.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Team logo glow overlay */}
          {match.homeLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${match.homeLogo})`,
                backgroundSize: "160px",
                backgroundPosition: "-10px center",
                backgroundRepeat: "no-repeat",
                filter: "blur(55px) saturate(2)",
                opacity: 0.13,
                transform: "scale(1.6)",
              }}
            />
          )}
          {match.awayLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${match.awayLogo})`,
                backgroundSize: "160px",
                backgroundPosition: "calc(100% + 10px) center",
                backgroundRepeat: "no-repeat",
                filter: "blur(55px) saturate(2)",
                opacity: 0.1,
                transform: "scale(1.6)",
              }}
            />
          )}
          <div className="card-stadium-overlay pointer-events-none absolute inset-0 z-[1]" />
        </>
      )}

      <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between gap-2 p-3.5 max-md:gap-1.5 max-md:p-2.5 max-sm:gap-1.5 max-sm:p-2">
        {/* Row 1: LIVE badge | viewers + time (right) */}
        <div className="flex items-center justify-between max-sm:-my-1 max-sm:origin-left">
          <div className="flex items-center gap-2 max-sm:gap-1.5">
            {isStream && <MatchLiveIndicator label="Stream" />}
            {isLive && <MatchLiveIndicator label="LIVE" />}
          </div>
          <div className="flex items-center gap-1.5 max-sm:gap-1">
            {isLive && !!match.onlineNum && match.onlineNum > 0 && (
              <div className="rounded-6 flex h-[30px] items-center gap-1 border border-white/20 bg-black/60 px-2 shadow-[0_2px_12px_rgba(0,0,0,0.7),0_0_6px_rgba(255,255,255,0.05)] backdrop-blur-md max-sm:h-5 max-sm:px-1">
                <Users className="size-3.5 shrink-0 text-white/80 max-sm:size-2.5" aria-hidden />
                <Typography
                  as="p"
                  size="14"
                  weight="500"
                  className="max-sm:!text-10 leading-none text-white tabular-nums"
                >
                  {formatViewers(match.onlineNum)}
                </Typography>
              </div>
            )}
            {isLive && displayMinute != null && displayMinute !== 0 && (
              <div className="rounded-4 border-gold/30 bg-gold/10 border px-1.5 py-0.5 max-sm:px-1">
                <Typography
                  as="span"
                  variant="label"
                  weight="700"
                  className="text-gold max-sm:!text-12"
                >
                  {formatFootballGameTime(displayMinute)}
                  <span className="animate-blink">&apos;</span>
                </Typography>
              </div>
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
                {isLive && <MatchStatusBadge type="live" label={periodLabel} />}
                {isFinished && (
                  <MatchStatusBadge type="finished" label={t(MATCH_CARD_I18N_KEYS.finished)} />
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
        {isUpcoming && (
          <div className="flex items-center justify-center gap-3">
            {[
              { value: countdown.hours, label: t(COUNTDOWN_I18N_KEYS.hours) },
              { value: countdown.minutes, label: t(COUNTDOWN_I18N_KEYS.minutes) },
              { value: countdown.seconds, label: t(COUNTDOWN_I18N_KEYS.seconds) },
            ].map(({ value, label }, i) => (
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
        )}

        {/* Row 4: Stats (live/finished) */}
        {!isUpcoming && (
          <div className="rounded-8 flex items-center justify-between gap-1 bg-white/[0.02] px-2 py-1.5 backdrop-blur-[80px] max-sm:px-1 max-sm:py-0.5">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-1 items-center">
                {i > 0 && <div className="h-4 w-px shrink-0 bg-white/20 max-sm:h-2.5" />}
                <div className="flex flex-1 flex-col items-center gap-0.5">
                  <div className="flex items-center gap-0.5">
                    <Img
                      src={s.icon}
                      alt={s.alt}
                      width={16}
                      height={16}
                      objectFit="contain"
                      className="max-sm:!size-[10px]"
                    />
                    <Typography
                      as="span"
                      variant="caption"
                      size="14"
                      weight="700"
                      className="max-sm:!text-10 text-white tabular-nums"
                    >
                      {s.value}
                    </Typography>
                  </div>
                  <Typography
                    as="span"
                    variant="caption"
                    weight="500"
                    className="whitespace-nowrap text-white max-sm:!text-[9px]"
                  >
                    {s.label}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Row 5: Bottom bar — league + time */}
        <div className="flex items-center justify-between px-0.5 py-1">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
            {match.leagueLogo ? (
              <Img
                src={match.leagueLogo}
                alt=""
                width={20}
                height={20}
                objectFit="contain"
                className="shrink-0 max-sm:size-3.5"
              />
            ) : (
              <Trophy className="text-gold size-3.5 shrink-0" />
            )}
            <Tooltip>
              <TooltipTrigger className="block max-w-[120px] min-w-0 overflow-hidden">
                <Typography
                  as="span"
                  variant="caption"
                  weight="500"
                  className="max-sm:!text-10 block truncate text-white/90"
                >
                  {match.leagueName}
                </Typography>
              </TooltipTrigger>
              <TooltipContent>{match.leagueName}</TooltipContent>
            </Tooltip>
          </div>
          {match.startTime && (
            <div className="flex shrink-0 items-center gap-1">
              <Calendar className="size-3 shrink-0 text-white/80" />
              <Typography
                as="span"
                variant="caption"
                weight="500"
                className="max-sm:!text-10 text-white/70 tabular-nums"
              >
                {formatMatchTime(match.startTime)}
                <span className="mx-1 inline-block h-2.5 w-px bg-white/30 align-middle" />
                {formatMatchDate(match.startTime)}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

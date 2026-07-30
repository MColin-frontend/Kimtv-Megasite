"use client"

import { Calendar, Trophy, Users } from "lucide-react"

import { cn, formatViewers } from "@/lib/utils"
import { deriveMatchStatusFlags } from "@/lib/match.utils"
import { useLiveNavigate } from "@/hooks/use-live-navigate"

import { useTranslation } from "@/i18n"
import { buildMatchStats, MATCH_CARD_I18N_KEYS } from "@/constants/component/match-card.constants"
import type { LiveSearchMatchInterface } from "@/models/match.models"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Img } from "@/components/ui/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import icMic from "@assets/icons/match/ic-mic.svg"
import imgStadiumBg from "@assets/images/common/img-stadium-card-bg.png"
import imgVs from "@assets/images/common/img-vs.png"

import { CardBackground } from "./parts/card-background"
import { GameMinuteBadge } from "./parts/game-minute-badge"
import { LeagueTimeRow } from "./parts/league-time-row"
import { MatchStatBar } from "./parts/stat-bar"
import { ViewersBadge } from "./parts/viewers-badge"

export type { LiveSearchMatchInterface }

export function MatchCardLive({
  match,
  className,
}: {
  match: LiveSearchMatchInterface
  className?: string
}) {
  const { t } = useTranslation()
  const navigateToLive = useLiveNavigate()

  const { isMatchLive, isStream, isLive, isUpcoming, isFinished } = deriveMatchStatusFlags({
    status: match.status,
    state: match.state,
    anchor: match.anchor,
  })

  const stats = buildMatchStats(match, (key) => t(key as Parameters<typeof t>[0]))

  function handleClick() {
    if (!match.matchId || !match.gameId) return
    navigateToLive(match.matchId, match.gameId, match.roomId)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "card-match-bg rounded-12 relative w-full overflow-hidden transition-all",
        match.matchId && match.gameId ? "hover:shadow-card-hover cursor-pointer" : "cursor-default",
        "shadow-none",
        className
      )}
    >
      <CardBackground
        thumbnail={match.liveImage}
        homeLogo={match.homeLogo}
        awayLogo={match.awayLogo}
        stadiumSrc={imgStadiumBg.src}
        thumbnailExtras={
          <>
            <div className="pointer-events-none absolute inset-0 z-[1] bg-black/15" />
            <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-black/25 to-black/75" />
          </>
        }
        stadiumExtras={
          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-black/40 to-black/90" />
        }
      />

      {/* ── Content overlay ── */}
      <div className="relative z-[3] flex h-full min-h-[300px] flex-col justify-between gap-2 p-3.5 max-md:gap-1.5 max-md:p-2.5 max-sm:min-h-[250px] max-sm:gap-1.5 max-sm:p-2">
        {/* Row 1: LIVE | HD + viewers */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 max-md:gap-1 max-sm:gap-1">
            {(isStream || isLive) && (
              <>
                <div className="relative flex items-center gap-1.5 overflow-visible">
                  <div className="pointer-events-none absolute inset-0 -z-10 scale-150 animate-pulse rounded-full bg-red-600/40 blur-md" />
                  <div className="rounded-6 shadow-live-red relative flex h-[30px] items-center gap-1.5 bg-red-600 px-2.5 max-md:h-6 max-md:gap-1 max-md:px-2 max-sm:h-5 max-sm:gap-1 max-sm:px-2">
                    <span className="relative flex size-2.5 shrink-0 max-md:size-2 max-sm:size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 [animation-duration:0.8s]" />
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40 [animation-delay:0.2s] [animation-duration:1.2s]" />
                      <span className="shadow-white-dot relative inline-flex size-2.5 rounded-full bg-white max-md:size-2 max-sm:size-2" />
                    </span>
                    <span className="text-12 font-800 max-md:text-10 max-sm:text-10 tracking-widest text-white uppercase">
                      {isStream
                        ? t(MATCH_CARD_I18N_KEYS.streamLabel as Parameters<typeof t>[0])
                        : t(MATCH_CARD_I18N_KEYS.liveLabel as Parameters<typeof t>[0])}
                    </span>
                  </div>
                </div>
                {match.gameTime != null && (
                  <GameMinuteBadge minute={match.gameTime} variant="pill" />
                )}
              </>
            )}
            {isFinished && (
              <div className="rounded-4 border-gold/50 bg-gold/20 border px-1.5 py-px shadow-[0_0_10px_rgba(245,197,24,0.4),0_2px_6px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                <Typography size="10" weight="600" className="text-gold drop-shadow-gold-sm">
                  {t(MATCH_CARD_I18N_KEYS.finished as Parameters<typeof t>[0])}
                </Typography>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 max-md:gap-1 max-sm:gap-1">
            {match.language && (
              <div className="rounded-4 border-gold/50 bg-gold/20 flex h-[30px] items-center border px-2 shadow-[0_0_16px_rgba(245,197,24,0.6),0_2px_8px_rgba(0,0,0,0.6)] backdrop-blur-md max-md:h-6 max-md:px-1.5 max-sm:h-6 max-sm:px-1.5">
                <Typography
                  size="14"
                  weight="800"
                  className="text-gold drop-shadow-gold max-sm:text-12 leading-none uppercase"
                >
                  {match.language}
                </Typography>
              </div>
            )}
            <ViewersBadge count={match.onlineNum} className="max-md:h-6 max-md:px-1.5" />
          </div>
        </div>

        {/* Row 2: BLV | minute */}
        <div className="flex items-center justify-between">
          {isStream ? (
            <div className="flex items-center gap-2.5 max-md:origin-left max-md:zoom-75 max-sm:origin-left max-sm:zoom-75">
              {match.anchorAvatar && (
                <div className="relative shrink-0">
                  <Avatar
                    size={52}
                    className="ring-live-green shadow-[0_0_16px_rgba(0,0,0,0.9),0_0_8px_rgba(0,200,100,0.3)] ring-2"
                  >
                    <AvatarImage src={match.anchorAvatar} />
                  </Avatar>
                  <div className="bg-live-green-bg shadow-live-green-glow absolute -right-1.5 -bottom-1.5 flex size-7 items-center justify-center rounded-full">
                    <Img src={icMic} alt="mic" width={28} height={28} objectFit="contain" />
                  </div>
                </div>
              )}
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="border-live-green/70 bg-live-green-bg shadow-live-green-glow flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 backdrop-blur-2xl">
                  <Img src={icMic} alt="mic" width={11} height={11} objectFit="contain" />
                  <Typography
                    as="span"
                    size="10"
                    weight="700"
                    className="text-live-green drop-shadow-live-green leading-none uppercase"
                  >
                    {t(MATCH_CARD_I18N_KEYS.streamLabel as Parameters<typeof t>[0])}
                  </Typography>
                </div>
                <Tooltip>
                  <TooltipTrigger className="block min-w-0 overflow-hidden">
                    <Typography
                      as="span"
                      variant="label"
                      weight="700"
                      className="truncate text-white"
                    >
                      {match.anchorName}
                    </Typography>
                  </TooltipTrigger>
                  <TooltipContent>{match.anchorName}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* Row 3: Teams + Score */}
        <div className="flex flex-1 items-center justify-between gap-2">
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
                  className="max-md:text-10 max-sm:text-10 line-clamp-1 w-full text-center text-white"
                >
                  {match.homeName}
                </Typography>
              </TooltipTrigger>
              <TooltipContent>{match.homeName}</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex basis-1/5 flex-col items-center gap-0.5">
            {isUpcoming ? (
              <Img
                src={imgVs}
                alt="VS"
                width={72}
                height={72}
                objectFit="contain"
                className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] max-md:size-10 max-sm:size-10"
              />
            ) : (
              <>
                <div className="flex items-center gap-0.5">
                  <Typography
                    as="span"
                    size="72"
                    weight="700"
                    className="text-gold drop-shadow-gold-score max-md:!text-48 max-sm:!text-36 leading-none tabular-nums"
                  >
                    {match.homeScore ?? 0}
                  </Typography>
                  <Typography
                    as="span"
                    size="30"
                    weight="500"
                    className="text-gold/60 max-md:!text-20 max-sm:!text-16 px-0.5 leading-100"
                  >
                    :
                  </Typography>
                  <Typography
                    as="span"
                    size="72"
                    weight="700"
                    className="text-gold drop-shadow-gold-score max-md:!text-48 max-sm:!text-36 leading-none tabular-nums"
                  >
                    {match.awayScore ?? 0}
                  </Typography>
                </div>
                {/* TODO: <StatusBadge type="live" label={periodLabel} /> */}
              </>
            )}
          </div>

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
                  className="max-md:text-10 max-sm:text-10 line-clamp-1 w-full text-center text-white"
                >
                  {match.awayName}
                </Typography>
              </TooltipTrigger>
              <TooltipContent>{match.awayName}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Row 4: Stats bar */}
        {!isUpcoming && <MatchStatBar stats={stats} />}

        <LeagueTimeRow
          leagueLogo={match.leagueLogo}
          leagueName={match.leagueName}
          startTime={match.startTime}
          variant="live"
        />
      </div>
    </div>
  )
}

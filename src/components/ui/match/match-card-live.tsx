"use client"

import { Calendar, Trophy, Users } from "lucide-react"

import { formatFootballGameTime, formatMatchDate, formatMatchTime } from "@/lib/date"
import { cn, formatViewers } from "@/lib/utils"
import { useLiveNavigate } from "@/hooks/use-live-navigate"

import { useTranslation } from "@/i18n"
import { MATCH_HALF_LABEL } from "@/constants/common.constants"
import {
  MATCH_CARD_I18N_KEYS,
  MATCH_HALF_LABEL_I18N_KEY,
} from "@/constants/component/match-card.constants"
import { MatchFootballStateEnum, MatchStatusEnum } from "@/enums/match.enum"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Img } from "@/components/ui/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import icCornerFlag from "@assets/icons/match/ic-corner-flag.png"
import icMic from "@assets/icons/match/ic-mic.svg"
import icRedCardV2 from "@assets/icons/match/ic-red-card-v2.svg"
import icYellowCardV2 from "@assets/icons/match/ic-yellow-card-v2.svg"
import imgStadiumBg from "@assets/images/common/img-stadium-card-bg.png"
import imgVs from "@assets/images/common/img-vs.png"

import { MatchStatusBadge } from "./parts/match-status-badge"

/* ── Type ─────────────────────────────────────────────────── */

export interface LiveSearchMatchInterface {
  matchId: number
  gameId: number
  homeName: string | null
  awayName: string | null
  homeLogo: string | null
  awayLogo: string | null
  homeScore: number
  awayScore: number
  leagueName: string | null
  leagueLogo: string | null
  liveImage: string | null
  liveUrl: string | null
  liveUrlFlv: string | null
  gameTime: number | null
  state: number | null
  status: number | null
  onlineNum: number | null
  homeCornerKick: number | null
  awayCornerKick: number | null
  homeYellowCard: number | null
  awayYellowCard: number | null
  homeRedCard: number | null
  awayRedCard: number | null
  startTime: number | null
  language: string | null
  seriesName: string | null
  isLive: boolean | null
  anchor: boolean
  anchorName: string | null
  anchorAvatar: string | null
  anchorTitle: string | null
  hotValue: number | null
  roomId?: number | null
}

/* ── Stat item ────────────────────────────────────────────── */

function StatItem({
  icon,
  alt,
  home,
  away,
  label,
}: {
  icon: string
  alt: string
  home: number
  away: number
  label: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 px-4 max-sm:px-1">
      <div className="flex items-center gap-1 max-sm:gap-0.5">
        <Img
          src={icon}
          alt={alt}
          width={16}
          height={16}
          objectFit="contain"
          className="max-sm:!size-[10px]"
        />
        <span className="text-12 sm:text-14 leading-150 font-700 max-sm:!text-10 text-white tabular-nums">{home}</span>
        <span className="text-12 font-400 leading-150 tracking-1 text-white/50">-</span>
        <span className="text-12 sm:text-14 leading-150 font-700 max-sm:!text-10 text-white tabular-nums">{away}</span>
      </div>
      <span className="text-12 leading-150 tracking-1 font-500 whitespace-nowrap text-white/80 max-sm:!text-[9px]">
        {label}
      </span>
    </div>
  )
}

/* ── Main card ────────────────────────────────────────────── */

export function MatchCardLive({
  match,
  className,
}: {
  match: LiveSearchMatchInterface
  className?: string
}) {
  const { t } = useTranslation()
  const navigateToLive = useLiveNavigate()

  const isMatchLive = match.status === MatchStatusEnum.LIVE || match.status === 2
  // BLV đang stream → "Stream" (bất kể status trận)
  const isStream = !!match.anchor
  // Trận live nhưng không có BLV → "LIVE"
  const isLive = isMatchLive && !isStream

  const isUpcoming =
    match.status === MatchStatusEnum.UPCOMING ||
    match.status === MatchStatusEnum.UNKNOWN ||
    match.state === MatchFootballStateEnum.NOT_STARTED

  const isFinished =
    match.status === MatchStatusEnum.FINISHED || match.state === MatchFootballStateEnum.END

  const halfLabel = MATCH_HALF_LABEL[match.state as MatchFootballStateEnum] ?? "LIVE"
  const periodI18nKey = MATCH_HALF_LABEL_I18N_KEY[halfLabel]
  const periodLabel = periodI18nKey ? t(periodI18nKey as Parameters<typeof t>[0]) : halfLabel

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
      {/* ── Background: thumbnail toàn card ── */}
      {match.liveImage ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${match.liveImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          />
          <div className="card-thumbnail-overlay pointer-events-none absolute inset-0 z-[1]" />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/15" />
          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-black/25 to-black/75" />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${imgStadiumBg.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
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
          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-black/40 to-black/90" />
        </>
      )}

      {/* ── Content overlay ── */}
      <div className="relative z-[3] flex h-full min-h-[300px] flex-col justify-between gap-2 p-3.5 max-md:gap-1.5 max-md:p-2.5 max-sm:gap-1.5 max-sm:p-2">
        {/* Row 1: LIVE | HD + viewers */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 max-md:gap-1 max-sm:gap-1">
            {(isStream || isLive) && (
              <>
                <div className="relative flex items-center gap-1.5 overflow-visible">
                  <div className="pointer-events-none absolute inset-0 -z-10 scale-150 animate-pulse rounded-full bg-red-600/40 blur-md" />
                  <div className="rounded-6 shadow-live-red relative flex h-[30px] items-center gap-1.5 bg-red-600 px-2.5 max-md:h-6 max-md:gap-1 max-md:px-2 max-sm:h-5 max-sm:gap-1 max-sm:px-2">
                    <span className="relative flex size-2.5 shrink-0 max-md:size-2 max-sm:size-2">
                      <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"
                        style={{ animationDuration: "0.8s" }}
                      />
                      <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40"
                        style={{ animationDuration: "1.2s", animationDelay: "0.2s" }}
                      />
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
                  <div className="rounded-4 border-gold/50 bg-gold/20 flex h-[30px] items-center border px-1.5 shadow-[0_0_12px_rgba(245,197,24,0.5),0_2px_8px_rgba(0,0,0,0.6)] backdrop-blur-sm max-md:h-6 max-sm:h-6">
                    <Typography
                      variant="label"
                      weight="700"
                      className="text-gold drop-shadow-gold max-sm:text-10"
                    >
                      {formatFootballGameTime(match.gameTime)}
                      <span className="animate-blink">&apos;</span>
                    </Typography>
                  </div>
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
            {(match.onlineNum ?? 0) > 0 && (
              <div className="rounded-6 flex h-[30px] items-center gap-1 border border-white/20 bg-black/60 px-2 shadow-[0_2px_12px_rgba(0,0,0,0.7),0_0_6px_rgba(255,255,255,0.05)] backdrop-blur-md max-md:h-6 max-md:px-1.5 max-sm:h-5 max-sm:px-1">
                <Users className="size-3.5 text-white/80 max-sm:size-2.5" />
                <Typography
                  size="14"
                  weight="500"
                  className="max-sm:!text-10 leading-none text-white tabular-nums"
                >
                  {formatViewers(match.onlineNum)}
                </Typography>
              </div>
            )}
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
                {/* TODO: <MatchStatusBadge type="live" label={periodLabel} /> */}
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
        {!isUpcoming && (
          <div className="rounded-8 flex items-center justify-between bg-white/10 px-2 py-1.5 [will-change:transform] backdrop-blur-[80px] max-sm:px-1 max-sm:py-0.5">
            {[
              {
                icon: icYellowCardV2,
                alt: "yellow",
                home: match.homeYellowCard ?? 0,
                away: match.awayYellowCard ?? 0,
                labelKey: "match.card.stats.yellow-card",
              },
              {
                icon: icRedCardV2,
                alt: "red",
                home: match.homeRedCard ?? 0,
                away: match.awayRedCard ?? 0,
                labelKey: "match.card.stats.red-card",
              },
              {
                icon: icCornerFlag,
                alt: "corner",
                home: match.homeCornerKick ?? 0,
                away: match.awayCornerKick ?? 0,
                labelKey: "match.card.stats.corner",
              },
            ].map((s, i) => (
              <div key={s.alt} className="flex flex-1 items-center">
                {i > 0 && <div className="h-4 w-px shrink-0 bg-white/20 max-sm:h-2.5" />}
                <StatItem
                  icon={s.icon}
                  alt={s.alt}
                  home={s.home}
                  away={s.away}
                  label={t(s.labelKey as Parameters<typeof t>[0])}
                />
              </div>
            ))}
          </div>
        )}

        {/* Row 5: League + time */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden max-md:gap-1 max-sm:gap-1">
            {match.leagueLogo ? (
              <Img
                src={match.leagueLogo}
                alt=""
                width={16}
                height={16}
                objectFit="contain"
                className="shrink-0 max-md:!size-3 max-sm:!size-3"
              />
            ) : (
              <Trophy className="text-gold size-3.5 shrink-0 max-sm:size-3" />
            )}
            <Tooltip>
              <TooltipTrigger className="block max-w-[120px] min-w-0 overflow-hidden">
                <Typography
                  as="span"
                  variant="caption"
                  weight="500"
                  className="max-md:!text-10 max-sm:!text-10 block truncate text-left text-white"
                >
                  {match.leagueName}
                </Typography>
              </TooltipTrigger>
              <TooltipContent>{match.leagueName}</TooltipContent>
            </Tooltip>
          </div>
          {match.startTime && (
            <div className="flex shrink-0 items-center gap-1 max-md:gap-0.5 max-sm:gap-0.5">
              <Calendar className="size-3 shrink-0 text-white/90 max-md:size-2.5 max-sm:size-2.5" />
              <Typography
                as="span"
                variant="caption"
                weight="500"
                className="max-md:!text-10 max-sm:!text-10 text-white/90 tabular-nums"
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

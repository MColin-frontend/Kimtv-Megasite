"use client"

import { useFakeGameMinute } from "@/hooks/use-fake-game-minute"

import { MATCH_HALF_LABEL } from "@/constants/common.constants"
import { MatchFootballStateEnum, MatchStatusEnum, MatchStatusLabelEnum } from "@/enums/match.enum"
import type { MatchInterface } from "@/models/match.models"

import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

import imgVs from "@assets/images/common/img-vs.webp"

/* ── Score badge ────────────────────────────────────────────── */
export function ScoreBadge({ match }: { match: MatchInterface }) {
  const isUpcoming =
    match.status === MatchStatusEnum.UPCOMING || match.status === MatchStatusEnum.UNKNOWN

  if (isUpcoming) {
    return (
      <div className="flex h-9 w-full items-center justify-center">
        <Img
          src={imgVs}
          alt="VS"
          width={32}
          height={32}
          objectFit="contain"
          className="[animation:scaleBreath_2s_ease-in-out_infinite]"
        />
      </div>
    )
  }

  return (
    <div className="flex h-9 w-full items-center justify-center">
      <div className="flex items-center max-md:scale-90 max-sm:scale-75">
        <Typography
          as="span"
          variant="h3"
          weight="700"
          className="text-gold tracking-0 leading-none tabular-nums"
        >
          {match.homeScore ?? 0}
        </Typography>
        <Typography variant="body" weight="500" className="text-gold/60 px-1.5 leading-100">
          :
        </Typography>
        <Typography
          as="span"
          variant="h3"
          weight="700"
          className="text-gold tracking-0 leading-none tabular-nums"
        >
          {match.awayScore ?? 0}
        </Typography>
      </div>
    </div>
  )
}

/* ── Status cell ────────────────────────────────────────────── */
export function FixtureStatus({ match }: { match: MatchInterface }) {
  const isLive = !!match.isLive || match.status === MatchStatusEnum.LIVE
  const halfLabel = MATCH_HALF_LABEL[match.state as MatchFootballStateEnum] ?? ""
  const displayMinute = useFakeGameMinute(match.gameTime, isLive)

  if (isLive) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        <span className="relative flex size-4 shrink-0 items-center justify-center">
          <span className="absolute size-full animate-ping rounded-full bg-red-500 opacity-40" />
          <span className="absolute size-2.5 rounded-full bg-red-500/30 blur-[2px]" />
          <span className="relative size-2 rounded-full bg-linear-to-br from-red-400 to-rose-600 shadow-[0_0_10px_4px_rgba(239,68,68,0.9),inset_0_1px_1px_rgba(255,255,255,0.3)]" />
        </span>
        <Typography as="span" variant="label" weight="600" color="gold">
          {halfLabel && `${halfLabel}: `}
          {displayMinute}
          <span className="animate-blink">&apos;</span>
        </Typography>
      </div>
    )
  }

  switch (match.status) {
    case MatchStatusEnum.FINISHED:
    case MatchStatusEnum.CANCELLED:
    case MatchStatusEnum.POSTPONED: {
      const STATUS_LABEL: Partial<Record<MatchStatusEnum, string>> = {
        [MatchStatusEnum.FINISHED]: MatchStatusLabelEnum.FINISHED,
        [MatchStatusEnum.CANCELLED]: MatchStatusLabelEnum.CANCELLED,
        [MatchStatusEnum.POSTPONED]: MatchStatusLabelEnum.POSTPONED,
      }
      return (
        <Typography
          as="span"
          variant="caption"
          weight="600"
          className="text-gold drop-shadow-[0_0_6px_rgba(245,197,24,0.7)] [text-shadow:0_0_8px_rgba(245,197,24,0.6),0_0_20px_rgba(245,197,24,0.25)]"
        >
          {STATUS_LABEL[match.status]}
        </Typography>
      )
    }
    default:
      return <span />
  }
}

/* ── Stat cell ──────────────────────────────────────────────── */
export function StatCell({
  home,
  away,
}: {
  home: number | null | undefined
  away: number | null | undefined
}) {
  return (
    <span className="flex items-center justify-center gap-0.5 tabular-nums">
      <Typography as="span" variant="body-sm" color="white">
        {home ?? 0}
      </Typography>
      <Typography as="span" variant="caption" color="foreground/50">
        -
      </Typography>
      <Typography as="span" variant="body-sm" color="white">
        {away ?? 0}
      </Typography>
    </span>
  )
}

/* ── HT cell ────────────────────────────────────────────────── */
export function HTCell({ match }: { match: MatchInterface }) {
  const { homeFirstHalfScore: h, awayFirstHalfScore: a } = match
  if (h == null || a == null)
    return (
      <Typography as="span" variant="body-sm" color="foreground/25" className="text-center">
        —
      </Typography>
    )
  return (
    <span className="flex items-center justify-center gap-0.5 tabular-nums">
      <Typography as="span" variant="body-sm" weight="500" color="foreground/55">
        {h}
      </Typography>
      <Typography as="span" variant="caption" color="foreground/30">
        -
      </Typography>
      <Typography as="span" variant="body-sm" weight="500" color="foreground/55">
        {a}
      </Typography>
    </span>
  )
}

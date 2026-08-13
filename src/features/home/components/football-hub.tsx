import { Crown, Shield, Star, Trophy } from "lucide-react"

import { cn } from "@/lib/utils"

import { getTranslation } from "@/i18n/get-locale"
import {
  DEFAULT_BADGE,
  formatMarketValue,
  MEDAL_BADGE,
  PLAYER_RANK_CONFIG,
  POSITION_STYLE,
  RANK_BADGE_CFG,
  TEAM_FORM_STYLE,
} from "@/constants/component/home.constants"

import { RankedList } from "@/components/shared/ranked-list"
import { Empty } from "@/components/ui/empty"
import { Img } from "@/components/ui/image"
import { ScheduleHeader } from "@/components/ui/match/parts/schedule-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import imgFootballHub from "@assets/images/common/img-football-hub.png"

import { fetchFootballHubAction } from "../home.api"
import type { HotLeagueInterface, HotTeamInterface, PlayerStatInterface } from "../home.models"

/* ── Row components ─────────────────────────────────────────── */

function LeagueRow({
  item,
  rank,
  upcomingLabel,
  matchUnit,
}: {
  item: HotLeagueInterface
  rank: number
  upcomingLabel: string
  matchUnit: string
}) {
  const badge = MEDAL_BADGE[rank] ?? DEFAULT_BADGE

  return (
    <div className="rounded-8 group flex min-w-0 overflow-hidden border border-white/[0.06] bg-white/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.07] hover:shadow-[0_8px_24px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)]">
      {/* Rank badge — parallelogram */}
      <div
        className="relative flex w-11 shrink-0 items-center justify-center self-stretch pr-1 max-sm:w-9"
        style={{
          background: badge.bg,
          clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
          boxShadow: badge.shadow,
        }}
      >
        <span className="text-16 font-800 max-sm:text-14 leading-none text-white select-none [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
          {rank}
        </span>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 max-sm:px-2 max-sm:py-1">
        <Img
          src={item.logo}
          alt={item.name}
          width={40}
          height={40}
          objectFit="contain"
          className="shrink-0"
        />

        <div className="min-w-0 flex-1 overflow-hidden">
          <Tooltip>
            <TooltipTrigger className="w-fit max-w-full cursor-default text-left">
              <span className="text-14 font-500 max-sm:text-12 block truncate leading-none text-white/85">
                {item.name}
              </span>
            </TooltipTrigger>
            <TooltipContent>{item.name}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {item.matchCount > 0 && (
            <Typography
              as="span"
              variant="caption"
              weight="600"
              className="text-white/45 tabular-nums"
            >
              <span className="text-gold font-700">{item.matchCount}</span> {matchUnit}
            </Typography>
          )}
          {item.liveCount > 0 ? (
            <span className="rounded-4 flex items-center gap-1 bg-red-600/90 px-1.5 py-0.5">
              <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-white" />
              <span className="text-10 font-700 tracking-wide text-white uppercase">
                LIVE · {item.liveCount}
              </span>
            </span>
          ) : (
            <span className="rounded-4 bg-gold/15 text-10 font-600 text-gold ring-gold/30 inline-flex items-center px-1.5 py-0.5 ring-1">
              {upcomingLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function TeamRow({
  item,
  formLabels,
  heatUnit,
}: {
  item: HotTeamInterface
  formLabels: Record<string, string>
  heatUnit: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 px-2 py-2">
      <Img
        src={item.logo}
        alt={item.name}
        width={40}
        height={40}
        objectFit="contain"
        className="shrink-0"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Tooltip>
          <TooltipTrigger className="w-fit max-w-full cursor-default text-left">
            <Typography variant="body-sm" weight="600" className="block truncate text-white/90">
              {item.name}
            </Typography>
          </TooltipTrigger>
          <TooltipContent>{item.name}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger className="w-fit max-w-full cursor-default text-left">
            <Typography variant="caption" className="block truncate text-white/65">
              {item.leagueName}
            </Typography>
          </TooltipTrigger>
          <TooltipContent>{item.leagueName}</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <div className="flex items-center gap-0.5">
          {item.form.map((result, i) => (
            <Tooltip key={i}>
              <TooltipTrigger>
                <span
                  className={cn(
                    "rounded-4 text-10 font-700 inline-flex size-5 cursor-default items-center justify-center",
                    TEAM_FORM_STYLE[result] ?? "bg-white/10 text-white/40"
                  )}
                >
                  {result}
                </span>
              </TooltipTrigger>
              <TooltipContent>{formLabels[result] ?? result}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        <Typography variant="caption" weight="600" className="text-white/45 tabular-nums">
          <span className="text-gold font-700">{item.heat}</span> {heatUnit}
        </Typography>
      </div>
    </div>
  )
}

/* ── Player rank badge ──────────────────────────────────────── */

function LaurelWreath({ color }: { color: string }) {
  const leaves = [
    { cx: 27, cy: 20, rx: 5.5, ry: 1.8, a: -12 },
    { cx: 22, cy: 17, rx: 5.5, ry: 1.8, a: -28 },
    { cx: 17, cy: 15, rx: 5.2, ry: 1.7, a: -44 },
    { cx: 12, cy: 14, rx: 4.8, ry: 1.6, a: -58 },
    { cx: 8, cy: 14, rx: 4.3, ry: 1.5, a: -70 },
    { cx: 4, cy: 15, rx: 3.8, ry: 1.3, a: -80 },
  ]
  return (
    <svg width="58" height="24" viewBox="0 0 58 24" fill="none">
      {leaves.map((l, i) => (
        <ellipse
          key={`l${i}`}
          cx={l.cx}
          cy={l.cy}
          rx={l.rx}
          ry={l.ry}
          transform={`rotate(${l.a} ${l.cx} ${l.cy})`}
          fill={color}
          opacity={0.95 - i * 0.07}
        />
      ))}
      {leaves.map((l, i) => (
        <ellipse
          key={`r${i}`}
          cx={58 - l.cx}
          cy={l.cy}
          rx={l.rx}
          ry={l.ry}
          transform={`rotate(${-l.a} ${58 - l.cx} ${l.cy})`}
          fill={color}
          opacity={0.95 - i * 0.07}
        />
      ))}
      <circle cx="29" cy="22" r="1.5" fill={color} opacity="0.6" />
    </svg>
  )
}

function PlayerRankBadge({ rank }: { rank: number }) {
  const cfg = RANK_BADGE_CFG[rank]
  if (!cfg) {
    return (
      <div className="rounded-8 flex h-16 w-11 shrink-0 items-center justify-center border border-white/[0.06] bg-white/[0.03]">
        <span className="text-18 font-700 leading-none text-white tabular-nums">{rank}</span>
      </div>
    )
  }
  return (
    <div
      className={cn(
        "rounded-8 relative flex h-16 w-11 shrink-0 flex-col items-center justify-start gap-0.5 overflow-hidden border pt-1.5",
        cfg.bg,
        cfg.border
      )}
    >
      <Crown size={13} className={cfg.crown} fill="currentColor" />
      <span className={cn("text-24 font-800 leading-none tabular-nums", cfg.text)}>{rank}</span>
      <div className="absolute bottom-0">
        <LaurelWreath color={cfg.laurel} />
      </div>
    </div>
  )
}

function PlayerRow({ item, rank }: { item: PlayerStatInterface; rank: number }) {
  const pos = item.position?.toUpperCase()
  const posStyle = pos ? (POSITION_STYLE[pos] ?? "bg-white/10 text-white/50 border-white/15") : null
  const rankCfg = PLAYER_RANK_CONFIG[rank]
  const displayName = item.name || item.abbr
  const teamDisplay = item.teamName || item.teamAbbr
  const mv = item.marketValue ?? item.value ?? (item.integral > 0 ? item.integral : 0)
  const currency = item.marketValueCurrency ?? "€"

  return (
    <div className="rounded-8 flex min-w-0 items-center gap-3 bg-white/[0.04] px-2 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:shadow-[0_8px_24px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)]">
      {/* Rank badge */}
      <PlayerRankBadge rank={rank} />

      {/* Avatar */}
      <Img
        src={item.logo}
        alt={displayName}
        width={52}
        height={52}
        rounded="full"
        objectFit="cover"
        className={cn(
          "shrink-0 ring-2",
          rankCfg ? rankCfg.border : "ring-white/10",
          rankCfg?.shadow
        )}
      />

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
        <Tooltip>
          <TooltipTrigger className="w-fit max-w-full cursor-default text-left">
            <Typography
              variant="body-sm"
              weight="700"
              className="min-w-0 truncate leading-tight text-white"
            >
              {displayName}
            </Typography>
          </TooltipTrigger>
          <TooltipContent>{displayName}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger className="w-fit max-w-full cursor-default text-left">
            <Typography variant="caption" className="mt-0.5 block truncate text-white/80">
              {teamDisplay}
            </Typography>
          </TooltipTrigger>
          <TooltipContent>{teamDisplay}</TooltipContent>
        </Tooltip>
      </div>

      {/* Right: value + stats */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        {mv > 0 && (
          <Typography size="16" weight="800" className="text-gold leading-none tabular-nums">
            {formatMarketValue(mv, currency)}
          </Typography>
        )}
        <div className="flex items-center gap-1.5">
          {posStyle && (
            <Tooltip>
              <TooltipTrigger>
                <span
                  className={cn(
                    "rounded-4 text-10 font-700 cursor-default border px-1 py-px leading-none uppercase",
                    posStyle
                  )}
                >
                  {item.position}
                </span>
              </TooltipTrigger>
              <TooltipContent>{item.position}</TooltipContent>
            </Tooltip>
          )}
          {item.age && (
            <>
              <Tooltip>
                <TooltipTrigger>
                  <Typography
                    variant="caption"
                    className="cursor-default text-white/80 tabular-nums"
                  >
                    {item.age} YRS
                  </Typography>
                </TooltipTrigger>
                <TooltipContent>Tuổi</TooltipContent>
              </Tooltip>
              <span className="text-12 leading-none text-white/20">|</span>
            </>
          )}
          {item.height && (
            <>
              <Tooltip>
                <TooltipTrigger>
                  <Typography
                    variant="caption"
                    className="cursor-default text-white/80 tabular-nums"
                  >
                    {item.height} CM
                  </Typography>
                </TooltipTrigger>
                <TooltipContent>Chiều cao</TooltipContent>
              </Tooltip>
              {item.number != null && <span className="text-12 leading-none text-white/20">|</span>}
            </>
          )}
          {item.number != null && (
            <Tooltip>
              <TooltipTrigger>
                <Typography variant="caption" className="cursor-default text-white/80 tabular-nums">
                  #{item.number}
                </Typography>
              </TooltipTrigger>
              <TooltipContent>Số áo</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Standalone exports ──────────────────────────────────────── */

export { LeagueListSkeleton as HotLeaguesListSkeleton }
export { TeamListSkeleton as HotTeamsListSkeleton }

export async function HotLeaguesList() {
  const { t } = await getTranslation()
  const viewAllLabel = t("news.view-all")
  const upcomingLabel = t("home.football-hub.upcoming" as Parameters<typeof t>[0])
  const matchUnit = t("home.football-hub.match-unit" as Parameters<typeof t>[0])
  const hubData = await fetchFootballHubAction(10)
  const leagues = hubData?.leagues ?? []

  return (
    <RankedList
      className="min-h-[400px] max-xl:min-h-0"
      title={
        <span className="flex flex-col">
          <span>
            <Typography as="span" variant="h3" weight="800" className="leading-none">
              {t("home.football-hub.top10" as Parameters<typeof t>[0])}
            </Typography>
            <Typography
              as="span"
              variant="h3"
              weight="800"
              className="text-gold drop-shadow-gold leading-none"
            >
              {" "}
              {t("home.football-hub.leagues" as Parameters<typeof t>[0])}
            </Typography>
          </span>
          <Typography variant="body-sm" className="mt-1 text-white/65 normal-case not-italic">
            {t("home.football-hub.leagues-subtitle" as Parameters<typeof t>[0])}
          </Typography>
          <span className="flex items-center gap-2">
            <span className="h-px flex-1 bg-white/50" />
            <Trophy size={11} className="fill-gold text-gold shrink-0" />
            <span className="h-px flex-1 bg-white/50" />
          </span>
        </span>
      }
      titleClassName="leading-none"
      viewAllLabel={viewAllLabel}
      items={leagues}
      emptyNode={
        <Empty
          tip={t("home.football-hub.empty-leagues" as Parameters<typeof t>[0])}
          className="py-0"
        />
      }
      hideRankBadge
      keyExtractor={(item) => String(item.leagueId)}
      renderItem={(item, index) => (
        <LeagueRow
          item={item}
          rank={index + 1}
          upcomingLabel={upcomingLabel}
          matchUnit={matchUnit}
        />
      )}
    />
  )
}

export async function HotTeamsList() {
  const { t } = await getTranslation()
  const viewAllLabel = t("news.view-all")
  const heatUnit = t("home.football-hub.heat-unit" as Parameters<typeof t>[0])
  const formLabels: Record<string, string> = {
    W: t("home.football-hub.form-win" as Parameters<typeof t>[0]),
    L: t("home.football-hub.form-lose" as Parameters<typeof t>[0]),
    D: t("home.football-hub.form-draw" as Parameters<typeof t>[0]),
  }
  const hubData = await fetchFootballHubAction(10)
  const teams = hubData?.teams ?? []

  return (
    <RankedList
      className="min-h-[400px] max-xl:min-h-0"
      title={
        <span className="flex flex-col">
          <span>
            <Typography as="span" variant="h3" weight="800" className="leading-none">
              {t("home.football-hub.top10" as Parameters<typeof t>[0])}
            </Typography>
            <Typography
              as="span"
              variant="h3"
              weight="800"
              className="text-gold drop-shadow-gold leading-none"
            >
              {" "}
              {t("home.football-hub.teams" as Parameters<typeof t>[0])}
            </Typography>
          </span>
          <Typography variant="body-sm" className="mt-1 text-white/65 normal-case not-italic">
            {t("home.football-hub.teams-subtitle" as Parameters<typeof t>[0])}
          </Typography>
          <span className="flex items-center gap-2">
            <span className="h-px flex-1 bg-white/50" />
            <Shield size={11} className="fill-gold text-gold shrink-0" />
            <span className="h-px flex-1 bg-white/50" />
          </span>
        </span>
      }
      titleClassName="leading-none"
      viewAllLabel={viewAllLabel}
      items={teams}
      emptyNode={
        <Empty
          tip={t("home.football-hub.empty-teams" as Parameters<typeof t>[0])}
          className="py-0"
        />
      }
      keyExtractor={(item) => String(item.teamId)}
      renderItem={(item) => <TeamRow item={item} formLabels={formLabels} heatUnit={heatUnit} />}
    />
  )
}

/* ── Skeleton ───────────────────────────────────────────────── */

function CardTitleSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 pb-1">
      <Skeleton className="rounded-4 h-7 w-36 bg-white/10" />
      <Skeleton className="rounded-4 h-3 w-44 bg-white/[0.06]" />
      <div className="flex items-center gap-2 pt-0.5">
        <Skeleton className="h-px flex-1 bg-white/10" />
        <Skeleton className="size-2.5 rounded-full bg-white/[0.06]" />
        <Skeleton className="h-px flex-1 bg-white/10" />
      </div>
    </div>
  )
}

function LeagueListSkeleton() {
  return (
    <div className="card-glow rounded-12 flex min-h-[400px] flex-col gap-3 p-4 max-xl:min-h-0 max-sm:gap-2 max-sm:p-3">
      <div className="flex items-center justify-between">
        <CardTitleSkeleton />
        <Skeleton className="rounded-4 h-3 w-12 bg-white/[0.06]" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="rounded-8 flex overflow-hidden border border-white/[0.05] bg-white/[0.04]"
          >
            <Skeleton
              className="w-11 shrink-0 bg-white/[0.08]"
              style={{ clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)" }}
            />
            <div className="flex flex-1 items-center gap-2 px-2.5 py-2">
              <Skeleton className="rounded-6 size-10 shrink-0 bg-white/10" />
              <Skeleton className="rounded-4 h-3.5 flex-1 bg-white/[0.06]" />
              <Skeleton className="rounded-4 h-5 w-16 bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamListSkeleton() {
  return (
    <div className="card-glow rounded-12 flex min-h-[400px] flex-col gap-3 p-4 max-xl:min-h-0 max-sm:gap-2 max-sm:p-3">
      <div className="flex items-center justify-between">
        <CardTitleSkeleton />
        <Skeleton className="rounded-4 h-3 w-12 bg-white/[0.06]" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2 max-sm:gap-2">
            <Skeleton className="rounded-4 h-4 w-6 shrink-0 bg-white/[0.06]" />
            <Skeleton className="rounded-8 size-10 shrink-0 bg-white/10" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Skeleton className="rounded-4 h-3.5 w-24 bg-white/[0.08]" />
              <Skeleton className="rounded-4 h-3 w-20 bg-white/[0.05]" />
            </div>
            <div className="flex shrink-0 gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="rounded-4 size-5 bg-white/[0.06]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlayerListSkeleton() {
  return (
    <div className="card-glow rounded-12 flex min-h-[400px] flex-col gap-3 p-4 max-xl:min-h-0 max-sm:gap-2 max-sm:p-3">
      <div className="flex items-center justify-between">
        <CardTitleSkeleton />
        <Skeleton className="rounded-4 h-3 w-12 bg-white/[0.06]" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-8 flex items-center gap-3 bg-white/[0.04] px-2 py-2">
            {/* Rank badge */}
            <Skeleton className="rounded-8 h-16 w-11 shrink-0 bg-white/[0.06]" />
            {/* Avatar */}
            <Skeleton className="size-[52px] shrink-0 rounded-full bg-white/10" />
            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="rounded-4 h-3.5 w-28 bg-white/[0.08]" />
              <Skeleton className="rounded-4 h-3 w-20 bg-white/[0.05]" />
            </div>
            {/* Right: value + stats */}
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Skeleton className="rounded-4 h-4 w-14 bg-white/[0.08]" />
              <div className="flex items-center gap-1">
                <Skeleton className="rounded-4 h-4 w-6 bg-white/[0.06]" />
                <Skeleton className="rounded-4 h-3 w-10 bg-white/[0.05]" />
                <Skeleton className="rounded-4 h-3 w-10 bg-white/[0.05]" />
                <Skeleton className="rounded-4 h-3 w-6 bg-white/[0.05]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FootballHubSkeleton() {
  return (
    <div className="rounded-12 card-glow flex h-full flex-col gap-4 p-5 max-xl:gap-3 max-xl:p-4 max-sm:gap-2 max-sm:p-3">
      <div className="relative flex items-center gap-4">
        <Skeleton className="size-20 rounded-full bg-white/10 max-sm:size-16" />
        <div className="flex flex-col gap-2">
          <Skeleton className="rounded-6 h-6 w-40 bg-white/10" />
          <Skeleton className="rounded-4 h-3.5 w-28 bg-white/[0.06]" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        <LeagueListSkeleton />
        <TeamListSkeleton />
        <PlayerListSkeleton />
      </div>
    </div>
  )
}

/* ── FootballHub ─────────────────────────────────────────────── */

export async function FootballHub() {
  const { t } = await getTranslation()
  const viewAllLabel = t("news.view-all")
  const upcomingLabel = t("home.football-hub.upcoming" as Parameters<typeof t>[0])
  const matchUnit = t("home.football-hub.match-unit" as Parameters<typeof t>[0])
  const heatUnit = t("home.football-hub.heat-unit" as Parameters<typeof t>[0])
  const formLabels: Record<string, string> = {
    W: t("home.football-hub.form-win" as Parameters<typeof t>[0]),
    L: t("home.football-hub.form-lose" as Parameters<typeof t>[0]),
    D: t("home.football-hub.form-draw" as Parameters<typeof t>[0]),
  }

  const hubData = await fetchFootballHubAction(10)

  const leagues = hubData?.leagues ?? []
  const teams = hubData?.teams ?? []
  const players = hubData?.players ?? []

  return (
    <div className="rounded-12 card-glow flex h-full flex-col gap-4 p-5 max-xl:gap-3 max-xl:p-4 max-sm:gap-2 max-sm:p-3">
      <ScheduleHeader
        image={imgFootballHub}
        title={t("home.football-hub.title" as Parameters<typeof t>[0])}
        subtitle={t("home.football-hub.subtitle" as Parameters<typeof t>[0])}
      />

      <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        <RankedList
          className="min-h-[400px] max-xl:min-h-0"
          title={
            <span className="flex flex-col">
              <span>
                <Typography as="span" variant="h3" weight="800" className="leading-none">
                  {t("home.football-hub.top10" as Parameters<typeof t>[0])}
                </Typography>
                <Typography
                  as="span"
                  variant="h3"
                  weight="800"
                  className="text-gold drop-shadow-gold leading-none"
                >
                  {" "}
                  {t("home.football-hub.leagues" as Parameters<typeof t>[0])}
                </Typography>
              </span>
              <Typography variant="body-sm" className="mt-1 text-white/65 normal-case not-italic">
                {t("home.football-hub.leagues-subtitle" as Parameters<typeof t>[0])}
              </Typography>
              <span className="flex items-center gap-2">
                <span className="h-px flex-1 bg-white/50" />
                <Trophy size={11} className="fill-gold text-gold shrink-0" />
                <span className="h-px flex-1 bg-white/50" />
              </span>
            </span>
          }
          titleClassName="leading-none"
          viewAllLabel={viewAllLabel}
          items={leagues}

          emptyNode={
            <Empty
              tip={t("home.football-hub.empty-leagues" as Parameters<typeof t>[0])}
              className="py-0"
            />
          }
          hideRankBadge
          keyExtractor={(item) => String(item.leagueId)}
          renderItem={(item, index) => (
            <LeagueRow
              item={item}
              rank={index + 1}
              upcomingLabel={upcomingLabel}
              matchUnit={matchUnit}
            />
          )}
        />

        <RankedList
          className="min-h-[400px] max-xl:min-h-0"
          title={
            <span className="flex flex-col">
              <span>
                <Typography as="span" variant="h3" weight="800" className="leading-none">
                  {t("home.football-hub.top10" as Parameters<typeof t>[0])}
                </Typography>
                <Typography
                  as="span"
                  variant="h3"
                  weight="800"
                  className="text-gold drop-shadow-gold leading-none"
                >
                  {" "}
                  {t("home.football-hub.teams" as Parameters<typeof t>[0])}
                </Typography>
              </span>
              <Typography variant="body-sm" className="mt-1 text-white/65 normal-case not-italic">
                {t("home.football-hub.teams-subtitle" as Parameters<typeof t>[0])}
              </Typography>
              <span className="flex items-center gap-2">
                <span className="h-px flex-1 bg-white/50" />
                <Shield size={11} className="fill-gold text-gold shrink-0" />
                <span className="h-px flex-1 bg-white/50" />
              </span>
            </span>
          }
          titleClassName="leading-none"
          viewAllLabel={viewAllLabel}
          items={teams}
          emptyNode={
            <Empty
              tip={t("home.football-hub.empty-teams" as Parameters<typeof t>[0])}
              className="py-0"
            />
          }
          keyExtractor={(item) => String(item.teamId)}
          renderItem={(item) => <TeamRow item={item} formLabels={formLabels} heatUnit={heatUnit} />}
        />

        <RankedList
          className="min-h-[400px] max-xl:min-h-0"
          title={
            <span className="flex flex-col">
              <span>
                <Typography as="span" variant="h3" weight="800" className="leading-none">
                  {t("home.football-hub.top10" as Parameters<typeof t>[0])}
                </Typography>
                <Typography
                  as="span"
                  variant="h3"
                  weight="800"
                  className="text-gold drop-shadow-gold leading-none"
                >
                  {" "}
                  {t("home.football-hub.players" as Parameters<typeof t>[0])}
                </Typography>
              </span>
              <Typography variant="body-sm" className="mt-1 text-white/65 normal-case not-italic">
                {t("home.football-hub.players-subtitle" as Parameters<typeof t>[0])}
              </Typography>
              <span className="flex items-center gap-2">
                <span className="h-px flex-1 bg-white/50" />
                <Star size={11} className="fill-gold text-gold shrink-0" />
                <span className="h-px flex-1 bg-white/50" />
              </span>
            </span>
          }
          titleClassName="leading-none"
          viewAllLabel={viewAllLabel}
          items={players}
          emptyNode={
            <Empty
              tip={t("home.football-hub.empty-players" as Parameters<typeof t>[0])}
              className="py-0"
            />
          }
          hideRankBadge
          keyExtractor={(item) => String(item.playerId)}
          renderItem={(item, index) => <PlayerRow item={item} rank={index + 1} />}
        />
      </div>
    </div>
  )
}

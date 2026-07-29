"use client"

import type { ReactNode } from "react"
import { isEmpty } from "lodash"

import { formatKickOff, formatMatchDate } from "@/lib/date"
import { cn } from "@/lib/utils"
import { useLiveNavigate } from "@/hooks/use-live-navigate"

import { useTranslation } from "@/i18n/use-translation"
import { MatchStatusEnum } from "@/enums/match.enum"
import type { MatchInterface } from "@/models/match.models"

import { Img } from "@/components/ui/image"
import { Pagination } from "@/components/ui/pagination"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import icCornerKick from "@assets/icons/match/ic-corner-flag.svg"
import icRedCard from "@assets/icons/match/ic-red-card-v2.svg"
import icYellowCard from "@assets/icons/match/ic-yellow-card-v2.svg"
import imgEmpty from "@assets/images/common/img-empty.png"

import { ScoreBadge, StatCell } from "./parts/match-fixture-cells"
import { FIXTURE_ROW_CLASS, FixtureListSkeleton } from "./skeleton"

export interface ExtraColumnInterface {
  header: ReactNode
  render: (match: MatchInterface) => ReactNode
  width?: string
}

export { FIXTURE_ROW_CLASS, FixtureListSkeleton }

export interface MatchGroupInterface {
  key: string
  leagueName: string | null
  leagueLogo: string | null
  matches: MatchInterface[]
}

export function groupMatches(matches: MatchInterface[]): MatchGroupInterface[] {
  if (!Array.isArray(matches)) return []
  const map = new Map<string, MatchGroupInterface>()
  for (const match of matches) {
    const key = match.seriesId && match.seriesId > 0 ? `s:${match.seriesId}` : `l:${match.leagueId}`
    if (!map.has(key)) {
      map.set(key, {
        key,
        leagueName: match.leagueName,
        leagueLogo: match.leagueLogo,
        matches: [],
      })
    }
    map.get(key)!.matches.push(match)
  }
  return Array.from(map.values())
}

export function FixtureRow({
  match,
  onSelect,
  extraColumn,
}: {
  match: MatchInterface
  onSelect?: (match: MatchInterface) => void
  extraColumn?: ExtraColumnInterface
}) {
  const navigateToLive = useLiveNavigate()

  const isStarted =
    match.status === MatchStatusEnum.LIVE || match.status === MatchStatusEnum.FINISHED

  const isLive = match.status === MatchStatusEnum.LIVE

  function handleClick() {
    if (onSelect) {
      onSelect(match)
    } else if (isLive) {
      navigateToLive(match.matchId, match.gameId)
    }
  }

  return (
    <>
      {/* Desktop */}
      <div
        onClick={handleClick}
        className={cn(
          extraColumn ? FIXTURE_ROW_CLASS + ` ${extraColumn.width ?? "auto"}` : FIXTURE_ROW_CLASS,
          "rounded-10 fixture-row-bg border-white-linear mb-1.5 py-3 last:mb-0",
          "transition-all duration-200 hover:bg-white/[0.04] max-lg:hidden",
          onSelect || isLive
            ? "cursor-pointer hover:bg-white/[0.08] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
            : "cursor-default"
        )}
        style={
          extraColumn
            ? {
                gridTemplateColumns: `8rem 1fr 4.5rem 5rem 3rem 3rem 3rem ${extraColumn.width ?? "5rem"}`,
              }
            : undefined
        }
      >
        <Tooltip>
          <TooltipTrigger className="flex min-w-0 items-center gap-2 text-left">
            {match.leagueLogo && (
              <Img src={match.leagueLogo} alt="" width={36} height={36} objectFit="contain" />
            )}
            <Typography variant="body-sm" weight="500" color="white" className="line-clamp-2">
              {match.leagueName}
            </Typography>
          </TooltipTrigger>
          <TooltipContent>{match.leagueName}</TooltipContent>
        </Tooltip>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {match.homeLogo && (
              <Img
                src={match.homeLogo}
                alt=""
                width={30}
                height={30}
                objectFit="contain"
                className="shrink-0"
              />
            )}
            <Typography as="span" variant="label" weight="600" color="white" className="truncate">
              {match.homeName}
            </Typography>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            {match.awayLogo && (
              <Img
                src={match.awayLogo}
                alt=""
                width={30}
                height={30}
                objectFit="contain"
                className="shrink-0"
              />
            )}
            <Typography as="span" variant="label" weight="600" color="white" className="truncate">
              {match.awayName}
            </Typography>
          </div>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <Typography as="span" variant="caption" color="foreground/50" className="tabular-nums">
            {match.startTime ? formatMatchDate(match.startTime) : "—"}
          </Typography>
          <Typography
            as="span"
            variant="label"
            weight="600"
            color="foreground/80"
            className="tabular-nums"
          >
            {match.startTime ? formatKickOff(match.startTime) : "—"}
          </Typography>
        </div>

        <ScoreBadge match={match} />

        <StatCell
          home={isStarted ? match.homeCornerKick : null}
          away={isStarted ? match.awayCornerKick : null}
        />
        <StatCell
          home={isStarted ? match.homeYellowCard : null}
          away={isStarted ? match.awayYellowCard : null}
        />
        <StatCell
          home={isStarted ? match.homeRedCard : null}
          away={isStarted ? match.awayRedCard : null}
        />
        {extraColumn && (
          <div className="flex items-center justify-center">{extraColumn.render(match)}</div>
        )}
      </div>

      {/* Mobile */}
      <div
        onClick={handleClick}
        className={cn(
          "rounded-10 fixture-row-bg border-white-linear mb-1.5 px-3 py-2.5",
          "flex flex-col gap-1.5 transition-all duration-200 hover:bg-white/[0.04] lg:hidden",
          onSelect || isLive ? "cursor-pointer hover:bg-white/[0.08]" : "cursor-default"
        )}
      >
        <div className="flex items-center gap-2">
          {match.leagueLogo && (
            <Img
              src={match.leagueLogo}
              alt=""
              width={14}
              height={14}
              objectFit="contain"
              className="shrink-0"
            />
          )}
          <Typography variant="caption" color="foreground/70" className="flex-1 truncate">
            {match.leagueName}
          </Typography>
          <div className="flex flex-col items-end gap-0.5">
            <Typography variant="caption" color="foreground/70" className="tabular-nums">
              {match.startTime ? formatMatchDate(match.startTime) : "—"}
            </Typography>
            <Typography variant="caption" color="foreground/70" className="tabular-nums">
              {match.startTime ? formatKickOff(match.startTime) : "—"}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
            <Typography
              as="span"
              variant="label"
              weight="600"
              color="foreground"
              className="truncate text-right"
            >
              {match.homeName}
            </Typography>
            {match.homeLogo && (
              <Img
                src={match.homeLogo}
                alt=""
                width={20}
                height={20}
                objectFit="contain"
                className="shrink-0"
              />
            )}
          </div>
          <div className="w-20 shrink-0">
            <ScoreBadge match={match} />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {match.awayLogo && (
              <Img
                src={match.awayLogo}
                alt=""
                width={20}
                height={20}
                objectFit="contain"
                className="shrink-0"
              />
            )}
            <Typography as="span" variant="label" weight="600" color="white" className="truncate">
              {match.awayName}
            </Typography>
          </div>
        </div>

        {extraColumn && (
          <div className="flex items-center justify-end">{extraColumn.render(match)}</div>
        )}

        {isStarted && (
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              <Img src={icCornerKick} alt="" width={12} height={12} objectFit="contain" />
              <Typography
                as="span"
                variant="caption"
                color="foreground/50"
                className="tabular-nums"
              >
                {match.homeCornerKick ?? 0}-{match.awayCornerKick ?? 0}
              </Typography>
            </div>
            <div className="flex items-center gap-1">
              <Img src={icYellowCard} alt="" width={12} height={12} objectFit="contain" />
              <Typography
                as="span"
                variant="caption"
                color="foreground/50"
                className="tabular-nums"
              >
                {match.homeYellowCard ?? 0}-{match.awayYellowCard ?? 0}
              </Typography>
            </div>
            <div className="flex items-center gap-1">
              <Img src={icRedCard} alt="" width={12} height={12} objectFit="contain" />
              <Typography
                as="span"
                variant="caption"
                color="foreground/50"
                className="tabular-nums"
              >
                {match.homeRedCard ?? 0}-{match.awayRedCard ?? 0}
              </Typography>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export function FixtureTableHeader({ extraColumn }: { extraColumn?: ExtraColumnInterface }) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(FIXTURE_ROW_CLASS, "py-3 max-lg:hidden")}
      style={
        extraColumn
          ? {
              gridTemplateColumns: `8rem 1fr 4.5rem 5rem 3rem 3rem 3rem ${extraColumn.width ?? "5rem"}`,
            }
          : undefined
      }
    >
      <Typography as="span" variant="body-sm" weight="500" color="foreground/60">
        {t("match.fixture.league")}
      </Typography>
      <Typography as="span" variant="body-sm" weight="500" color="foreground/60">
        {t("match.fixture.match")}
      </Typography>
      <Typography
        as="span"
        variant="body-sm"
        weight="500"
        color="foreground/60"
        className="text-center"
      >
        {t("match.fixture.time")}
      </Typography>
      <Typography
        as="span"
        variant="body-sm"
        weight="500"
        color="foreground/60"
        className="text-center"
      >
        {t("match.fixture.score")}
      </Typography>
      <span className="flex justify-center">
        <Img
          src={icCornerKick}
          alt={t("match.fixture.corner-kick")}
          width={16}
          height={16}
          objectFit="contain"
        />
      </span>
      <span className="flex justify-center">
        <Img
          src={icYellowCard}
          alt={t("match.fixture.yellow-card")}
          width={16}
          height={16}
          objectFit="contain"
        />
      </span>
      <span className="flex justify-center">
        <Img
          src={icRedCard}
          alt={t("match.fixture.red-card")}
          width={16}
          height={16}
          objectFit="contain"
        />
      </span>
      {extraColumn && <span className="flex justify-center">{extraColumn.header}</span>}
    </div>
  )
}

interface FixtureListProps {
  groups: MatchGroupInterface[]
  loading: boolean
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onSelect?: (match: MatchInterface) => void
  extraColumn?: ExtraColumnInterface
}

export function FixtureList({
  groups,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onSelect,
  extraColumn,
}: FixtureListProps) {
  const { t } = useTranslation()

  if (loading) return <FixtureListSkeleton />

  return (
    <div className="flex flex-col gap-3">
      {isEmpty(groups) ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Img
            src={imgEmpty.src}
            alt={t("match.fixture.empty")}
            width={120}
            height={120}
            objectFit="contain"
          />
          <Typography variant="body-sm" color="foreground/40">
            {t("match.fixture.empty")}
          </Typography>
        </div>
      ) : (
        <div className="rounded-12 w-full overflow-hidden">
          <FixtureTableHeader extraColumn={extraColumn} />
          {groups.map((group) => (
            <div key={group.key}>
              {group.matches.map((match) => (
                <FixtureRow
                  key={match.matchId}
                  match={match}
                  onSelect={onSelect}
                  extraColumn={extraColumn}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        className="py-3"
      />
    </div>
  )
}

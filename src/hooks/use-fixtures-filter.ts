"use client"

import { formatDateParam, parseDateParam } from "@/lib/date"
import { useRouter } from "@/hooks/useRouter"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/common.constants"
import {
  MATCH_FIXTURES_PARAMS,
  MATCH_STATUS_TAB,
  type MatchStatusTabValue,
} from "@/constants/component/home.constants"

export interface FixtureFilterStateInterface {
  pickedDate: Date
  status: MatchStatusTabValue
  leagueIds: number[]
  page: number
  pageSize: number
}

export function useFixturesFilter(): FixtureFilterStateInterface & {
  setPickedDate: (date: Date | null) => void
  setStatus: (val: MatchStatusTabValue) => void
  setLeagueIds: (ids: number[]) => void
  setPage: (p: number) => void
} {
  const { getParam, setParams } = useRouter()

  const pickedDate = parseDateParam(getParam(MATCH_FIXTURES_PARAMS.PICKED_DATE)) ?? new Date()
  const status = (getParam(MATCH_FIXTURES_PARAMS.STATUS) ??
    MATCH_STATUS_TAB.ALL) as MatchStatusTabValue
  const leagueIds = (getParam(MATCH_FIXTURES_PARAMS.LEAGUES) ?? "")
    .split(",")
    .filter(Boolean)
    .map(Number)
  const page = Number(getParam(MATCH_FIXTURES_PARAMS.PAGE) ?? String(DEFAULT_PAGE))
  const pageSize = Number(getParam(MATCH_FIXTURES_PARAMS.PAGE_SIZE) ?? String(DEFAULT_PAGE_SIZE))

  const setPickedDate = (date: Date | null) =>
    setParams(
      { [MATCH_FIXTURES_PARAMS.PICKED_DATE]: date ? formatDateParam(date) : null },
      { scroll: false }
    )

  const setStatus = (val: MatchStatusTabValue) => {
    const isLive = val === MATCH_STATUS_TAB.LIVE
    const isFinished = val === MATCH_STATUS_TAB.FINISHED
    setParams(
      {
        [MATCH_FIXTURES_PARAMS.STATUS]: val === MATCH_STATUS_TAB.ALL ? null : val,
        ...(isLive || (isFinished && pickedDate > new Date())
          ? { [MATCH_FIXTURES_PARAMS.PICKED_DATE]: null }
          : {}),
        [MATCH_FIXTURES_PARAMS.PAGE]: null,
      },
      { scroll: false }
    )
  }

  const setLeagueIds = (ids: number[]) =>
    setParams(
      {
        [MATCH_FIXTURES_PARAMS.LEAGUES]: ids.length ? ids.join(",") : null,
        [MATCH_FIXTURES_PARAMS.PAGE]: null,
      },
      { scroll: false }
    )

  const setPage = (p: number) =>
    setParams(
      { [MATCH_FIXTURES_PARAMS.PAGE]: p === DEFAULT_PAGE ? null : String(p) },
      { scroll: false }
    )

  return {
    pickedDate,
    status,
    leagueIds,
    page,
    pageSize,
    setPickedDate,
    setStatus,
    setLeagueIds,
    setPage,
  }
}

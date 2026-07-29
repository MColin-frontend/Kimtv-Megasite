import {
  FOOTBALL_GAME_ID,
  MATCH_STATUS_TAB,
  type MatchStatusTabValue,
} from "@/constants/component/home.constants"

import type { ApiConfig } from "@/features/home/home.models"

export const MATCH_API = {
  LIVE: "/v2/match/get-pc-game-match-by-condition",
  LIVE_SEARCH: "/v3/search/game-match-live",
  LIST: "/sports-match-h5/list",
} as const

export const LIVE_MATCH_TYPE = {
  LIVE: "live",
  UPCOMING: "upcoming",
  FINISHED: "finished",
} as const

export type MatchStatusType = (typeof LIVE_MATCH_TYPE)[keyof typeof LIVE_MATCH_TYPE]

export const HTTP_METHOD = {
  GET: "GET",
  POST: "POST",
} as const

export const MATCH_QUERY_PARAMS = {
  ALL_GAMES: { gameId: [] },
} as const

const H5_OPTION: Partial<Record<MatchStatusTabValue, number>> = {
  [MATCH_STATUS_TAB.ALL]: 1,
  [MATCH_STATUS_TAB.UPCOMING]: 1,
  [MATCH_STATUS_TAB.FINISHED]: 2,
}

export function buildMatchApiConfig(
  status: MatchStatusTabValue,
  pickedDateTs: number,
  leagueIds: number[] = []
): ApiConfig {
  if (status === MATCH_STATUS_TAB.LIVE) {
    return {
      endpoint: MATCH_API.LIVE,
      method: HTTP_METHOD.POST,
      params: { gameId: [] },
      paginate: false,
    }
  }

  return {
    endpoint: MATCH_API.LIST,
    method: HTTP_METHOD.POST,
    params: {
      date: pickedDateTs,
      gameId: FOOTBALL_GAME_ID,
      leagueIds: leagueIds.length > 0 ? leagueIds.join(",") : "",
      option: H5_OPTION[status] ?? 1,
      lot: null,
    },
  }
}

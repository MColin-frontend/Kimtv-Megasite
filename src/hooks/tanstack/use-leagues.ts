import { useQuery } from "@tanstack/react-query"

import { javaGet } from "@/server/services/client-request"

import { QUERY_KEYS } from "@/constants/query-keys.constants"

import type { LeagueApiResult } from "@/features/home/home.models"

const LEAGUES_API = {
  MATCH_LEAGUES: "/league/v2/match-leagues",
} as const

const FOOTBALL_GAME_ID = 202

const EMPTY: LeagueApiResult = { hotLeagus: [], moreLeagus: [] }

export function useLeagues(gameId = FOOTBALL_GAME_ID, option = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.leagues,
    queryFn: () =>
      javaGet<LeagueApiResult>(LEAGUES_API.MATCH_LEAGUES, {
        params: { gameId, time: Math.floor(Date.now() / 1000), option },
      }).then((result) => result ?? EMPTY),
    staleTime: 5 * 60 * 1000,
  })
}

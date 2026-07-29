import { queryOptions } from "@tanstack/react-query"

import { javaGet, javaPost } from "@/server/services/client-request"
import { getRequest } from "@/server/services/request"
import { MATCH_API, MATCH_QUERY_PARAMS } from "@/lib/match.utils"

import { FOOTBALL_GAME_MONGO_ID } from "@/constants/component/home.constants"
import type { MatchInterface } from "@/models/match.models"

import type { LiveSearchMatchInterface } from "@/components/ui/match/match-card-live"

/** Server-side — cùng endpoint và params với liveScheduleQueryOptions */
export async function fetchLiveScheduleMatches(): Promise<LiveSearchMatchInterface[]> {
  const data = await getRequest<LiveSearchMatchInterface[]>(MATCH_API.LIVE_SEARCH, {
    params: { id: FOOTBALL_GAME_MONGO_ID, typeScreen: 0 },
  } as Parameters<typeof getRequest>[1]).catch(() => null)
  return Array.isArray(data) ? data : []
}

export function liveScheduleQueryOptions() {
  return queryOptions({
    queryKey: ["live-schedule-matches"],
    queryFn: () =>
      javaGet<LiveSearchMatchInterface[]>(MATCH_API.LIVE_SEARCH, {
        params: {
          id: FOOTBALL_GAME_MONGO_ID,
          typeScreen: 0,
        },
      }).then((d) => (Array.isArray(d) ? d : [])),
    staleTime: 30_000,
  })
}

/** Client-side dùng MATCH_API.LIVE (POST) → trả MatchInterface[] — dùng với MatchCard */
export function liveMatchCardQueryOptions() {
  return queryOptions({
    queryKey: ["live-match-cards"],
    queryFn: () =>
      javaPost<MatchInterface[]>(MATCH_API.LIVE, { body: MATCH_QUERY_PARAMS.ALL_GAMES }).then(
        (d) => (Array.isArray(d) ? d : [])
      ),
    staleTime: 30_000,
  })
}

export function liveMatchesGridQueryOptions(typeScreen: number) {
  return queryOptions({
    queryKey: ["live-matches-grid", typeScreen],
    queryFn: () =>
      javaGet<LiveSearchMatchInterface[]>(MATCH_API.LIVE_SEARCH, {
        params: { id: FOOTBALL_GAME_MONGO_ID, typeScreen },
      }).then((d) => d ?? []),
    staleTime: 30_000,
  })
}

import { queryOptions } from "@tanstack/react-query"

import { javaGet, javaPost } from "@/server/services/client-request"
import { getRequest } from "@/server/services/request"
import { MATCH_API, MATCH_QUERY_PARAMS } from "@/lib/match.utils"

import { KEYWORD_KEY, PAGE_INDEX_KEY, PAGE_SIZE_KEY } from "@/constants/common.constants"
import { FOOTBALL_GAME_MONGO_ID } from "@/constants/component/home.constants"
import type { LiveSearchMatchInterface, MatchInterface } from "@/models/match.models"

const LIVE_MATCHES_PAGE_SIZE = 12

interface LiveMatchesGridParams {
  typeScreen: number
  keyword?: string
  pageIndex?: number
}

interface LiveMatchesGridResult {
  records: LiveSearchMatchInterface[]
  total: number
}

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

function parseLiveMatchesGrid(d: unknown): LiveMatchesGridResult {
  if (!d) return { records: [], total: 0 }
  if (Array.isArray(d)) {
    return { records: d as LiveSearchMatchInterface[], total: d.length }
  }
  const obj = d as Record<string, unknown>
  const records = Array.isArray(obj.records) ? (obj.records as LiveSearchMatchInterface[]) : []
  const total = typeof obj.total === "number" ? obj.total : records.length
  return { records, total }
}

function fetchLiveMatchesGrid(p: LiveMatchesGridParams): Promise<LiveMatchesGridResult> {
  return javaGet<unknown>(MATCH_API.LIVE_SEARCH, {
    params: {
      id: FOOTBALL_GAME_MONGO_ID,
      typeScreen: p.typeScreen,
      [KEYWORD_KEY]: p.keyword || undefined,
      ...(p.pageIndex != null
        ? {
            [PAGE_INDEX_KEY]: p.pageIndex - 1,
            [PAGE_SIZE_KEY]: LIVE_MATCHES_PAGE_SIZE,
          }
        : {}),
    },
  }).then(parseLiveMatchesGrid)
}

export function liveMatchesGridQueryOptions(
  typeScreen: number,
  keyword?: string,
  pageIndex?: number
) {
  return queryOptions({
    queryKey: ["live-matches-grid", typeScreen, keyword, pageIndex],
    queryFn: () => fetchLiveMatchesGrid({ typeScreen, keyword, pageIndex }),
    staleTime: 30_000,
  })
}

export { LIVE_MATCHES_PAGE_SIZE }
export type { LiveMatchesGridResult }

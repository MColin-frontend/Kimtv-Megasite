import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"

import { javaGet } from "@/server/services/client-request"

import {
  KEYWORD_KEY,
  PAGE_INDEX_KEY,
  PAGE_SIZE_KEY,
  PAGE_SIZE_OPTION,
} from "@/constants/common.constants"
import type { LiveSearchMatchInterface } from "@/models/match.models"

import type { NewsPaginatedInterface } from "@/features/news/news.models"
import type { UserInfoModel } from "@/features/user-info/user-info.models"

import type {
  AnchorPaginatedResponse,
  SearchAttentionAnchorParamsInterface,
  SearchBaseParamsInterface,
  SearchGameMatchLiveParamsInterface,
  SearchGameMatchLiveResultInterface,
} from "./search.models"

export const SEARCH_PAGE_SIZE = PAGE_SIZE_OPTION[1]
export const SEARCH_NEWS_PAGE_SIZE = 13

export const SEARCH_API = {
  ALL: "/search/search-all",
  MATCHES: "/search/search-matchs",
  NEWS: "/s",
  USERS: "/search/search-users",
  ATTENTION_ANCHOR: "/search/attention-anchor",
  GAME_MATCH_LIVE: "/v3/search/game-match-live",
  SEARCH_GAME_MATCH_LIVE: "/v4/search/game-match-live",
} as const

function fetchSearchAll(p: SearchBaseParamsInterface): Promise<unknown | null> {
  return javaGet<unknown>(SEARCH_API.ALL, {
    params: {
      [KEYWORD_KEY]: p.keyword,
      [PAGE_INDEX_KEY]: p.pageIndex,
      [PAGE_SIZE_KEY]: p.pageSize,
    },
  })
}

function fetchSearchMatches(p: SearchBaseParamsInterface): Promise<unknown | null> {
  return javaGet<unknown>(SEARCH_API.MATCHES, {
    params: {
      [KEYWORD_KEY]: p.keyword,
      [PAGE_INDEX_KEY]: p.pageIndex,
      [PAGE_SIZE_KEY]: p.pageSize,
    },
  })
}

function fetchSearchNews(p: SearchBaseParamsInterface): Promise<NewsPaginatedInterface | null> {
  return javaGet<NewsPaginatedInterface>(`${SEARCH_API.NEWS}/${p.keyword}`, {
    params: {
      [KEYWORD_KEY]: p.keyword,
      [PAGE_INDEX_KEY]: p.pageIndex - 1,
      [PAGE_SIZE_KEY]: SEARCH_NEWS_PAGE_SIZE,
    },
  })
}

interface UserPaginatedResponse {
  total: number
  current: number
  pages: number
  size: number
  records: UserInfoModel[]
}

function fetchSearchUsers(p: SearchBaseParamsInterface): Promise<UserPaginatedResponse | null> {
  return javaGet<UserPaginatedResponse[] | UserPaginatedResponse>(SEARCH_API.USERS, {
    params: {
      [KEYWORD_KEY]: p.keyword,
      [PAGE_INDEX_KEY]: p.pageIndex,
      [PAGE_SIZE_KEY]: SEARCH_PAGE_SIZE,
    },
  }).then((d) => {
    if (!d) return null
    if (Array.isArray(d)) return d[0] ?? null
    return d
  })
}

function fetchAttentionAnchors(
  p?: SearchAttentionAnchorParamsInterface
): Promise<AnchorPaginatedResponse | null> {
  return javaGet<AnchorPaginatedResponse[] | AnchorPaginatedResponse>(SEARCH_API.ATTENTION_ANCHOR, {
    params: {
      [KEYWORD_KEY]: p?.keyword || undefined,
      [PAGE_INDEX_KEY]: p?.pageIndex,
      [PAGE_SIZE_KEY]: p?.pageSize,
    },
  }).then((d) => {
    if (!d) return null
    if (Array.isArray(d)) return d[0] ?? null
    return d
  })
}

function fetchGameMatchLive(
  p: SearchGameMatchLiveParamsInterface
): Promise<LiveSearchMatchInterface[] | null> {
  return javaGet<LiveSearchMatchInterface[]>(SEARCH_API.GAME_MATCH_LIVE, {
    params: { id: p.id, typeScreen: p.typeScreen },
  })
}

export function searchMatchesQueryOptions(keyword: string, pageIndex = 1) {
  return queryOptions({
    queryKey: ["search-matches", keyword, pageIndex],
    queryFn: () => fetchSearchMatches({ keyword, pageIndex }),
    staleTime: 60_000,
    enabled: !!keyword,
  })
}

export function searchNewsQueryOptions(keyword: string, pageIndex = 1) {
  return queryOptions({
    queryKey: ["search-news", keyword, pageIndex],
    queryFn: () => fetchSearchNews({ keyword, pageIndex }),
    staleTime: 60_000,
    enabled: !!keyword,
  })
}

export function searchNewsInfiniteQueryOptions(keyword: string) {
  return infiniteQueryOptions({
    queryKey: ["search-news-infinite", keyword],
    queryFn: ({ pageParam = 1 }) => fetchSearchNews({ keyword, pageIndex: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage && lastPage.records.length > 0 ? (lastPageParam as number) + 1 : undefined,
    staleTime: 60_000,
  })
}

export function searchUsersQueryOptions(keyword: string, pageIndex = 1) {
  return queryOptions({
    queryKey: ["search-users", keyword, pageIndex],
    queryFn: () => fetchSearchUsers({ keyword, pageIndex }),
    staleTime: 60_000,
    enabled: !!keyword,
  })
}

export function searchUsersInfiniteQueryOptions(keyword: string) {
  return infiniteQueryOptions({
    queryKey: ["search-users-infinite", keyword],
    queryFn: ({ pageParam = 1 }) => fetchSearchUsers({ keyword, pageIndex: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage && (lastPageParam as number) < lastPage.pages
        ? (lastPageParam as number) + 1
        : undefined,
    staleTime: 60_000,
    enabled: !!keyword,
  })
}

function fetchSearchGameMatchLive(keyword: string, grade1 = 0, grade2 = 0) {
  return javaGet<SearchGameMatchLiveResultInterface>(SEARCH_API.SEARCH_GAME_MATCH_LIVE, {
    params: { keyword, grade1, grade2 },
  })
}

export function searchGameMatchLiveQueryOptions(keyword: string, grade1 = 0, grade2 = 0) {
  return queryOptions({
    queryKey: ["search-game-match-live", keyword, grade1, grade2],
    queryFn: () => fetchSearchGameMatchLive(keyword, grade1, grade2),
    staleTime: 30_000,
    enabled: !!keyword,
  })
}

export function searchAnchorsQueryOptions(
  keyword: string,
  pageIndex = 1,
  pageSize = SEARCH_PAGE_SIZE
) {
  return queryOptions({
    queryKey: ["search-anchors", keyword, pageIndex, pageSize],
    queryFn: () => fetchAttentionAnchors({ keyword, pageIndex, pageSize }),
    staleTime: 60_000,
  })
}

export function searchAnchorsInfiniteQueryOptions(keyword: string) {
  return infiniteQueryOptions({
    queryKey: ["search-anchors-infinite", keyword],
    queryFn: ({ pageParam = 1 }) =>
      fetchAttentionAnchors({
        keyword,
        pageIndex: pageParam as number,
        pageSize: SEARCH_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage && (lastPageParam as number) < lastPage.pages
        ? (lastPageParam as number) + 1
        : undefined,
    staleTime: 60_000,
  })
}

export {
  fetchSearchAll,
  fetchSearchMatches,
  fetchSearchNews,
  fetchSearchUsers,
  fetchAttentionAnchors,
  fetchGameMatchLive,
}

import { javaGet } from "@/server/services/client-request"

import type { LiveSearchMatchInterface } from "@/models/match.models"

import type {
  SearchAllParamsInterface,
  SearchAttentionAnchorParamsInterface,
  SearchGameMatchLiveParamsInterface,
  SearchMatchesParamsInterface,
  SearchNewsParamsInterface,
  SearchUsersParamsInterface,
} from "./search.models"

export const SEARCH_API = {
  ALL: "/search/search-all",
  MATCHES: "/search/search-matchs",
  NEWS: "/search/search-news",
  USERS: "/search/search-users",
  ATTENTION_ANCHOR: "/search/attention-anchor",
  GAME_MATCH_LIVE: "/v3/search/game-match-live",
} as const

function fetchSearchAll(p: SearchAllParamsInterface): Promise<unknown | null> {
  return javaGet<unknown>(SEARCH_API.ALL, {
    params: { keyword: p.keyword, pageIndex: p.pageIndex, pageSize: p.pageSize },
  })
}

function fetchSearchMatches(p: SearchMatchesParamsInterface): Promise<unknown | null> {
  return javaGet<unknown>(SEARCH_API.MATCHES, {
    params: { keyword: p.keyword, pageIndex: p.pageIndex, pageSize: p.pageSize },
  })
}

function fetchSearchNews(p: SearchNewsParamsInterface): Promise<unknown | null> {
  return javaGet<unknown>(SEARCH_API.NEWS, {
    params: { keyword: p.keyword, pageIndex: p.pageIndex, pageSize: p.pageSize },
  })
}

function fetchSearchUsers(p: SearchUsersParamsInterface): Promise<unknown | null> {
  return javaGet<unknown>(SEARCH_API.USERS, {
    params: { keyword: p.keyword, pageIndex: p.pageIndex, pageSize: p.pageSize },
  })
}

function fetchAttentionAnchors(p?: SearchAttentionAnchorParamsInterface): Promise<unknown | null> {
  return javaGet<unknown>(SEARCH_API.ATTENTION_ANCHOR, {
    params: { pageIndex: p?.pageIndex, pageSize: p?.pageSize },
  })
}

function fetchGameMatchLive(
  p: SearchGameMatchLiveParamsInterface
): Promise<LiveSearchMatchInterface[] | null> {
  return javaGet<LiveSearchMatchInterface[]>(SEARCH_API.GAME_MATCH_LIVE, {
    params: { id: p.id, typeScreen: p.typeScreen },
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

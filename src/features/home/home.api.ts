import { getRequest, postRequest } from "@/server/services/request"
import { MATCH_API } from "@/lib/match.utils"

import { env } from "@/config/env"
import { FOOTBALL_GAME_ID } from "@/constants/component/home.constants"
import { DateRangeEnum } from "@/enums/common.enum"

import type { LiveMatch } from "@/features/home/components/hero-video"
import type {
  FeaturedNewsResult,
  LatestNewsResult,
  NewsItem,
  PopularNewsResult,
} from "@/features/news/news.models"

export type { ApiConfig, LeagueApiItem, LeagueApiResult } from "@/features/home/home.models"
export type { NewsItem } from "@/features/news/news.models"

export const HOME_API = {
  MATCH_LEAGUES: "/league/v2/match-leagues",
  MATCH_UPCOMING: "/v2/match/get-pc-upcoming-game-match",
  MATCH_PAST: "/v2/match/get-pc-past-game-match",
  NEWS_FEATURED: "/news/featured-by-game",
  NEWS_POPULAR: "/news/get-popular-news-by-game",
  NEWS_LATEST: "/v4/0/new/1",
  MATCH_LIVE: "/v2/match/get-pc-live-game-match",
} as const

function fetchLatestNewsAction(): Promise<NewsItem | null> {
  return getRequest<LatestNewsResult>(
    `${HOME_API.NEWS_LATEST}?tabType=0&type=new&pageIndex=1`
  ).then((data) => data?.records?.[0] ?? null)
}

function fetchLatestNewsListAction(limit = 5): Promise<NewsItem[]> {
  return getRequest<LatestNewsResult>(
    `${HOME_API.NEWS_LATEST}?tabType=0&type=new&pageIndex=1`
  ).then((data) => (data?.records ?? []).slice(0, limit))
}

function fetchFeaturedNewsAction(gameIds = FOOTBALL_GAME_ID): Promise<NewsItem[]> {
  return getRequest<FeaturedNewsResult>(`${HOME_API.NEWS_FEATURED}?gameIds=${gameIds}`)
    .then((data) => data?.news ?? [])
    .catch(() => [])
}

function getEndpointByDate(date: string | null): string {
  switch (date) {
    case DateRangeEnum.YESTERDAY:
      return HOME_API.MATCH_PAST
    case DateRangeEnum.TOMORROW:
      return HOME_API.MATCH_UPCOMING
    default:
      return MATCH_API.LIVE
  }
}

function fetchLiveMatchesAction(): Promise<LiveMatch[]> {
  return postRequest<unknown[]>(HOME_API?.MATCH_LIVE, { gameId: [] })
    .then((data) => {
      if (!Array.isArray(data)) return []

      return data
        .map((raw) => {
          const m = raw as Record<string, unknown>
          const liveUrls = (m.liveUrls as { liveUrl?: string; liveUrlFlv?: string }[] | null) ?? []

          const wrapUrl = (raw: string) =>
            env.isDev ? `/api/stream?url=${encodeURIComponent(raw)}` : raw

          const sources = liveUrls.flatMap((u, i) => {
            const result = []
            if (u.liveUrl) result.push({ url: wrapUrl(u.liveUrl), name: `Nguồn ${i + 1} HLS` })
            if (u.liveUrlFlv)
              result.push({ url: wrapUrl(u.liveUrlFlv), name: `Nguồn ${i + 1} FLV` })
            return result
          })

          return {
            id: m.matchId as number,
            chatroomId: m.matchId as number,
            gameId: (m.gameId as number) ?? 0,
            homeName: (m.homeName as string) ?? "",
            homeLogo: (m.homeLogo as string) ?? "",
            awayName: (m.awayName as string) ?? "",
            awayLogo: (m.awayLogo as string) ?? "",
            homeScore: (m.homeScore as number) ?? undefined,
            awayScore: (m.awayScore as number) ?? undefined,
            period: (m.gameTime as number) ?? undefined,
            state: (m.state as number) ?? null,
            startTime: (m.startTime as number) ?? null,
            leagueName: (m.leagueName as string) ?? undefined,
            leagueLogo: (m.leagueLogo as string) ?? undefined,
            homeCornerKick: (m.homeCornerKick as number) ?? undefined,
            awayCornerKick: (m.awayCornerKick as number) ?? undefined,
            homeYellowCard: (m.homeYellowCard as number) ?? undefined,
            awayYellowCard: (m.awayYellowCard as number) ?? undefined,
            homeRedCard: (m.homeRedCard as number) ?? undefined,
            awayRedCard: (m.awayRedCard as number) ?? undefined,
            anchors: ((m.anchorRoomVos as { userAvatar: string; userName: string }[]) ?? [])
              .slice(0, 3)
              .map((a) => ({ userAvatar: a.userAvatar, userName: a.userName })),
            sources,
          } satisfies LiveMatch
        })
        .filter(Boolean) as LiveMatch[]
    })
    .catch(() => [])
}

function fetchPopularNewsAction(gameIds = FOOTBALL_GAME_ID): Promise<NewsItem[]> {
  return getRequest<PopularNewsResult>(`${HOME_API.NEWS_POPULAR}?gameIds=${gameIds}`)
    .then((data) => data?.videos ?? [])
    .catch((err) => {
      console.error("fetchPopularNewsAction error:", err)
      return []
    })
}

export {
  fetchLatestNewsAction,
  fetchLatestNewsListAction,
  fetchFeaturedNewsAction,
  fetchPopularNewsAction,
  fetchLiveMatchesAction,
  getEndpointByDate,
}

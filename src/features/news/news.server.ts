import "server-only"

import { getRequest } from "@/server/services/request"
import { getServerLoginUserId } from "@/lib/auth-server"

import { FOOTBALL_GAME_ID } from "@/constants/component/home.constants"

import type {
  HotNewsResultInterface,
  NewsArticleDetail,
  NewsItem,
  PopularNewsResult,
} from "@/features/news/news.models"

const NEWS_API = {
  ARTICLE: "/news/news-article",
  HOT_BY_GAME: "/news/get-hot-news-by-game",
  POPULAR: "/news/get-popular-news-by-game",
} as const

function fetchPopularNewsListAction(gameIds = FOOTBALL_GAME_ID): Promise<NewsItem[]> {
  return getRequest<PopularNewsResult>(`${NEWS_API.POPULAR}?gameIds=${gameIds}`).then(
    (data) => data?.news || []
  )
}

function fetchNewsArticleAction(newsId: string): Promise<NewsArticleDetail | null> {
  return getServerLoginUserId().then((loginUserId) =>
    getRequest<NewsArticleDetail>(NEWS_API.ARTICLE, {
      params: { newsId, loginUserId },
    })
  )
}

function fetchHotNewsByGameAction(gameId = FOOTBALL_GAME_ID): Promise<HotNewsResultInterface> {
  const empty: HotNewsResultInterface = { news: [], videos: [] }
  return getRequest<{ news?: NewsItem[]; videos?: NewsItem[] }>(
    `${NEWS_API.HOT_BY_GAME}?gameIds=${gameId}`
  ).then((data) => {
    if (!data) return empty
    return {
      news: (data.news || []).slice(0, 5),
      videos: (data.videos || []).slice(0, 4),
    }
  })
}

export { fetchPopularNewsListAction, fetchNewsArticleAction, fetchHotNewsByGameAction }

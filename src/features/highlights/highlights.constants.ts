import { FeedMenu } from "@/enums/highlights.enum"

const VALID_MENUS = Object.values(FeedMenu) as string[]

const GAME_ID = {
  /** "" — không lọc theo game cụ thể (hot/esports/other tab) */
  ALL: "" as const,
  /** 202 — Bóng đá */
  SOCCER: 202,
  /** 201 — Bóng rổ */
  BASKETBALL: 201,
  /** 210 — Cricket */
  CRICKET: 210,
  /** 211 — Quần vợt */
  TENNIS: 211,
  /** 204 — Snooker */
  SNOOKER: 204,
  /** 213 — Bóng chày */
  BASEBALL: 213,
  /** 217 — Bóng bầu dục Mỹ */
  AMERICAN_FOOTBALL: 217,
  /** 214 — Bóng chuyền */
  VOLLEYBALL: 214,
  /** 216 — Bóng bàn */
  TABLE_TENNIS: 216,
  /** 215 — Cầu lông */
  BADMINTON: 215,
  /** 200 — Thể thao tổng hợp */
  COMPREHENSIVE: 200,
} as const

type GameIdValue = (typeof GAME_ID)[keyof typeof GAME_ID]

/** Page size cho latest videos — KIMTV-PC LATEST_VIDEO_PAGE_SIZE */
const LATEST_VIDEO_PAGE_SIZE = 10

/** Page size cho comment list — KIMTV-PC PAGE_SIZE = 100 */
const PAGE_SIZE_COMMENT = 100

/** Khoảng thời gian cho trending videos (30 ngày) */
const TRENDING_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

/** newsType = 3 là video */
const VIDEO_NEWS_TYPE = 3

/**
 * Mapping tĩnh của get-news-tab — giống KIMTV-PC getNewsVideoId.
 * Key = index trả về từ API, value = thông tin tab.
 */
const NEWS_TAB_MAP: Record<number, { abbr: string; gameId: GameIdValue; index: number }> = {
  0: { abbr: "hot", gameId: GAME_ID.ALL, index: 0 },
  1: { abbr: "soccer", gameId: GAME_ID.SOCCER, index: 1 },
  2: { abbr: "basketball", gameId: GAME_ID.BASKETBALL, index: 2 },
  3: { abbr: "esports", gameId: GAME_ID.ALL, index: 3 },
  4: { abbr: "baseball", gameId: GAME_ID.BASEBALL, index: 4 },
  5: { abbr: "tennis", gameId: GAME_ID.TENNIS, index: 5 },
  6: { abbr: "other", gameId: GAME_ID.ALL, index: 6 },
}

// ─── Feed menu config ─────────────────────────────────────────────────────────

const FILTER_MENU_CONFIG = [
  { key: FeedMenu.Featured, labelKey: "video.menu.featured" },
  { key: FeedMenu.Latest, labelKey: "video.menu.latest" },
  { key: FeedMenu.Trending, labelKey: "video.menu.trending" },
] as const

const LINK_MENU_CONFIG = [
  { key: "news", labelKey: "video.menu.news", external: false },
  { key: "promotion", labelKey: "video.menu.promotion", external: true },
] as const

/** Backend KimTV paths — client gọi qua `/java/*`, server qua `getRequest`. */
const HIGHLIGHTS_API = {
  VIDEO: {
    FEATURED: "/news/featured-by-game",
    POPULAR: "/news/get-popular-news-by-game",
    NEWS_TAB: "/get-news-tab",
    LATEST: (tabType: number, pageIndex: number) => `/v4/${tabType}/video/${pageIndex}`,
    LIKE: "/news/user-like",
  },
  COMMENT: {
    LIST: "/news/news-comment",
    POST: "/news/comment-news",
    DELETE: "/news/remove-comment",
  },
  SOCIAL: {
    FOLLOW: "/user/follow-user",
  },
} as const

export { FeedMenu }
export {
  VALID_MENUS,
  GAME_ID,
  LATEST_VIDEO_PAGE_SIZE,
  PAGE_SIZE_COMMENT,
  TRENDING_WINDOW_MS,
  VIDEO_NEWS_TYPE,
  NEWS_TAB_MAP,
  FILTER_MENU_CONFIG,
  LINK_MENU_CONFIG,
  HIGHLIGHTS_API,
}

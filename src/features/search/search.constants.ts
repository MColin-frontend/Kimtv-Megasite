import { Flame, Heart, LayoutGrid, Newspaper, Radio, Trophy, UserPlus, Users } from "lucide-react"

const SEARCH_QUERY_KEY = "search-key" as const
const SEARCH_FILTER_KEY = "filter" as const
const SEARCH_MATCH_PAGE_KEY = "match-page" as const
const SEARCH_UPCOMING_PAGE_KEY = "upcoming-page" as const
const SEARCH_FINISHED_PAGE_KEY = "finished-page" as const
const SEARCH_NEWS_PAGE_KEY = "news-page" as const
const SEARCH_USERS_PAGE_KEY = "users-page" as const
const SEARCH_ANCHOR_PAGE_KEY = "anchor-page" as const

enum SearchFilterEnum {
  ALL = "all",
  MATCH = "match",
  NEWS = "news",
  USER = "user",
  STREAM = "stream",
  GAME = "game",
}

enum SearchAllResultKeyEnum {
  MATCHES = "matches",
  UPCOMING = "upcoming",
  FINISHED = "finished",
  NEWS = "news",
  USERS = "users",
  ANCHORS = "anchors",
  GAME_LIVE = "gameLive",
}

const USERS_PAGE_SIZE = 12

const USER_CARD_STATS = [
  {
    labelKey: "search.user-card.stats.follower" as const,
    key: "followerCount" as const,
    icon: Users,
    color: "text-amber-400",
  },
  {
    labelKey: "search.user-card.stats.following" as const,
    key: "followingCount" as const,
    icon: UserPlus,
    color: "text-amber-400",
  },
  {
    labelKey: "search.user-card.stats.likes" as const,
    key: "likeCount" as const,
    icon: Heart,
    color: "text-red-400",
  },
  {
    labelKey: "search.user-card.stats.experience" as const,
    key: "experience" as const,
    icon: Flame,
    color: "text-orange-400",
  },
]

const SEARCH_FILTER_TYPES = [
  { key: SearchFilterEnum.ALL, labelKey: "search.filter.all", icon: LayoutGrid },
  { key: SearchFilterEnum.MATCH, labelKey: "search.filter.match", icon: Trophy },
  { key: SearchFilterEnum.NEWS, labelKey: "search.filter.news", icon: Newspaper },
  { key: SearchFilterEnum.STREAM, labelKey: "search.filter.stream", icon: Radio },
]

export {
  SEARCH_QUERY_KEY,
  SEARCH_FILTER_KEY,
  SEARCH_MATCH_PAGE_KEY,
  SEARCH_UPCOMING_PAGE_KEY,
  SEARCH_FINISHED_PAGE_KEY,
  SEARCH_NEWS_PAGE_KEY,
  SEARCH_USERS_PAGE_KEY,
  SEARCH_ANCHOR_PAGE_KEY,
  USERS_PAGE_SIZE,
  USER_CARD_STATS,
  SearchFilterEnum,
  SearchAllResultKeyEnum,
  SEARCH_FILTER_TYPES,
}

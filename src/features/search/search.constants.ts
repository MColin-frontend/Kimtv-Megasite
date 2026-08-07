import { Gamepad2, LayoutGrid, Newspaper, Radio, Trophy, User } from "lucide-react"

export const SEARCH_QUERY_KEY = "search-key" as const
export const SEARCH_FILTER_KEY = "filter" as const

export enum SearchFilterEnum {
  ALL = "all",
  MATCH = "match",
  NEWS = "news",
  USER = "user",
  STREAM = "stream",
  GAME = "game",
}

export enum SearchAllResultKeyEnum {
  MATCHES = "matches",
  NEWS = "news",
  USERS = "users",
  ANCHORS = "anchors",
  GAME_LIVE = "gameLive",
}

export const SEARCH_FILTER_TYPES = [
  { key: SearchFilterEnum.ALL, label: "Tất cả kết quả", icon: LayoutGrid },
  { key: SearchFilterEnum.MATCH, label: "Trận đấu", icon: Trophy },
  { key: SearchFilterEnum.NEWS, label: "Tin tức", icon: Newspaper },
  { key: SearchFilterEnum.USER, label: "Người dùng", icon: User },
  { key: SearchFilterEnum.STREAM, label: "Streamer theo dõi", icon: Radio },
  { key: SearchFilterEnum.GAME, label: "Trận game đang live", icon: Gamepad2 },
] as const

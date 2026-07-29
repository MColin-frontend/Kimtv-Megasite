export interface BannerItem {
  imageUrl: string
  url?: string
  width?: number
  height?: number
}

import { HTTP_METHOD } from "@/lib/match.utils"

export interface ApiConfig {
  endpoint: string
  method: (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD]
  params: Record<string, unknown>
  /** false = không truyền page/pageSize vào request (endpoint tự trả toàn bộ) */
  paginate?: false
}

export interface LeagueApiItem {
  gameId: number
  gameCount: number
  level: number
  leagueId: number
  name: string
  nameEn: string | null
  abbr: string
  firstLetter: string
  isHot: boolean
}

export interface LeagueApiResult {
  hotLeagus: LeagueApiItem[]
  moreLeagus: LeagueApiItem[]
}

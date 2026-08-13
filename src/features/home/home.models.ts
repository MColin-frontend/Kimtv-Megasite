import { HTTP_METHOD } from "@/lib/match.utils"

export interface BannerItem {
  imageUrl: string
  url?: string
  width?: number
  height?: number
}

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
  isHot: boolean | null
  icon: string | null
  logo: string | null
  language: string | null
  regionId: number
  hotValue: number
  hostCountry: string
  hostCity: string
}

export interface LeagueApiResult {
  beiDan: LeagueApiItem[]
  hotLeagus: LeagueApiItem[]
  topLeagus: LeagueApiItem[]
  moreLeagus: LeagueApiItem[]
  jingCai: LeagueApiItem[]
  zuCai: LeagueApiItem[]
}

export interface HotLeagueInterface {
  leagueId: number
  name: string
  logo: string
  liveCount: number
  matchCount: number
  totalScore?: number
  rank: number
}

export interface HotTeamInterface {
  teamId: number
  name: string
  logo: string
  leagueName: string
  heat: number
  form: string[]
  rank: number
  abbr: string
  totalScore?: number
  matchCount?: number
}

export interface PlayerStatInterface {
  playerId: number
  name?: string
  abbr: string
  logo: string
  position: string
  teamId: number
  teamName?: string
  teamAbbr: string
  teamLogo: string
  integral: number
  icon: string
  kda: number | null
  matchWinRate: number | null
  marketValue?: number
  value?: number
  marketValueCurrency?: string
  age?: number
  height?: number
  number?: number
  rank?: number
  weight?: number
  countryId?: number
  preferredFoot?: string
}

export interface FootballHubResultInterface {
  teams: HotTeamInterface[]
  leagues: HotLeagueInterface[]
  players: PlayerStatInterface[]
}

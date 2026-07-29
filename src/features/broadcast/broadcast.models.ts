/* ── Match ────────────────────────────────────────────────── */

export interface BroadcastMatchItemInterface {
  matchId: number
  homeName: string | null
  awayName: string | null
  anchorName: string | null
  startTime: number | null
  gameId: number | null
  status: number | null
}

export interface BroadcastMatchGroupInterface {
  leagueName: string
  leagueId: number
  list: BroadcastMatchItemInterface[]
}

/* ── League ───────────────────────────────────────────────── */

export interface LeagueItemInterface {
  leagueId: number
  leagueName: string | null
}

export interface LeagueFetchParamsInterface {
  search: string
  page: number
  pageSize: number
}

export interface LeagueFetchResultInterface {
  options: { value: string; label: string }[]
  hasMore: boolean
}

/* ── Anchor ───────────────────────────────────────────────── */

export interface AnchorInfoInterface {
  anchorId: number | null
  userId: number | null
  userName: string | null
  userAvatar: string | null
  brief: string | null
  detailIntroduce: string | null
  introduceImages: string[]
  content: string | null
  title: string | null
  cover: string | null
  liveStatus: number | null
  liveUrl: string | null
  liveUrlFlv: string | null
}

export interface UpdateAnchorPayloadInterface {
  brief: string
  detailIntroduce: string
  introduceImages: string[]
  content: string
}

export interface ApplyAnchorPayloadInterface {
  userName: string
  mobile: string
  idCard: string
  description: string
  idCardFront: string
  idCardOpposite: string
  handIdCard: string
  gameIds: string
  customTags: string
}

/* ── Live ─────────────────────────────────────────────────── */

export interface CreateAnchorLivePayloadInterface {
  leagueId: number
  leagueName: string
  matchId: number
  matchName: string
  gameId: number
  gameName: string
  title: string
  cover: string
  viewStyle: number
  live: number
  liveType: number
  isReservation: boolean
  reservationTime: string
  foreignMessage: boolean
  payType: string
  customTagsId?: number | null
}

export interface CreateAnchorLiveResultInterface {
  id: string
  roomId: number | null
  roomStatus: number | null
  rtmpPushUrl: string | null
  streamingKey: string | null
  flvUrl: string | null
  m3u8Url: string | null
  live: number | null
  liveType: number | null
  title: string | null
  cover: string | null
  viewStyle: number | null
  payType: string | null
  isReservation: boolean
  reservationTime: number | null
  foreignMessage: boolean
  isShow: boolean
  liveUrlList: LiveUrlItemInterface[] | null
}

export interface ToggleMatchIdPayloadInterface {
  id: string
  leagueId: number
  leagueName: string
  matchId: number
  matchName: string
  gameId: number
  gameName: string
  title: string
  cover: string
  viewStyle: number
  live: number
  liveType: number
  isReservation: boolean
  reservationTime: string
  foreignMessage: boolean
  payType: string
  gold: number
  level: number | null
}

export interface LiveInfoInterface {
  liveId: string
  roomId: number | null
  rtmpPushUrl: string | null
  streamingKey: string | null
  live: number | null
  title: string | null
}

export interface LiveUrlItemInterface {
  liveUrl: string | null
  liveUrlFlv: string | null
  liveUrlRtmp: string | null
  language: string | null
  urlType: string | null
  weight: number | null
  isPro: boolean | null
}

export interface IsBroadcastResponseVoInterface {
  id: string
  roomId: number | null
  roomStatus: number | null
  rtmpPushUrl: string | null
  streamingKey: string | null
  flvUrl: string | null
  m3u8Url: string | null
  live: number | null
  liveType: number | null
  title: string | null
  cover: string | null
  viewStyle: number | null
  payType: string | null
  isReservation: boolean
  reservationTime: number | null
  foreignMessage: boolean
  isShow: boolean
  gold: number | null
  level: number | null
  liveUrlList: LiveUrlItemInterface[]
  nowLiveMatchId: number | null
  nowLiveMatchName: string | null
  nowLiveLeagueId: number | null
  nowLiveLeagueName: string | null
  nowLiveGameId: number | null
  nowLiveGameName: string | null
  customTagsId: string | null
  customTagsName: string | null
  brief: string | null
  detailIntroduce: string | null
  content: string | null
  introduceImages: string[] | null
}

export interface IsBroadcastResponseInterface {
  hasLive: boolean
  responseVo: IsBroadcastResponseVoInterface | null
}

export interface IsBroadcastWithTimeInterface {
  result: IsBroadcastResponseInterface | null
  time: number | null
}

export interface ReservationItemInterface {
  matchId: number
  gameId: number
  isReservation: boolean
  homeName: string | null
  awayName: string | null
  leagueId: number | null
  leagueName: string | null
  leagueLogo: string | null
  homeLogo: string | null
  awayLogo: string | null
  startTime: number | null
  reservationTime: number | null
  status: number | null
  homeScore: number | null
  awayScore: number | null
}

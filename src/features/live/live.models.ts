import type { Nullable } from "@/types"

export interface LiveRoomAnchorInterface {
  roomId: number
  anchorId?: Nullable<number>
  userName: Nullable<string>
  userAvatar: Nullable<string>
  userBrief?: Nullable<string>
  cover?: Nullable<string>
  liveUrl: Nullable<string>
  liveUrlFlv: Nullable<string>
  popularity?: Nullable<number>
  liveId?: Nullable<string>
}

export interface LiveMatchInterface {
  matchId: number | string
  gameId: number
  status: number
  state: Nullable<number>
  gameTime: Nullable<number>
  startTime: Nullable<number>
  leagueName: Nullable<string>
  leagueLogo: Nullable<string>
  seriesName?: Nullable<string>
  homeName: Nullable<string>
  homeLogo: Nullable<string>
  homeScore: Nullable<number>
  homeFirstHalfScore?: Nullable<number>
  awayName: Nullable<string>
  awayLogo: Nullable<string>
  awayScore: Nullable<number>
  awayFirstHalfScore?: Nullable<number>
  homeCornerKick?: Nullable<number>
  awayCornerKick?: Nullable<number>
  homeYellowCard?: Nullable<number>
  awayYellowCard?: Nullable<number>
  homeRedCard?: Nullable<number>
  awayRedCard?: Nullable<number>
  liveUrls: Array<{ liveUrl: Nullable<string>; liveUrlFlv: Nullable<string> }>
  anchorRoom?: LiveRoomAnchorInterface[]
  chatroomUserRole?: Nullable<string>
}

export interface LivePageDataInterface {
  match: LiveMatchInterface | null
  chatAnnouncement: string[]
}

export interface AnchorLiveDetailInterface {
  match: LiveMatchInterface | null
  userLevel?: number
}

export interface MatchLiveOptionsInterface {
  /** liveType=2 + anchorLiveId → API trả stream của anchor cụ thể */
  liveType?: number
  anchorLiveId?: number
}

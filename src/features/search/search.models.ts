interface SearchBaseParamsInterface {
  keyword: string
  pageIndex: number
  pageSize?: number
}

interface SearchAttentionAnchorParamsInterface {
  keyword?: string
  pageIndex?: number
  pageSize?: number
}

interface SearchGameMatchLiveParamsInterface {
  id: string
  typeScreen: number
}

interface SearchGameMatchLiveResultInterface {
  matchList: import("@/models/match.models").LiveSearchMatchInterface[]
  anchorList: import("@/models/match.models").LiveSearchMatchInterface[]
  matchLives: import("@/models/match.models").LiveSearchMatchInterface[]
}

interface SearchUserModel {
  uid?: number | string
  userId?: number | string
  name: string
  avatar?: string | null
  description?: string | null
  role?: string | null
  adminId?: string | null
  grade?: number | null
  sex?: string | null
  mobile?: string | null
  areaCode?: string | null
  email?: string | null
  followerCount?: number | null
  followingCount?: number | null
  likeCount?: number | null
  experience?: number | null
  gold?: number | null
  diamond?: number | null
  isVip?: boolean | null
  isSVip?: boolean | null
  vip99Icon?: string | null
  hasFollow?: boolean | 1 | 0 | "1" | "true" | null
  anchorState?: boolean | null
  registrationDays?: number | null
  registerDate?: string | null
  expirationDate?: string | null
}

interface AnchorModel {
  anchorId: number
  userName: string
  userAvatar?: string | null
  userBrief?: string | null
  roomId?: number | null
  roomStatus?: number | null
  followerCount?: number | null
  isAttention?: boolean | null
  brief?: string | null
  title?: string | null
  cover?: string | null
  liveUrl?: string | null
  liveUrlFlv?: string | null
  popularity?: number | null
  registerDate?: string | null
}

interface AnchorPaginatedResponse {
  total: number
  current: number
  pages: number
  size: number
  records: AnchorModel[]
}

export type {
  SearchBaseParamsInterface,
  SearchAttentionAnchorParamsInterface,
  SearchGameMatchLiveParamsInterface,
  SearchGameMatchLiveResultInterface,
  SearchUserModel,
  AnchorModel,
  AnchorPaginatedResponse,
}

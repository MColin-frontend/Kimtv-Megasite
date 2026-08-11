import { UserRoleEnum } from "./user-info.constants"

export interface UserInfoModel {
  userId?: number | string
  uid?: number | string
  name: string
  avatar?: string | null
  description?: string | null
  role?: UserRoleEnum | null
  registrationDays?: number | null
  followerCount?: number | null
  followingCount?: number | null
  likeCount?: number | null
  viewCount?: number | null
  articleCount?: number | null
  hasFollow?: boolean | 1 | 0 | "1" | "true" | null
  isVip?: boolean | null
  isSVip?: boolean | null
  anchorState?: boolean | null
  isSource?: boolean | null
  isBind?: boolean | null
  fictitious?: boolean | null
  adminId?: string | null
  vip99Icon?: string | null
  vip99Level?: string | number | null
  grade?: number | null
  experience?: number | null
  nextExperience?: number | null
  gold?: number | null
  diamond?: number | null
  uuid?: string | null
  imId?: string | null
  usersig?: string | null
  sex?: number | string | null
  mobile?: string | null
  areaCode?: string | null
  email?: string | null
  realName?: string | null
  likeGameId?: string | number | null
  registerDate?: string | null
  expirationDate?: string | null
  expirationDateSVip?: string | null
  qqId?: string | null
  qqNumber?: string | null
  qqName?: string | null
  wechatName?: string | null
  wechatNumber?: string | null
  wxId?: string | null
  appleId?: string | null
}

export interface UserSearchPaginatedInterface {
  records: UserInfoModel[]
  total: number
  current?: number
  pages?: number
  size?: number
}

export interface UserContentItem {
  newsId: string | number
  newsType?: number | null
  title: string
  coverUrl?: string | null
  summary?: string | null
  likeCount?: number | null
  commentCount?: number | null
  videoUrl?: string | null
  gameId?: number | null
  authorId?: number | null
  userName?: string | null
  userAvatar?: string | null
  publishTime?: string | number | null
}

export interface UserContentResult {
  records: UserContentItem[]
  total: number
}

export interface VipBadgeModel {
  badgeId?: number | string | null
  badgeName?: string | null
  badgeIcon?: string | null
  level?: number | null
  isVip?: boolean | null
}

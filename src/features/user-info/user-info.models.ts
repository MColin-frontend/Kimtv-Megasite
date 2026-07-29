export interface UserInfoModel {
  userId?: number | string
  uid?: number | string
  name: string
  avatar?: string | null
  description?: string | null
  registrationDays?: number | null
  followerCount?: number | null
  likeCount?: number | null
  viewCount?: number | null
  articleCount?: number | null
  hasFollow?: boolean | 1 | 0 | "1" | "true" | null
  isVip?: boolean | null
  adminId?: string | null
  vip99Icon?: string | null
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

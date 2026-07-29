export interface NewsItem {
  newsId: string | number
  nid?: number
  newsType?: number
  coverUrl: string
  videoUrl?: string | null
  durationMillis?: number | null
  title: string
  summary?: string
  userName?: string
  userAvatar?: string
  likeCount?: number
  commentCount?: number
  gameId?: number
  publishTime?: string | number
}

interface FeaturedNewsResult {
  news: NewsItem[]
}

interface PopularNewsResult {
  news: NewsItem[]
  videos: NewsItem[]
}

interface LatestNewsResult {
  records: NewsItem[]
  total: number
}

interface HotNewsResultInterface {
  news: NewsItem[]
  videos: NewsItem[]
}

interface NewsComment {
  ncid: number | string
  content: string
  userName?: string
  avatar?: string
  publishTime?: number | string
  likeCount?: number
  isLike?: boolean
  userSourceId?: string | number
  replyUserName?: string
  children?: NewsComment[]
  _pending?: boolean
  _clientKey?: string
}

interface NewsArticleDetail extends NewsItem {
  content?: string | null
  authorId?: number | null
  isLike?: boolean | string | number | null
  hasFollow?: boolean | null
  pics?: string[] | null
  videoType?: number | null
}

interface NewsPanelProps {
  items: NewsItem[]
  title: string
  viewAllHref: string
  viewAllLabel: string
  categoryLabel: string
  getHref: (id: string) => string
}

interface FetchCommentListParamsInterface {
  newsId: string | number
  pageIndex: number
  pageSize: number
  commentType: number
  loginUserId: string
}

interface PostCommentParamsInterface {
  commentType: number
  content: string
  mainNewsId: number
  userSourceId: string
  topFloorId?: number
  replyToCommentId?: number
  replyToUserSourceId?: string | number
}

interface LikeCommentParamsInterface {
  typeId: string
  isLike: boolean
  loginUserId: string
}

interface ActionMessagesInterface {
  messageSuccess?: string
  messageError?: string
}

interface FollowParamsInterface {
  userId: number
  isFollow: boolean
  setFollowing: (value: boolean) => void
  setLoading: (value: boolean) => void
  messageSuccess?: string
}

interface NewsSectionPropsInterface {
  title: string
  categoryLabel: string
  viewAllHref: string
  viewAllLabel: string
  getHref: (id: string) => string
}

export type {
  NewsSectionPropsInterface,
  FeaturedNewsResult,
  PopularNewsResult,
  LatestNewsResult,
  HotNewsResultInterface,
  NewsComment,
  NewsArticleDetail,
  NewsPanelProps,
  FetchCommentListParamsInterface,
  PostCommentParamsInterface,
  LikeCommentParamsInterface,
  ActionMessagesInterface,
  FollowParamsInterface,
}

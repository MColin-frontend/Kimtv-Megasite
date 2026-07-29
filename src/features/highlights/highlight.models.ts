import { Dispatch, SetStateAction } from "react"

import type { FeedMenu } from "@/enums/highlights.enum"

interface HighlightVideoInterface {
  newsId: string | number
  newsType?: number
  coverUrl: string
  videoUrl?: string | null
  durationMillis?: number | null
  title: string
  summary?: string
  userName?: string
  userAvatar?: string
  authorId?: string | number
  likeCount?: number
  commentCount?: number
  gameId?: number
  publishTime?: string | number
  isLike?: boolean | number | string
  hasFollow?: boolean | number | string
  isTop?: boolean | number | string
  topTime?: number
}

interface VideoResultRawInterface {
  videos?: HighlightVideoInterface[]
  records?: HighlightVideoInterface[]
  total?: number
}

interface InitialHighlightsDataInterface {
  videos: HighlightVideoInterface[]
  hasMore: boolean
}

interface CommentRecordInterface {
  ncid: string | number
  content: string
  userName?: string
  avatar?: string
  publishTime?: string | number
  likeCount?: number
  isLike?: boolean | number | null
  userSourceId?: string | number
  replyUserName?: string | null
  replyToCommentId?: number | null
  replyToUserSourceId?: string | number | null
  topFloorId?: number
  isDeleted?: boolean
  children?: CommentRecordInterface[]
  childrenCount?: number
  commentType?: number
  commentId?: number
  mainNewsId?: number | string
  operatorId?: number | string
  ctime?: number
  mtime?: number
  _pending?: boolean
  _clientKey?: string
}

interface CommentListResultInterface {
  records: CommentRecordInterface[]
  total: number
}

interface PostCommentPayloadInterface {
  commentType: number
  content: string
  mainNewsId: number
  userSourceId: string | number
  topFloorId?: number
  replyToCommentId?: number
  replyToUserSourceId?: string | number
}

interface PostCtxInterface {
  kind: "comment" | "reply"
  parentNcid?: number
  toNcid?: number
  toUserSourceId?: string
}

interface FetchCommentsParamsInterface {
  newsId: string | number
  page: number
  loginUserId: string
  commentType: number
  pageSize?: number
  setComments: Dispatch<SetStateAction<CommentItemInterface[]>>
  setParams: Dispatch<SetStateAction<CommentParamsStateInterface>>
}

interface CommentItemInterface extends CommentRecordInterface {
  children?: CommentRecordInterface[]
}

interface CommentDrawerPropsInterface {
  newsId: string | number
  newsType?: number
  commentCount?: number
  status: FeedMenu
  onClose: () => void
  onCountChange?: (count: number) => void
}

interface FetchStateInterface {
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
}

interface ReplyStateInterface {
  parent: CommentItemInterface | null
  to: CommentRecordInterface | null
}

interface CommentFormInterface {
  content: string
}

interface CommentParamsStateInterface {
  isLoading: boolean
  isLoadingMore: boolean
  total: number
  page: number
}

interface VideoFeedResultInterface {
  videos: HighlightVideoInterface[]
  hasMore: boolean
}

interface FetchVideoFeedParamsInterface {
  status: FeedMenu
  page?: number
  loginUserId?: string
}

export type {
  HighlightVideoInterface,
  VideoResultRawInterface,
  InitialHighlightsDataInterface,
  VideoFeedResultInterface,
  FetchVideoFeedParamsInterface,
  CommentRecordInterface,
  CommentListResultInterface,
  PostCommentPayloadInterface,
  PostCtxInterface,
  FetchCommentsParamsInterface,
  CommentItemInterface,
  CommentDrawerPropsInterface,
  FetchStateInterface,
  ReplyStateInterface,
  CommentFormInterface,
  CommentParamsStateInterface,
}

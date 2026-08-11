import type { ClientRequestOptions } from "@/server/services/client-request"
import { javaGet, javaPost } from "@/server/services/client-request"

import type {
  ActionMessagesInterface,
  FetchCommentListParamsInterface,
  FollowParamsInterface,
  LikeCommentParamsInterface,
  PostCommentParamsInterface,
} from "@/features/news/news.models"

function toastOptsFromMsg(
  msg?: ActionMessagesInterface
): Pick<
  ClientRequestOptions,
  "isMessageSuccess" | "messageSuccess" | "isMessageError" | "messageError"
> {
  return {
    isMessageSuccess: !!msg?.messageSuccess,
    messageSuccess: msg?.messageSuccess,
    isMessageError: !!msg?.messageError,
    messageError: msg?.messageError,
  }
}

const NEWS_SOCIAL_API = {
  FOLLOW: "/user/follow-user",
} as const

const NEWS_COMMENT_API = {
  LIST: "/news/news-comment",
  POST: "/news/comment-news",
  DELETE: "/news/remove-comment",
  LIKE: "/news/user-like",
} as const

function fetchCommentList(p: FetchCommentListParamsInterface): Promise<unknown | null> {
  return javaGet<unknown>(NEWS_COMMENT_API.LIST, {
    params: {
      newsId: p.newsId,
      pageIndex: p.pageIndex,
      pageSize: p.pageSize,
      commentType: p.commentType,
      loginUserId: p.loginUserId,
    },
  })
}

function handlePostComment(
  params: PostCommentParamsInterface,
  msg?: ActionMessagesInterface
): Promise<unknown | null> {
  return javaPost<unknown>(NEWS_COMMENT_API.POST, params, toastOptsFromMsg(msg))
}

function fetchDeleteComment(
  commentId: string,
  loginUserId: string,
  msg?: ActionMessagesInterface
): Promise<unknown | null> {
  return javaGet<unknown>(NEWS_COMMENT_API.DELETE, {
    params: { commentId, loginUserId },
    ...toastOptsFromMsg(msg),
  })
}

function handleLikeComment(params: LikeCommentParamsInterface): Promise<unknown | null> {
  return javaGet<unknown>(NEWS_COMMENT_API.LIKE, {
    params: {
      flag: "2",
      isLike: String(params.isLike),
      typeId: params.typeId,
      loginUserId: params.loginUserId,
    },
  })
}

function handleLikeNews(params: LikeCommentParamsInterface): Promise<unknown | null> {
  return javaGet<unknown>(NEWS_COMMENT_API.LIKE, {
    params: {
      flag: "1",
      isLike: String(params.isLike),
      typeId: params.typeId,
      loginUserId: params.loginUserId,
    },
  })
}

function handleFollowUser(params: FollowParamsInterface): Promise<void> {
  const { userId, isFollow, setFollowing, setLoading, messageSuccess } = params
  setLoading(true)
  return javaGet<unknown>(NEWS_SOCIAL_API.FOLLOW, {
    params: { isFollow, userId },
    isMessageError: true,
    isMessageSuccess: !!messageSuccess,
    messageSuccess,
  })
    .then((result) => {
      if (result !== null) setFollowing(isFollow)
    })
    .finally(() => setLoading(false))
}

export {
  fetchCommentList,
  handlePostComment,
  fetchDeleteComment,
  handleLikeComment,
  handleLikeNews,
  handleFollowUser,
}

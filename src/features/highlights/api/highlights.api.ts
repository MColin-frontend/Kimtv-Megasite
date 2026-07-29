import type { Dispatch, SetStateAction } from "react"

import { javaGet, javaPost } from "@/server/services/client-request"

import { FeedMenu } from "@/enums/highlights.enum"

import type {
  CommentItemInterface,
  CommentParamsStateInterface,
  CommentRecordInterface,
  FetchCommentsParamsInterface,
  FetchVideoFeedParamsInterface,
  HighlightVideoInterface,
  PostCommentPayloadInterface,
  VideoFeedResultInterface,
  VideoResultRawInterface,
} from "../highlight.models"
import { HIGHLIGHTS_API, PAGE_SIZE_COMMENT, VALID_MENUS } from "../highlights.constants"
import {
  buildPendingPlaceholder,
  buildVideoFeedFromRaw,
  collectKnownCommentIds,
  createPendingKey,
  normalizeCommentList,
  parseCommentListResult,
  pickPostedCommentRecord,
  removePendingByKey,
  replacePendingWithRecord,
  resolveLatestVideoFlagIndex,
  resolvePostedCommentId,
} from "../highlights.utils"

const EMPTY_FEED: VideoFeedResultInterface = { videos: [], hasMore: false }

function getLatestVideoFlagIndex(): Promise<number> {
  return javaGet<number[]>(HIGHLIGHTS_API.VIDEO.NEWS_TAB).then((tabs) =>
    tabs ? resolveLatestVideoFlagIndex(tabs) : 0
  )
}

async function fetchVideoFeed(
  params: FetchVideoFeedParamsInterface
): Promise<VideoFeedResultInterface> {
  const { status, page = 1, loginUserId = "" } = params
  const uid = loginUserId || ""

  switch (status) {
    case FeedMenu.Featured: {
      const data = await javaGet<VideoResultRawInterface>(HIGHLIGHTS_API.VIDEO.POPULAR, {
        params: { gameIds: "", loginUserId: uid },
      })
      return data ? buildVideoFeedFromRaw(FeedMenu.Featured, data) : EMPTY_FEED
    }
    case FeedMenu.Trending: {
      const data = await javaGet<VideoResultRawInterface>(HIGHLIGHTS_API.VIDEO.FEATURED, {
        params: { gameIds: "", loginUserId: uid },
      })
      return data ? buildVideoFeedFromRaw(FeedMenu.Trending, data) : EMPTY_FEED
    }
    case FeedMenu.Latest: {
      const flagIndex = await getLatestVideoFlagIndex()
      const data = await javaGet<VideoResultRawInterface>(
        HIGHLIGHTS_API.VIDEO.LATEST(flagIndex, page),
        { params: { tabType: flagIndex, type: "video", pageIndex: page, loginUserId: uid } }
      )
      return data ? buildVideoFeedFromRaw(FeedMenu.Latest, data) : EMPTY_FEED
    }
  }
}

function resolveInitialMenu(param: string | string[] | undefined): FeedMenu {
  const v = Array.isArray(param) ? param[0] : param
  return VALID_MENUS.includes(v ?? "") ? (v as FeedMenu) : FeedMenu.Featured
}

function toggleFollowAction(params: {
  userId: string | number
  setFollowMap: Dispatch<SetStateAction<Record<string, boolean>>>
  setVideos: Dispatch<SetStateAction<HighlightVideoInterface[]>>
  setFollowLoading: Dispatch<SetStateAction<boolean>>
  messageSuccess?: string
}): Promise<void> {
  const { userId, setFollowMap, setVideos, setFollowLoading, messageSuccess } = params
  const aid = String(userId)

  setFollowLoading(true)
  return javaGet<unknown>(HIGHLIGHTS_API.SOCIAL.FOLLOW, {
    params: { isFollow: true, userId: aid },
    isMessageError: true,
    isMessageSuccess: !!messageSuccess,
    messageSuccess,
  })
    .then((result) => {
      if (result === null) return
      setFollowMap((prev) => ({ ...prev, [aid]: true }))
      setVideos((prev) =>
        prev.map((v) => (String(v.authorId) === aid ? { ...v, hasFollow: true } : v))
      )
    })
    .finally(() => setFollowLoading(false))
}

function toggleLikeAction(params: {
  newsId: string
  isLike: boolean
  wasLiked: boolean
  loginUserId: string
  originalCount: number
  setLikedMap: Dispatch<SetStateAction<Record<string, boolean>>>
  setVideos: Dispatch<SetStateAction<HighlightVideoInterface[]>>
  setLikeLoading: Dispatch<SetStateAction<boolean>>
}): Promise<void> {
  const {
    newsId,
    isLike,
    wasLiked,
    loginUserId,
    originalCount,
    setLikedMap,
    setVideos,
    setLikeLoading,
  } = params

  setLikeLoading(true)
  setLikedMap((prev) => ({ ...prev, [newsId]: isLike }))
  setVideos((prev) =>
    prev.map((v) =>
      String(v.newsId ?? "") === newsId
        ? { ...v, isLike, likeCount: Math.max(0, originalCount + (isLike ? 1 : -1)) }
        : v
    )
  )

  const rollback = () => {
    setLikedMap((prev) => ({ ...prev, [newsId]: wasLiked }))
    setVideos((prev) =>
      prev.map((v) =>
        String(v.newsId ?? "") === newsId ? { ...v, isLike: wasLiked, likeCount: originalCount } : v
      )
    )
  }

  return javaGet<unknown>(HIGHLIGHTS_API.VIDEO.LIKE, {
    params: { flag: 1, typeId: newsId, isLike, loginUserId: loginUserId || "" },
  })
    .then((result) => {
      if (result === null) rollback()
    })
    .catch(() => rollback())
    .finally(() => setLikeLoading(false))
}

function fetchComments(params: FetchCommentsParamsInterface): Promise<void> {
  const {
    newsId,
    page,
    loginUserId,
    commentType,
    pageSize = PAGE_SIZE_COMMENT,
    setComments,
    setParams,
  } = params

  return javaGet<unknown>(HIGHLIGHTS_API.COMMENT.LIST, {
    params: { newsId, pageIndex: page, loginUserId: loginUserId || "", pageSize, commentType },
  })
    .then((result) => {
      if (result == null) return
      const { records, total } = parseCommentListResult(result)
      const list = normalizeCommentList(records as unknown[])
      if (page === 0) {
        setComments((prev) => {
          const pending = prev.filter((c) => c._pending)
          return pending.length ? [...list, ...pending] : list
        })
      } else {
        setComments((prev) => {
          const existingIds = new Set(prev.map((c) => Number(c.ncid)))
          const fresh = list.filter((c) => !existingIds.has(Number(c.ncid)))
          return fresh.length ? [...prev, ...fresh] : prev
        })
      }
      setParams((s) => ({ ...s, total }))
    })
    .finally(() => setParams((s) => ({ ...s, isLoading: false, isLoadingMore: false })))
}

async function postComment(params: {
  payload: PostCommentPayloadInterface
  loginUserId: string
  userProfile: { userName?: string; avatar?: string }
  total: number
  setComments: Dispatch<SetStateAction<CommentItemInterface[]>>
  setParams: Dispatch<SetStateAction<CommentParamsStateInterface>>
  onCountChange?: (count: number) => void
  messageSuccess?: string
  messageError?: string
  parentNcid?: number
  replyUserName?: string
}): Promise<boolean> {
  const {
    payload,
    loginUserId,
    userProfile,
    total,
    setComments,
    setParams,
    onCountChange,
    messageSuccess,
    messageError,
    parentNcid,
    replyUserName,
  } = params

  const content = payload.content
  const clientKey = createPendingKey()
  const placeholder = buildPendingPlaceholder({
    clientKey,
    content,
    replyUserName,
    userName: userProfile.userName,
    avatar: userProfile.avatar,
  })

  let knownIds = new Set<number>()
  setComments((prev) => {
    knownIds = collectKnownCommentIds(prev)
    return prev
  })

  if (parentNcid) {
    setComments((prev) =>
      prev.map((c) =>
        Number(c.ncid) === parentNcid ? { ...c, children: [...(c.children ?? []), placeholder] } : c
      )
    )
  } else {
    setComments((prev) => [...prev, placeholder])
  }

  setParams((s) => ({ ...s, total: s.total + 1 }))
  onCountChange?.(total + 1)

  try {
    const result = await javaPost<unknown>(HIGHLIGHTS_API.COMMENT.POST, payload, {
      isMessageError: !!messageError,
      messageError,
      isMessageSuccess: !!messageSuccess,
      messageSuccess,
    })
    if (result === null) {
      rollback()
      return false
    }

    const postedId = resolvePostedCommentId(result)

    const tryHydrate = (): Promise<boolean> =>
      javaGet<unknown>(HIGHLIGHTS_API.COMMENT.LIST, {
        params: {
          newsId: payload.mainNewsId,
          pageIndex: 0,
          loginUserId: loginUserId || "",
          pageSize: PAGE_SIZE_COMMENT,
          commentType: payload.commentType,
        },
      }).then((listResult) => {
        if (listResult == null) return false

        const { records } = parseCommentListResult(listResult)
        const list = normalizeCommentList(records as unknown[])

        let record: CommentRecordInterface | null = null
        if (parentNcid) {
          const parent = list.find((c) => Number(c.ncid) === parentNcid)
          record = pickPostedCommentRecord(
            parent?.children ?? [],
            content,
            postedId,
            knownIds,
            loginUserId
          )
        } else {
          record = pickPostedCommentRecord(list, content, postedId, knownIds, loginUserId)
        }

        if (!record?.ncid) return false

        const finalRecord = record
        setComments((prev) => {
          const { comments: next, replaced } = replacePendingWithRecord(
            prev,
            clientKey,
            finalRecord,
            parentNcid
          )
          return replaced ? next : prev
        })
        return true
      })

    const hydrated = await tryHydrate()
    if (!hydrated) setComments((prev) => removePendingByKey(prev, clientKey))

    return true
  } catch {
    rollback()
    return false
  }

  function rollback() {
    setComments((prev) => removePendingByKey(prev, clientKey))
    setParams((s) => ({ ...s, total: Math.max(0, s.total - 1) }))
    onCountChange?.(Math.max(0, total))
  }
}

function likeComment(params: {
  commentId: string | number
  isLike: boolean
  loginUserId: string
}): Promise<boolean> {
  return javaGet<unknown>(HIGHLIGHTS_API.VIDEO.LIKE, {
    params: {
      flag: 2,
      isLike: params.isLike,
      loginUserId: params.loginUserId || "",
      typeId: params.commentId,
    },
  }).then((result) => result !== null)
}

function deleteComment(params: {
  commentId: string | number
  loginUserId: string
  total: number
  setComments: Dispatch<SetStateAction<CommentItemInterface[]>>
  setParams: Dispatch<SetStateAction<CommentParamsStateInterface>>
  onCountChange?: (count: number) => void
  messageSuccess?: string
  messageError?: string
}): Promise<void> {
  const {
    commentId,
    loginUserId,
    total,
    setComments,
    setParams,
    onCountChange,
    messageSuccess,
    messageError,
  } = params

  let removed: CommentItemInterface[] | null = null
  setComments((prev) => {
    removed = prev
    return prev
      .filter((c) => Number(c.ncid) !== Number(commentId))
      .map((c) => ({
        ...c,
        children: (c.children ?? []).filter((r) => Number(r.ncid) !== Number(commentId)),
      }))
  })
  setParams((s) => ({ ...s, total: Math.max(0, s.total - 1) }))
  onCountChange?.(total - 1)

  return javaGet<unknown>(HIGHLIGHTS_API.COMMENT.DELETE, {
    params: { commentId, loginUserId: loginUserId || "" },
    isMessageError: !!messageError,
    messageError,
    isMessageSuccess: !!messageSuccess,
    messageSuccess,
  }).then((result) => {
    if (result !== null) return
    if (removed !== null) setComments(removed)
    setParams((s) => ({ ...s, total: s.total + 1 }))
    onCountChange?.(total)
  })
}

export {
  deleteComment,
  fetchComments,
  fetchVideoFeed,
  likeComment,
  postComment,
  resolveInitialMenu,
  toggleFollowAction,
  toggleLikeAction,
}

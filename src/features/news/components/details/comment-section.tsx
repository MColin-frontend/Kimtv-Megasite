"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MessageCircle, X } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"

import { useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"

import { CommentCard } from "@/features/highlights/components/comment-drawer/comment-card"
import {
  CommentListSkeleton,
  CommentLoadMoreSkeleton,
  CommentPendingSkeleton,
} from "@/features/highlights/components/skeleton"
import type { CommentRecordInterface } from "@/features/highlights/highlight.models"
import { PAGE_SIZE_COMMENT as PAGE_SIZE } from "@/features/highlights/highlights.constants"
import {
  buildPendingPlaceholder,
  collectKnownCommentIds,
  createPendingKey,
  normalizeCommentList,
  pickPostedCommentRecord,
  removePendingByKey,
  replacePendingWithRecord,
  resolveIsLiked,
  resolvePostedCommentId,
} from "@/features/highlights/highlights.utils"
import {
  fetchCommentList,
  fetchDeleteComment,
  handleLikeComment,
  handlePostComment,
} from "@/features/news/news.api"
import {
  extractRecords,
  ncidNum,
  normalizePostedRecord,
  resolveProfileId,
} from "@/features/news/news.constants"
import type { NewsComment } from "@/features/news/news.models"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { MessageInput } from "@/components/ui/message-input"
import { Typography } from "@/components/ui/typography"

interface CommentSectionProps {
  newsId: string | number
  newsType?: number
  initialCount?: number
  onCountChange?: (count: number) => void
}

export function CommentSection({
  newsId,
  newsType = 1,
  initialCount = 0,
  onCountChange,
}: CommentSectionProps) {
  const { t, locale } = useTranslation()
  const routes = getRoutes(locale)
  const { user, isLoggedIn, isLoading: authLoading, login } = useAuth()

  const [comments, setComments] = useState<NewsComment[]>([])
  const [total, setTotal] = useState(initialCount)
  const pageRef = useRef(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [replyParent, setReplyParent] = useState<NewsComment | null>(null)
  const [replyTo, setReplyTo] = useState<NewsComment | null>(null)
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [likeBusy, setLikeBusy] = useState<Record<string, boolean>>({})
  const [commentText, setCommentText] = useState("")
  const [replyText, setReplyText] = useState("")

  const loginUserId = user?.userId != null ? String(user.userId) : user?.uid ? String(user.uid) : ""

  const emitTotal = useCallback(
    (updater: number | ((prev: number) => number)) => {
      setTotal((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        onCountChange?.(next)
        return next
      })
    },
    [onCountChange]
  )

  const fetchPage = useCallback(
    (page: number): Promise<NewsComment[]> => {
      return fetchCommentList({
        newsId: String(newsId),
        pageIndex: page,
        pageSize: PAGE_SIZE,
        commentType: newsType,
        loginUserId,
      }).then((result) => {
        return normalizeCommentList(extractRecords(result)) as NewsComment[]
      })
    },
    [newsId, newsType, loginUserId]
  )

  const loadComments = useCallback(
    (reset: boolean, { silent = false }: { silent?: boolean } = {}): Promise<void> => {
      if (reset) {
        if (!silent) {
          setLoading(true)
          setComments([])
          setHasMore(false)
        }
        pageRef.current = 0
        return fetchPage(0)
          .then((list) => {
            setComments(list)
            pageRef.current = 1
            setHasMore(list.length >= PAGE_SIZE)
          })
          .catch(() => {
            if (!silent) setHasMore(false)
          })
          .finally(() => {
            setLoading(false)
            setLoadingMore(false)
          })
      }

      setLoadingMore(true)
      return fetchPage(pageRef.current)
        .then((list) => {
          setComments((prev) => [...prev, ...list])
          pageRef.current += 1
          setHasMore(list.length >= PAGE_SIZE)
        })
        .catch(() => setHasMore(false))
        .finally(() => setLoadingMore(false))
    },
    [fetchPage]
  )

  useEffect(() => {
    let cancelled = false
    pageRef.current = 0

    void (async () => {
      setLoading(true)
      setComments([])
      try {
        const list = await fetchPage(0)
        if (cancelled) return
        setComments(list)
        pageRef.current = 1
        setHasMore(list.length >= PAGE_SIZE)
      } catch {
        if (!cancelled) setHasMore(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [fetchPage])

  async function hydratePending(
    clientKey: string,
    content: string,
    postResult: unknown,
    knownIds: Set<number>,
    parentNcid?: number,
    replyUserName?: string
  ): Promise<boolean> {
    const postedId = resolvePostedCommentId(postResult)

    const resolveRecord = async (): Promise<NewsComment | null> => {
      const freshList = await fetchPage(0)
      const pool = parentNcid
        ? (freshList.find((c) => ncidNum(c.ncid) === parentNcid)?.children ?? [])
        : freshList
      const fromList = pickPostedCommentRecord(
        pool as Parameters<typeof pickPostedCommentRecord>[0],
        content,
        postedId,
        knownIds,
        loginUserId
      )
      if (fromList?.ncid) return fromList as NewsComment
      return normalizePostedRecord(postResult, content, replyUserName ?? "", loginUserId, {
        name: user?.name,
        avatar: user?.avatar as string | undefined,
      })
    }

    let record = await resolveRecord()
    if (!record?.ncid) {
      await new Promise((r) => setTimeout(r, 500))
      record = await resolveRecord()
    }

    if (record?.ncid) {
      setComments((prev) => {
        const { comments: next, replaced } = replacePendingWithRecord(
          prev as Parameters<typeof replacePendingWithRecord>[0],
          clientKey,
          record as Parameters<typeof replacePendingWithRecord>[2],
          parentNcid
        )
        return replaced ? (next as NewsComment[]) : prev
      })
      return true
    }

    setComments(
      (prev) =>
        removePendingByKey(
          prev as Parameters<typeof removePendingByKey>[0],
          clientKey
        ) as NewsComment[]
    )
    return false
  }

  function rollbackPending(clientKey: string) {
    setComments(
      (prev) =>
        removePendingByKey(
          prev as Parameters<typeof removePendingByKey>[0],
          clientKey
        ) as NewsComment[]
    )
    emitTotal((n) => Math.max(0, n - 1))
  }

  async function submitComment(content: string) {
    if (!content || submitting || !loginUserId) return

    const clientKey = createPendingKey()
    const knownIds = collectKnownCommentIds(
      comments as Parameters<typeof collectKnownCommentIds>[0]
    )
    const pending = buildPendingPlaceholder({
      clientKey,
      content,
      userName: user?.name,
      avatar: user?.avatar as string | undefined,
    })

    setComments((prev) => [...prev, pending as NewsComment])
    emitTotal((n) => n + 1)
    setSubmitting(true)

    return handlePostComment(
      {
        commentType: newsType,
        content,
        mainNewsId: Number(newsId),
        topFloorId: 0,
        userSourceId: loginUserId,
      },
      {
        messageSuccess: t("video.comment.post-success"),
        messageError: t("video.comment.post-error"),
      }
    )
      .then((result) => {
        if (result != null) {
          return hydratePending(clientKey, content, result, knownIds).then((hydrated) => {
            if (!hydrated) return loadComments(true, { silent: true })
          })
        }
        rollbackPending(clientKey)
        setCommentText(content)
      })
      .catch(() => {
        rollbackPending(clientKey)
        setCommentText(content)
      })
      .finally(() => setSubmitting(false))
  }

  async function submitReply(content: string) {
    if (!content || replySubmitting || !replyParent || !replyTo || !loginUserId) return

    const parentNcid = ncidNum(replyParent.ncid)
    const replyUserName = replyTo.userName ?? ""
    const clientKey = createPendingKey()
    const knownIds = collectKnownCommentIds(
      comments as Parameters<typeof collectKnownCommentIds>[0]
    )
    const pending = buildPendingPlaceholder({
      clientKey,
      content,
      replyUserName,
      userName: user?.name,
      avatar: user?.avatar as string | undefined,
    })

    setComments((prev) =>
      prev.map((c) =>
        ncidNum(c.ncid) === parentNcid
          ? { ...c, children: [...(c.children ?? []), pending as NewsComment] }
          : c
      )
    )
    emitTotal((n) => n + 1)
    setReplySubmitting(true)

    return handlePostComment(
      {
        commentType: newsType,
        content,
        mainNewsId: Number(newsId),
        topFloorId: parentNcid,
        replyToCommentId: ncidNum(replyTo.ncid),
        replyToUserSourceId: replyTo.userSourceId,
        userSourceId: loginUserId,
      },
      {
        messageSuccess: t("video.comment.reply-success"),
        messageError: t("video.comment.post-error"),
      }
    )
      .then((result) => {
        if (result != null) {
          return hydratePending(
            clientKey,
            content,
            result,
            knownIds,
            parentNcid,
            replyUserName
          ).then((hydrated) => {
            if (!hydrated) return loadComments(true, { silent: true })
          })
        }
        rollbackPending(clientKey)
        setReplyText(content)
      })
      .catch(() => {
        rollbackPending(clientKey)
        setReplyText(content)
      })
      .finally(() => setReplySubmitting(false))
  }

  function handleCommentSubmit() {
    const content = commentText.trim()
    if (!content) return
    setCommentText("")
    submitComment(content)
  }

  function handleReplySubmit() {
    const content = replyText.trim()
    if (!content) return
    setReplyText("")
    submitReply(content)
  }

  function handleDeleteComment(item: NewsComment) {
    if (!item.ncid) return
    const id = ncidNum(item.ncid)
    return fetchDeleteComment(String(item.ncid), loginUserId, {
      messageSuccess: t("video.comment.delete-success"),
    }).then((result) => {
      if (result === null) return
      emitTotal((n) => Math.max(0, n - 1))
      setComments((prev) => {
        let removed = false
        const next = prev.map((c) => {
          const filtered = (c.children ?? []).filter((r) => ncidNum(r.ncid) !== id)
          if (filtered.length !== (c.children ?? []).length) {
            removed = true
            return { ...c, children: filtered }
          }
          return c
        })
        return removed ? next : next.filter((c) => ncidNum(c.ncid) !== id)
      })
    })
  }

  function handleLike(item: NewsComment, parentNcid?: string | number) {
    if (!loginUserId) {
      login()
      return
    }
    const id = String(item.ncid)
    if (likeBusy[id]) return
    const isLike = !resolveIsLiked(item.isLike)
    setLikeBusy((prev) => ({ ...prev, [id]: true }))

    const updateItem = (c: NewsComment): NewsComment =>
      String(c.ncid) === id
        ? { ...c, isLike, likeCount: Math.max(0, (Number(c.likeCount) || 0) + (isLike ? 1 : -1)) }
        : c

    if (parentNcid) {
      setComments((prev) =>
        prev.map((c) =>
          ncidNum(c.ncid) === Number(parentNcid)
            ? { ...c, children: (c.children ?? []).map(updateItem) }
            : c
        )
      )
    } else {
      setComments((prev) => prev.map((c) => (String(c.ncid) === id ? updateItem(c) : c)))
    }

    handleLikeComment({ typeId: id, isLike, loginUserId })
      .then((result) => {
        if (result === null) {
          const rollbackItem = (c: NewsComment): NewsComment =>
            String(c.ncid) === id
              ? {
                  ...c,
                  isLike: !isLike,
                  likeCount: Math.max(0, (Number(c.likeCount) || 0) + (isLike ? -1 : 1)),
                }
              : c
          if (parentNcid) {
            setComments((prev) =>
              prev.map((c) =>
                ncidNum(c.ncid) === Number(parentNcid)
                  ? { ...c, children: (c.children ?? []).map(rollbackItem) }
                  : c
              )
            )
          } else {
            setComments((prev) => prev.map((c) => (String(c.ncid) === id ? rollbackItem(c) : c)))
          }
        }
      })
      .finally(() => setLikeBusy((prev) => ({ ...prev, [id]: false })))
  }

  function openReply(parent: NewsComment, item?: NewsComment) {
    if (!loginUserId) {
      login()
      return
    }
    setReplyParent(parent)
    setReplyTo(item ?? parent)
    setReplyText("")
  }

  function closeReply() {
    setReplyParent(null)
    setReplyTo(null)
    setReplyText("")
  }

  const isOwn = (c: NewsComment) =>
    isLoggedIn && !!loginUserId && String(c.userSourceId) === loginUserId

  function renderCard(item: NewsComment, parentComment?: NewsComment) {
    if (item._pending) {
      return <CommentPendingSkeleton key={item._clientKey} size={parentComment ? "sm" : "md"} />
    }

    const profileId = resolveProfileId(item)
    const isReply = !!parentComment

    return (
      <CommentCard
        key={String(item.ncid)}
        item={item as CommentRecordInterface}
        isReply={isReply}
        userInfoHref={profileId ? routes.userInfo(profileId) : null}
        onNavigate={() => {}}
        likeBusy={!!likeBusy[String(item.ncid)]}
        onLike={() => handleLike(item, parentComment?.ncid)}
        isLoggedIn={isLoggedIn}
        isOwn={isOwn(item)}
        onReply={parentComment ? () => openReply(parentComment, item) : () => openReply(item)}
        onDelete={() => handleDeleteComment(item)}
        replyLabel={t("video.comment.reply")}
        deleteLabel={t("video.comment.delete")}
      />
    )
  }

  return (
    <div className="card-glow rounded-12 panel-news flex flex-col gap-0 p-4">
      <div className="flex items-center gap-2 pb-3">
        <MessageCircle className="size-5 text-white/60" />
        <Typography variant="h2" className="text-white">
          {t("news.comment.title")}
        </Typography>
        <span className="text-[13px] text-white/40">({total})</span>
      </div>

      <div>
        {loading && !comments.length ? (
          <CommentListSkeleton count={4} />
        ) : comments.length === 0 ? (
          <Empty tip={t("video.comment.empty")} />
        ) : (
          <div className="flex flex-col gap-1">
            {comments.map((c) => (
              <div
                key={String(c.ncid)}
                className="group/comment rounded-6 -mx-1 px-1 py-2 transition-colors hover:bg-white/[0.03]"
              >
                {renderCard(c)}

                {(c.children ?? []).length > 0 && (
                  <div className="mt-3 ml-[18px] flex flex-col gap-3 border-l border-white/10 pl-3">
                    {(c.children ?? []).map((r) => (
                      <div key={String(r.ncid)}>{renderCard(r, c)}</div>
                    ))}
                  </div>
                )}

                {replyParent && ncidNum(replyParent.ncid) === ncidNum(c.ncid) && (
                  <div className="mt-2 ml-[52px] flex items-center gap-1.5">
                    <MessageInput
                      value={replyText}
                      onChange={setReplyText}
                      onSubmit={handleReplySubmit}
                      placeholder={`@${replyTo?.userName ?? ""}`}
                      loading={replySubmitting}
                      size="sm"
                      className="min-w-0 flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeReply}
                      className="size-7 shrink-0 rounded-full text-white/35 hover:text-white/60"
                      aria-label="Cancel reply"
                    >
                      <X size={13} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {loadingMore && (
          <div className="py-3">
            <CommentLoadMoreSkeleton />
          </div>
        )}

        {hasMore && !loadingMore && (
          <div className="flex justify-center pt-3">
            <button
              type="button"
              onClick={() => loadComments(false)}
              className="font-600 flex items-center gap-1.5 rounded-full bg-[rgba(255,210,32,0.1)] px-4 py-1.5 text-[13px] text-[#ffd220] transition-colors hover:bg-[rgba(255,210,32,0.18)]"
            >
              {t("news.comment.view-more")}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 border-t border-white/6 pt-3">
        {!authLoading && (
          <MessageInput
            value={commentText}
            onChange={setCommentText}
            onSubmit={handleCommentSubmit}
            placeholder={
              isLoggedIn ? t("video.comment.placeholder") : t("video.comment.login-prompt")
            }
            loading={submitting}
          />
        )}
      </div>
    </div>
  )
}

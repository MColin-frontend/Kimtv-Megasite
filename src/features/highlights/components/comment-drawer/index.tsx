"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Drawer } from "@base-ui/react/drawer"
import { Image, Smile, X } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"

import { useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"

import type {
  CommentDrawerPropsInterface,
  CommentRecordInterface,
} from "@/features/highlights/highlight.models"
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
import { extractRecords, ncidNum, normalizePostedRecord } from "@/features/news/news.constants"
import type { NewsComment } from "@/features/news/news.models"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { MessageInput } from "@/components/ui/message-input"
import { Typography } from "@/components/ui/typography"

import { CommentListSkeleton, CommentLoadMoreSkeleton } from "../skeleton"
import { CommentCard } from "./comment-card"

export function CommentDrawer({
  newsId,
  newsType = 3,
  commentCount = 0,
  onClose,
  onCountChange,
}: CommentDrawerPropsInterface) {
  const { t, locale } = useTranslation()
  const routes = getRoutes(locale)
  const { user, isLoggedIn, login } = useAuth()

  const [comments, setComments] = useState<NewsComment[]>([])
  const [total, setTotal] = useState(commentCount)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [replyText, setReplyText] = useState("")
  const [replyParent, setReplyParent] = useState<NewsComment | null>(null)
  const [replyTo, setReplyTo] = useState<NewsComment | null>(null)
  const [likeBusy, setLikeBusy] = useState<Record<string, boolean>>({})

  const pageRef = useRef(0)
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
    (page: number): Promise<NewsComment[]> =>
      fetchCommentList({
        newsId: String(newsId),
        pageIndex: page,
        pageSize: PAGE_SIZE,
        commentType: newsType,
        loginUserId,
      }).then((result) => normalizeCommentList(extractRecords(result)) as NewsComment[]),
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

    fetchPage(0)
      .then((list) => {
        if (cancelled) return
        setComments(list)
        pageRef.current = 1
        setHasMore(list.length >= PAGE_SIZE)
      })
      .catch(() => {
        if (!cancelled) setHasMore(false)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

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

  function handleDeleteComment(item: CommentRecordInterface) {
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

  function handleLike(item: CommentRecordInterface, parentNcid?: string | number) {
    if (!isLoggedIn) {
      login()
      return
    }
    const id = String(item.ncid)
    if (likeBusy[id]) return
    const isLike = !resolveIsLiked(item.isLike)
    setLikeBusy((prev) => ({ ...prev, [id]: true }))

    const updateItem = (c: CommentRecordInterface) =>
      String(c.ncid) === id
        ? { ...c, isLike, likeCount: Math.max(0, (Number(c.likeCount) || 0) + (isLike ? 1 : -1)) }
        : c

    const rollbackItem = (c: CommentRecordInterface) =>
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
          Number(c.ncid) === Number(parentNcid)
            ? { ...c, children: (c.children ?? []).map(updateItem) as NewsComment[] }
            : c
        )
      )
    } else {
      setComments((prev) =>
        prev.map((c) => (String(c.ncid) === id ? (updateItem(c) as NewsComment) : c))
      )
    }

    return handleLikeComment({ isLike, typeId: String(item.ncid), loginUserId })
      .then((result) => {
        if (result !== null) return
        if (parentNcid) {
          setComments((prev) =>
            prev.map((c) =>
              Number(c.ncid) === Number(parentNcid)
                ? { ...c, children: (c.children ?? []).map(rollbackItem) as NewsComment[] }
                : c
            )
          )
        } else {
          setComments((prev) =>
            prev.map((c) => (String(c.ncid) === id ? (rollbackItem(c) as NewsComment) : c))
          )
        }
      })
      .finally(() => setLikeBusy((prev) => ({ ...prev, [id]: false })))
  }

  function isOwn(item: CommentRecordInterface) {
    return isLoggedIn && !!loginUserId && String(item.userSourceId) === loginUserId
  }

  function openReply(parent: NewsComment, item?: NewsComment) {
    setReplyParent(parent)
    setReplyTo(item ?? parent)
    setReplyText("")
  }

  function closeReply() {
    setReplyParent(null)
    setReplyTo(null)
    setReplyText("")
  }

  function renderCard(item: CommentRecordInterface, parentComment?: NewsComment) {
    const profileId = item.userSourceId && item.userSourceId !== "0" ? item.userSourceId : null
    const isReply = !!parentComment
    return (
      <CommentCard
        item={item}
        isReply={isReply}
        userInfoHref={profileId ? routes.userInfo(profileId) : null}
        onNavigate={onClose}
        likeBusy={!!likeBusy[String(item.ncid)]}
        onLike={() => handleLike(item, parentComment?.ncid)}
        isLoggedIn={isLoggedIn}
        isOwn={!!isOwn(item)}
        onReply={
          parentComment
            ? () => openReply(parentComment, item as NewsComment)
            : () => openReply(item as NewsComment)
        }
        onDelete={() => handleDeleteComment(item)}
        replyLabel={t("video.comment.reply")}
      />
    )
  }

  return (
    <Drawer.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      modal
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" />

        <Drawer.Viewport className="fixed inset-0 z-50 flex justify-end">
          <Drawer.Popup className="card-glow panel-news flex h-full w-full max-w-[550px] flex-col shadow-2xl transition-transform duration-300 ease-out outline-none data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
            {/* Header */}
            <header className="shrink-0 px-5 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Typography as="h3" variant="h6" weight="600" className="text-white">
                    {t("video.comment.title")}
                  </Typography>
                  {total > 0 && (
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs font-medium text-white/50">
                      {total}
                    </span>
                  )}
                </div>
                <Drawer.Close
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Close"
                      className="size-8 rounded-full text-white/40 hover:bg-white/8 hover:text-white"
                    >
                      <X size={16} />
                    </Button>
                  }
                />
              </div>
            </header>
            <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

            {/* Comment list */}
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-2">
              {loading ? (
                <CommentListSkeleton />
              ) : !comments.length ? (
                <Empty tip={t("video.comment.empty")} imageSize={140} className="h-full flex-1" />
              ) : (
                <div className="flex flex-col">
                  {comments.map((c) => (
                    <div
                      key={String(c.ncid)}
                      className="group/comment rounded-6 p-2 transition-colors hover:bg-white/[0.03]"
                    >
                      {renderCard(c)}

                      {/* Replies */}
                      {(c.children ?? []).length > 0 && (
                        <div className="mt-3 ml-[18px] flex flex-col gap-3 border-l border-white/10 pl-3">
                          {(c.children ?? []).map((r) => (
                            <div key={String(r.ncid)}>{renderCard(r, c)}</div>
                          ))}
                        </div>
                      )}

                      {/* Inline reply input */}
                      {replyParent && ncidNum(replyParent.ncid) === ncidNum(c.ncid) && (
                        <div className="mt-2 ml-[52px] flex items-center gap-1.5">
                          <MessageInput
                            value={replyText}
                            onChange={setReplyText}
                            onSubmit={handleReplySubmit}
                            placeholder={`@${replyTo?.userName ?? ""}`}
                            loading={replySubmitting}
                            size="sm"
                            className="flex-1"
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

                  {loadingMore && (
                    <div className="py-3">
                      <CommentLoadMoreSkeleton />
                    </div>
                  )}

                  {!loadingMore && hasMore && (
                    <button
                      onClick={() => loadComments(false)}
                      className="text-gold/70 hover:text-gold mx-auto mt-1 mb-3 flex items-center gap-1.5 text-xs font-medium transition-all"
                    >
                      {t("video.comment.load-more")}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-white/[0.06] p-4">
              <MessageInput
                value={commentText}
                onChange={setCommentText}
                onSubmit={handleCommentSubmit}
                placeholder={
                  isLoggedIn ? t("video.comment.placeholder") : t("video.comment.login-prompt")
                }
                loading={submitting}
                leftIcons={
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-full text-white/40 transition-colors hover:text-white/70"
                      aria-label="Emoji"
                    >
                      <Smile size={18} />
                    </button>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-full text-white/40 transition-colors hover:text-white/70"
                      aria-label="Attach image"
                    >
                      <Image size={18} />
                    </button>
                  </div>
                }
              />
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

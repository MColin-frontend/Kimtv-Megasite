"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Drawer } from "@base-ui/react/drawer"
import { X } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"

import { useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"
import { CommentType } from "@/enums/common.enum"

import {
  deleteComment,
  fetchComments,
  likeComment,
  postComment,
} from "@/features/highlights/api/highlights.api"
import type {
  CommentDrawerPropsInterface,
  CommentFormInterface,
  CommentItemInterface,
  CommentParamsStateInterface,
  CommentRecordInterface,
  ReplyStateInterface,
} from "@/features/highlights/highlight.models"
import { resolveIsLiked } from "@/features/highlights/highlights.utils"
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
  const { user, isLoggedIn } = useAuth()

  const [comments, setComments] = useState<CommentItemInterface[]>([])
  const [params, setParams] = useState<CommentParamsStateInterface>({
    isLoading: true,
    isLoadingMore: false,
    total: commentCount,
    page: 0,
  })
  const [reply, setReply] = useState<ReplyStateInterface>({
    parent: null,
    to: null,
  })
  const [likeBusy, setLikeBusy] = useState<Record<string, boolean>>({})

  const loginUserId = user?.uid ? String(user.uid) : ""
  const commentType = newsType
  const newsIdRef = useRef(newsId)
  const loginUserIdRef = useRef(loginUserId)
  const commentTypeRef = useRef(commentType)
  const isPostingRef = useRef(false)
  const { isLoading, isLoadingMore, total, page } = params

  const {
    control,
    handleSubmit: handleMainSubmit,
    reset: resetMain,
    formState: { isSubmitting },
  } = useForm<CommentFormInterface>({ defaultValues: { content: "" } })

  const {
    control: controlReply,
    handleSubmit: handleReplySubmit,
    reset: resetReply,
    formState: { isSubmitting: isReplySubmitting },
  } = useForm<CommentFormInterface>({ defaultValues: { content: "" } })

  const handleFetchComment = useCallback((page: number) => {
    return fetchComments({
      newsId: newsIdRef.current,
      page,
      loginUserId: loginUserIdRef.current,
      commentType: commentTypeRef.current,
      setComments,
      setParams,
    })
  }, [])

  useEffect(() => {
    handleFetchComment(page)
  }, [handleFetchComment, page])

  // function handleLoadMoreComments() {
  //   setParams((s) => ({ ...s, page: s.page + 1, isLoadingMore: true }))
  // }

  function handleSubmit({ content: text }: CommentFormInterface, type: CommentType) {
    const trimmed = text.trim()
    if (isPostingRef.current || !trimmed) return
    isPostingRef.current = true

    const { parent, to } = reply

    return postComment({
      payload: {
        commentType,
        content: trimmed,
        mainNewsId: Number(newsIdRef.current),
        userSourceId: loginUserId,
        topFloorId: type === CommentType.REPLY ? Number(parent!.ncid) : 0,
        ...(type === CommentType.REPLY && {
          replyToCommentId: Number(to!.ncid),
          replyToUserSourceId: to!.userSourceId,
        }),
      },
      loginUserId,
      userProfile: { userName: user?.name, avatar: user?.avatar },
      total,
      setComments,
      setParams,
      onCountChange,
      messageSuccess: t(
        type === CommentType.REPLY ? "video.comment.reply-success" : "video.comment.post-success"
      ),
      messageError: t("video.comment.post-error"),
      parentNcid: type === CommentType.REPLY ? Number(parent!.ncid) : undefined,
      replyUserName: type === CommentType.REPLY ? (to?.userName ?? "") : undefined,
    })
      .then((ok) => {
        if (!ok) return
        if (type === CommentType.REPLY) {
          closeReply()
        } else {
          resetMain({ content: "" })
        }
      })
      .finally(() => {
        isPostingRef.current = false
      })
  }

  function handleRemoveComment(item: CommentRecordInterface) {
    if (!item.ncid) return
    return deleteComment({
      commentId: item.ncid,
      loginUserId,
      total,
      setComments,
      setParams,
      onCountChange,
      messageSuccess: t("video.comment.delete-success"),
      messageError: t("video.comment.delete-error"),
    })
  }

  function handleLikeComment(item: CommentRecordInterface, parentNcid?: string | number) {
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
            ? { ...c, children: (c.children ?? []).map(updateItem) }
            : c
        )
      )
    } else {
      setComments((prev) =>
        prev.map((c) => (String(c.ncid) === id ? (updateItem(c) as CommentItemInterface) : c))
      )
    }

    return likeComment({ commentId: item.ncid, isLike, loginUserId })
      .then((ok) => {
        if (ok) return
        if (parentNcid) {
          setComments((prev) =>
            prev.map((c) =>
              Number(c.ncid) === Number(parentNcid)
                ? { ...c, children: (c.children ?? []).map(rollbackItem) }
                : c
            )
          )
        } else {
          setComments((prev) =>
            prev.map((c) => (String(c.ncid) === id ? (rollbackItem(c) as CommentItemInterface) : c))
          )
        }
      })
      .finally(() => setLikeBusy((prev) => ({ ...prev, [id]: false })))
  }

  function isOwn(item: CommentRecordInterface) {
    return isLoggedIn && loginUserId && String(item.userSourceId) === loginUserId
  }

  function openReply(parent: CommentItemInterface, item?: CommentRecordInterface) {
    setReply({ parent, to: item ?? parent })

    resetReply()
  }

  function closeReply() {
    setReply({ parent: null, to: null })
    resetReply()
  }

  function renderCard(item: CommentRecordInterface, parentComment?: CommentItemInterface) {
    const profileId = item.userSourceId && item.userSourceId !== "0" ? item.userSourceId : null
    const isReply = !!parentComment
    return (
      <CommentCard
        item={item}
        isReply={isReply}
        userInfoHref={profileId ? routes.userInfo(profileId) : null}
        onNavigate={onClose}
        likeBusy={!!likeBusy[String(item.ncid)]}
        onLike={() => handleLikeComment(item, parentComment?.ncid)}
        isLoggedIn={isLoggedIn}
        isOwn={!!isOwn(item)}
        onReply={
          parentComment
            ? () => openReply(parentComment, item)
            : () => openReply(item as CommentItemInterface)
        }
        onDelete={() => handleRemoveComment(item)}
        replyLabel={t("video.comment.reply")}
        deleteLabel={t("video.comment.delete")}
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
              {isLoading ? (
                <CommentListSkeleton />
              ) : !comments.length ? (
                <Empty tip={t("video.comment.empty")} imageSize={140} className="h-full flex-1" />
              ) : (
                <div className="flex flex-col">
                  {comments?.map((c) => (
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
                      {reply.parent && Number(reply.parent.ncid) === Number(c.ncid) && (
                        <div className="mt-2 ml-[52px] flex items-center gap-1.5">
                          <Controller
                            name="content"
                            control={controlReply}
                            render={({ field }) => (
                              <MessageInput
                                value={field.value}
                                onChange={field.onChange}
                                onSubmit={handleReplySubmit((data) =>
                                  handleSubmit(data, CommentType.REPLY)
                                )}
                                placeholder={`@${reply.to?.userName ?? ""}`}
                                loading={isReplySubmitting}
                                size="sm"
                                className="flex-1"
                                autoFocus
                              />
                            )}
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

                  {isLoadingMore && (
                    <div className="py-3">
                      <CommentLoadMoreSkeleton />
                    </div>
                  )}

                  {/* TODO */}
                  {/* {!isLoadingMore && params?.total > comments.length && (
                    <button
                      onClick={handleLoadMoreComments}
                      className="group/more text-gold/70 hover:text-gold mx-auto mt-1 mb-3 flex items-center gap-1.5 text-xs font-medium transition-all"
                    >
                      {t("video.comment.load-more")}
                      <ChevronDown
                        size={12}
                        className="transition-transform duration-200 group-hover/more:translate-y-0.5"
                      />
                    </button>
                  )} */}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-white/[0.06] p-4">
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <MessageInput
                    value={field.value}
                    onChange={field.onChange}
                    onSubmit={handleMainSubmit((data) => handleSubmit(data, CommentType.COMMENT))}
                    placeholder={
                      isLoggedIn ? t("video.comment.placeholder") : t("video.comment.login-prompt")
                    }
                    loading={isSubmitting}
                  />
                )}
              />
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

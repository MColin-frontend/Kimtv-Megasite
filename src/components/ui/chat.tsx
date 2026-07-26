"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Controller, useForm } from "react-hook-form"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChartBarStacked, ChevronDown, Clock, RefreshCw } from "lucide-react"
import { z } from "zod"

import {
  chatroomOperateAction,
  fetchChatMessagesAction,
  fetchPinnedMessagesAction,
} from "@/server/actions/chat.action"
import { getTokenFromCookie, type KimtvUser } from "@/lib/auth-cookie"
import { formatMatchTime } from "@/lib/date"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "@/hooks/useRouter"

import { useTranslation } from "@/i18n"
import { env } from "@/config/env"
import { HERO_VIDEO_PARAMS } from "@/constants/component/home.constants"
import {
  CHAT_CLASSES,
  CHAT_CONNECTION_STATUS,
  CHAT_INPUT_HEIGHT,
  CHAT_MESSAGE_TYPE,
  CHAT_MSG_PADDING,
  CHAT_SCROLLBAR_STYLE,
  CHAT_SOCIAL_NAMES,
  CHAT_SYMBOLS,
  CHAT_USER_ROLE,
} from "@/constants/ui/ui-chat.constants"

import { getActivePollApi, votePollApi } from "@/features/live/api/poll.api"
import { PollVoteView } from "@/features/live/components/poll-vote-view"
import { PollChannelEnum } from "@/features/live/poll.constants"
import type { PollInterface } from "@/features/live/poll.models"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Img } from "@/components/ui/image"
import { MessageInput } from "@/components/ui/message-input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import imgBlacklist from "@assets/images/chat/img-blacklist.png"
import imgCrown from "@assets/images/chat/img-crown.png"
import imgPin from "@assets/images/chat/img-pin.png"
import imgRemove from "@assets/images/chat/img-remove.png"
import imgRestriction from "@assets/images/chat/img-restriction.png"
import imgChat from "@assets/images/common/img-chat.png"
import imgFacebook from "@assets/images/layout/img-facebook.png"
import imgTele from "@assets/images/layout/img-tele.png"
import imgZalo from "@assets/images/layout/img-zalo.png"

/* ── Types ───────────────────────────────────────────────── */

export type ChatMessageType = (typeof CHAT_MESSAGE_TYPE)[keyof typeof CHAT_MESSAGE_TYPE]
export type UserRole = (typeof CHAT_USER_ROLE)[keyof typeof CHAT_USER_ROLE]
export type ConnectionStatus = (typeof CHAT_CONNECTION_STATUS)[keyof typeof CHAT_CONNECTION_STATUS]

export interface ChatMessage {
  id: string | number
  type: ChatMessageType
  content: string
  userName: string
  userId?: string | number
  chatroomId?: string | number
  level?: number
  isVip?: boolean
  isSVip?: boolean
  hasAnchorMe?: boolean
  hasFictitious?: boolean
  userAvatar?: string
  sendTime?: number
  vip99Icon?: string | null
}

export interface ChatSocials {
  telegram?: string
  facebook?: string
  zalo?: string
}

export interface ChatProps {
  socials?: ChatSocials
  onReport?: (message: ChatMessage, reportType: number) => void
  onBanRoom?: (message: ChatMessage, mute: boolean) => void
  onBanAll?: (message: ChatMessage, mute: boolean) => void
  onSetManager?: (message: ChatMessage, set: boolean) => void
  onPollMessage?: (channel: string, data: unknown) => void
  inputSuffix?: React.ReactNode
  topContent?: React.ReactNode
  className?: string
  /** Home page truyền trực tiếp để tránh timing issue. Live page dùng URL. */
  chatroomId?: string | number
  gameId?: number
  /** Khi true — Chat không tự quản lý poll (parent tự xử lý qua onPollMessage) */
  externalPoll?: boolean
}

const WS_RECONNECT_DELAY = 2000
const WS_HEARTBEAT_INTERVAL = 10_000

type TFunc = (key: Parameters<ReturnType<typeof useTranslation>["t"]>[0]) => string

/* ── Sub-components ──────────────────────────────────────── */

function ChatAvatar({ message, size = 48 }: { message: ChatMessage; size?: number }) {
  const wrapperCls = message.hasAnchorMe
    ? "bg-gradient-to-br from-[#ffd75a] to-[#f6c343] shadow-[0_0_8px_2px_rgba(246,195,67,0.45)]"
    : message.hasFictitious
      ? ""
      : "bg-white"

  return (
    <div
      className={cn("shrink-0 rounded-full p-px", wrapperCls)}
      style={{ width: size + 2, height: size + 2 }}
    >
      <Avatar size={size}>
        <AvatarImage src={message.userAvatar} />
      </Avatar>
    </div>
  )
}

function RoleBadge({ message, t }: { message: ChatMessage; t: TFunc }) {
  if (message.hasAnchorMe) {
    return (
      <Typography
        as="span"
        size="10"
        weight="600"
        className="bg-live/10 text-live rounded-4 mr-1 inline-block px-1.5 py-0.5 align-middle backdrop-blur-sm"
      >
        {t("chat.role.streamer")}
      </Typography>
    )
  }
  if (message.hasFictitious) {
    return (
      <Typography
        as="span"
        size="10"
        weight="600"
        className="rounded-4 mr-1 inline-block bg-fuchsia-500/15 px-1.5 py-0.5 align-middle text-fuchsia-400 backdrop-blur-sm"
      >
        {t("chat.role.admin")}
      </Typography>
    )
  }
  return null
}

function WelcomeMessageItem({
  message,
  onDoubleClick,
  t,
}: {
  message: ChatMessage
  onDoubleClick: (msg: ChatMessage) => void
  t: TFunc
}) {
  return (
    <div
      onDoubleClick={() => onDoubleClick(message)}
      className={cn(
        "flex flex-col gap-2 py-1.5 max-sm:gap-0.5 max-sm:!px-2 max-sm:py-0.5",
        CHAT_MSG_PADDING,
        (message.isSVip || message.isVip) && "bg-gold/5"
      )}
    >
      <div className="flex items-center gap-2 max-sm:gap-1.5">
        <div className="relative shrink-0 max-sm:size-8 max-sm:overflow-hidden max-sm:rounded-full">
          <div className="max-sm:origin-top-left max-sm:scale-[0.64]">
            {message.hasAnchorMe && (
              <div className="border-gold-hover absolute -top-2 -right-1 z-11 flex size-6 items-center justify-center rounded-full border-[0.5px] bg-black/70 p-[2px]">
                <Img src={imgCrown} alt="crown" width={14} height={14} objectFit="contain" />
              </div>
            )}
            <ChatAvatar message={message} size={48} />
          </div>
        </div>
        <div className="flex w-full min-w-0 flex-col flex-wrap gap-1 max-sm:gap-0.5">
          <div className="flex items-center justify-between gap-1">
            <div className="flex w-full items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <Typography
                    as="span"
                    variant="body-sm"
                    weight="600"
                    className={cn(
                      "max-sm:text-10 block max-w-48 cursor-pointer truncate",
                      CHAT_CLASSES.username
                    )}
                  >
                    {message.userName}
                  </Typography>
                </TooltipTrigger>
                <TooltipContent>{message.userName}</TooltipContent>
              </Tooltip>
              <RoleBadge message={message} t={t} />

              {message?.vip99Icon && (
                <Img
                  src={message?.vip99Icon || ""}
                  alt="vip99 icon"
                  width={32}
                  height={32}
                  unoptimized
                  objectFit="contain"
                  className="h-auto max-sm:!size-5"
                />
              )}
            </div>
            {message.sendTime && (
              <Typography
                variant="overline"
                className="text-muted max-sm:text-10 ml-auto shrink-0 tabular-nums"
              >
                {formatMatchTime(message.sendTime)}
              </Typography>
            )}
          </div>
          <Typography as="span" variant="body-sm" className="text-muted max-sm:text-10">
            {t("chat.welcome")}
          </Typography>
        </div>
      </div>
    </div>
  )
}

function MessageItem({
  message,
  onDoubleClick,
  t,
}: {
  message: ChatMessage
  onDoubleClick: (msg: ChatMessage) => void
  t: TFunc
}) {
  if (message.type === CHAT_MESSAGE_TYPE.GIFT) {
    return (
      <div
        onDoubleClick={() => onDoubleClick(message)}
        className={cn(
          "text-14 bg-chat-gift/5 flex items-center gap-1 py-2.5 text-white max-sm:!px-2",
          CHAT_MSG_PADDING
        )}
      >
        {message?.vip99Icon && (
          <Img
            src={message?.vip99Icon || ""}
            alt="vip99 icon"
            width={32}
            height={32}
            unoptimized
            objectFit="contain"
            className="h-auto max-sm:!size-5"
          />
        )}
        <span dangerouslySetInnerHTML={{ __html: message.content }} />
      </div>
    )
  }

  if (message.type === CHAT_MESSAGE_TYPE.WELCOME) {
    return <WelcomeMessageItem message={message} onDoubleClick={onDoubleClick} t={t} />
  }

  return (
    <div
      onDoubleClick={() => onDoubleClick(message)}
      className={cn(
        "flex gap-2 py-1.5 max-sm:gap-1.5 max-sm:!px-2 max-sm:py-0.5",
        CHAT_MSG_PADDING
      )}
    >
      <div className="relative shrink-0 max-sm:size-8 max-sm:overflow-hidden max-sm:rounded-full">
        <div className="max-sm:origin-top-left max-sm:scale-[0.64]">
          {message.hasAnchorMe && (
            <div className="border-gold-hover absolute -top-2 -right-1 z-10 flex size-6 items-center justify-center rounded-full border-[0.5px] bg-black/70 p-[2px]">
              <Img src={imgCrown} alt="crown" width={14} height={14} objectFit="contain" />
            </div>
          )}
          <ChatAvatar message={message} size={48} />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <Typography
              as="span"
              variant="body-sm"
              weight="600"
              className={cn("max-sm:text-12 cursor-pointer truncate", CHAT_CLASSES.username)}
            >
              {message.userName}
            </Typography>
            <RoleBadge message={message} t={t} />
            {message?.vip99Icon && (
              <Img
                src={message?.vip99Icon || ""}
                alt="vip99 icon"
                width={32}
                height={32}
                unoptimized
                objectFit="contain"
                className="h-auto max-sm:!size-5"
              />
            )}
          </div>
          {formatMatchTime(message?.sendTime ?? 0) && (
            <Typography
              variant="overline"
              className="text-muted max-sm:text-10 shrink-0 tabular-nums"
            >
              {formatMatchTime(message?.sendTime ?? 0)}
            </Typography>
          )}
        </div>
        <Typography
          variant="body-sm"
          className={cn("max-sm:text-12 break-words text-white", `[&_a]:${CHAT_CLASSES.link}`)}
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
      </div>
    </div>
  )
}

/* ── User Popup ──────────────────────────────────────────── */

function UserPopup({
  message,
  userRole,
  isPinned,
  onClose,
  onReport,
  onDelete,
  onPin,
  onUnpin,
  onBanRoom,
  onBanAll,
  onSetManager,
}: {
  message: ChatMessage
  userRole: UserRole
  isPinned: boolean
  onClose: () => void
  onReport?: (msg: ChatMessage, type: number) => void
  onDelete?: (msg: ChatMessage) => void
  onPin?: (msg: ChatMessage) => void
  onUnpin?: (msg: ChatMessage) => void
  onBanRoom?: (msg: ChatMessage, mute: boolean) => void
  onBanAll?: (msg: ChatMessage, mute: boolean) => void
  onSetManager?: (msg: ChatMessage, set: boolean) => void
}) {
  const { t } = useTranslation()
  const [reportType, setReportType] = useState(0)

  const REPORT_TYPES = [
    t("chat.report.types.speech"),
    t("chat.report.types.attack"),
    t("chat.report.types.nickname"),
    t("chat.report.types.ad"),
    t("chat.report.types.avatar"),
    t("chat.report.types.spam"),
  ]

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="panel-news sm:rounded-16 relative z-10 w-full max-w-[600px] overflow-hidden rounded-t-2xl"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="relative shrink-0">
            {message.hasAnchorMe && (
              <div className="border-gold/70 absolute -top-1 -right-0.5 z-10 flex size-6 items-center justify-center rounded-full border-[0.5px] bg-black/80">
                <Img src={imgCrown} alt="crown" width={13} height={13} objectFit="contain" />
              </div>
            )}
            <ChatAvatar message={message} size={64} />
          </div>
          <div className="min-w-0 flex-1">
            <Typography variant="body" weight="700" className="truncate text-white">
              {message.userName}
            </Typography>
            <RoleBadge message={message} t={t} />
          </div>
        </div>

        {/* Quote */}
        <div className="rounded-8 mx-5 mb-3 bg-white/[0.03] px-4 py-3">
          <Typography
            size="10"
            weight="500"
            className="mb-1.5 tracking-widest text-white/30 uppercase"
          >
            {t("chat.report.title")}
          </Typography>
          <div
            className="max-h-[120px] overflow-y-auto pr-1"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
          >
            <Typography variant="body-sm" className="leading-relaxed text-white/60">
              {message.content.replace(/<[^>]*>/g, "")}
            </Typography>
          </div>
        </div>

        {/* Report — ordinary */}
        {userRole === CHAT_USER_ROLE.ORDINARY && (
          <>
            <div className="flex flex-col p-2">
              {REPORT_TYPES.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setReportType(i)}
                  className={cn(
                    "font-500 rounded-4 mb-1 flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors",
                    reportType === i
                      ? "bg-danger/8 text-danger"
                      : "text-white/55 hover:bg-white/[0.03] hover:text-white/80"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                      reportType === i ? "border-danger bg-danger/20" : "border-white/20"
                    )}
                  >
                    {reportType === i && <span className="bg-danger block size-1 rounded-full" />}
                  </span>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex w-full gap-3 px-5 py-4">
              <Button variant="cancel" className="flex-1" onClick={onClose}>
                {t("chat.cancel")}
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={() => {
                  onReport?.(message, reportType)
                  onClose()
                }}
              >
                {t("chat.report.submit")}
              </Button>
            </div>
          </>
        )}

        {/* Admin actions — ADMIN + HOUSING_MANAGEMENT */}
        {(userRole === CHAT_USER_ROLE.ADMIN || userRole === CHAT_USER_ROLE.HOUSING_MANAGEMENT) && (
          <div className="flex items-start justify-around border-t border-white/[0.06] px-3 py-4">
            {userRole === CHAT_USER_ROLE.ADMIN && message.type !== CHAT_MESSAGE_TYPE.VIRTUAL && (
              <button
                onClick={() => {
                  onBanAll?.(message, true)
                  onClose()
                }}
                className="flex flex-col items-center gap-2 transition-transform active:scale-90"
              >
                <Img src={imgBlacklist} alt="" width={40} height={40} objectFit="contain" />
                <span className="text-12 font-600 w-16 text-center leading-tight text-white/80">
                  {t("chat.actions.ban-all")}
                </span>
              </button>
            )}
            {message.type !== CHAT_MESSAGE_TYPE.VIRTUAL && (
              <button
                onClick={() => {
                  onBanRoom?.(message, true)
                  onClose()
                }}
                className="flex flex-col items-center gap-2 transition-transform active:scale-90"
              >
                <Img src={imgRestriction} alt="" width={40} height={40} objectFit="contain" />
                <span className="text-12 font-600 w-16 text-center leading-tight text-white/80">
                  {t("chat.actions.ban-room")}
                </span>
              </button>
            )}
            <button
              onClick={() => {
                onDelete?.(message)
                onClose()
              }}
              className="flex flex-col items-center gap-2 transition-transform active:scale-90"
            >
              <Img src={imgRemove} alt="" width={40} height={40} objectFit="contain" />
              <span className="text-12 font-600 w-16 text-center leading-tight text-white/80">
                {t("chat.actions.delete")}
              </span>
            </button>
            {message.hasFictitious && (
              <button
                onClick={() => {
                  if (isPinned) onUnpin?.(message)
                  else onPin?.(message)
                  onClose()
                }}
                className="flex flex-col items-center gap-2 transition-transform active:scale-90"
              >
                <Img
                  src={imgPin}
                  alt=""
                  width={40}
                  height={40}
                  objectFit="contain"
                  className={isPinned ? "opacity-100" : "opacity-50"}
                />
                <span
                  className={cn(
                    "text-12 font-600 w-16 text-center leading-tight",
                    isPinned ? "text-gold/80" : "text-white/80"
                  )}
                >
                  {isPinned ? t("chat.actions.unpin") : t("chat.actions.pin")}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Anchor actions — ANCHOR only */}
        {userRole === CHAT_USER_ROLE.ANCHOR && message.type !== CHAT_MESSAGE_TYPE.VIRTUAL && (
          <div className="flex items-start justify-around border-t border-white/[0.06] px-3 py-4">
            <button
              onClick={() => {
                onSetManager?.(message, true)
                onClose()
              }}
              className="flex flex-col items-center gap-2 transition-transform active:scale-90"
            >
              <Img
                src={imgRestriction}
                alt=""
                width={40}
                height={40}
                objectFit="contain"
                className="opacity-50"
              />
              <span className="text-12 font-600 w-16 text-center leading-tight text-white/80">
                {t("chat.actions.set-manager")}
              </span>
            </button>
          </div>
        )}

        {/* Safe area bottom — mobile */}
        <div className="h-safe-area-bottom sm:hidden" />
      </div>
    </div>,
    document.body
  )
}

/* ── Poll ────────────────────────────────────────────────── */

interface PollOption {
  id: number
  label: string
  votes: number
}

interface PollData {
  question: string
  options: PollOption[]
  durationSeconds: number
}

interface PollFormValues {
  optionId: number | null
}

function ChatPoll({ poll }: { poll: PollData }) {
  const { watch, setValue, handleSubmit } = useForm<PollFormValues>({
    defaultValues: { optionId: null },
  })

  const selected = watch("optionId")
  const hasVoted = selected !== null

  function onSubmit(data: PollFormValues) {
    // TODO: call vote API with data.optionId
    console.log("voted:", data.optionId)
  }

  const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0)
  const expired = poll.durationSeconds <= 0

  return (
    <div className="card-gold rounded-8 mx-2 my-1.5 overflow-hidden">
      <AccordionPrimitive.Root>
        <AccordionPrimitive.Item value="poll">
          {/* Header = Trigger */}
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between px-3 pt-2.5 pb-2 outline-none">
              <div className="flex items-center gap-1.5">
                <ChartBarStacked className="text-gold/60 size-3 shrink-0" />
                <Typography
                  as="span"
                  variant="caption"
                  weight="600"
                  color="white/90"
                  className="leading-none"
                >
                  {poll.question}
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-0.5 rounded-full px-1.5 py-[3px] tabular-nums",
                    expired
                      ? "bg-white/5"
                      : "bg-gold/15 ring-gold/25 shadow-[0_0_8px_rgba(246,195,67,0.2)] ring-1"
                  )}
                >
                  <Clock className="mr-0.5 size-2.5" />
                  <Typography
                    as="span"
                    size="10"
                    weight="600"
                    color={expired ? "white/30" : "gold"}
                    className="leading-none"
                  >
                    {/* TODO: hiển thị thời gian từ API */}
                  </Typography>
                </div>
                <ChevronDown className="size-3 text-white/30 transition-transform duration-200 group-aria-expanded:rotate-180" />
              </div>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>

          {/* Options = Panel */}
          <AccordionPrimitive.Panel className="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden">
            <div className="h-(--accordion-panel-height) data-ending-style:h-0 data-starting-style:h-0">
              {/* Options form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-1.5 px-3 pb-3">
                  {poll.options.map((opt) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
                    const isSelected = selected === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="submit"
                        disabled={expired}
                        onClick={() => setValue("optionId", opt.id, { shouldDirty: true })}
                        className={cn(
                          "group rounded-6 relative flex h-8 w-full items-center justify-between overflow-hidden px-2.5 text-left transition-all duration-200",
                          isSelected
                            ? "border-gold/40 bg-gold/10 border shadow-[0_0_12px_rgba(246,195,67,0.12)]"
                            : hasVoted
                              ? "border border-white/6 bg-white/[0.025]"
                              : "hover:border-gold/20 hover:bg-gold/5 border border-white/8 bg-white/[0.03] active:scale-[0.98]"
                        )}
                      >
                        {/* Progress fill */}
                        {hasVoted && (
                          <div
                            className={cn(
                              "rounded-l-6 absolute inset-y-0 left-0 transition-[width] duration-700 ease-out",
                              isSelected ? "bg-gold/18" : "bg-white/4"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        )}

                        {/* Left: radio + label */}
                        <div className="relative flex items-center gap-2">
                          <div
                            className={cn(
                              "flex size-[14px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-200",
                              isSelected
                                ? "border-gold bg-gold shadow-[0_0_6px_rgba(246,195,67,0.5)]"
                                : "border-white/20 group-hover:border-white/35"
                            )}
                          >
                            {isSelected && (
                              <div className="size-1.5 rounded-full bg-[#080e1c]/80" />
                            )}
                          </div>
                          <Typography
                            as="span"
                            variant="caption"
                            weight={isSelected ? "600" : "500"}
                            color={isSelected ? "gold" : hasVoted ? "white/50" : "white/75"}
                            className="leading-none"
                          >
                            {opt.label}
                          </Typography>
                        </div>

                        {/* Right: percentage */}
                        {hasVoted && (
                          <Typography
                            as="span"
                            size="10"
                            weight="600"
                            color={isSelected ? "gold/90" : "white/30"}
                            className="relative leading-none tabular-nums"
                          >
                            {pct}%
                          </Typography>
                        )}
                      </button>
                    )
                  })}

                  {!hasVoted && !expired && (
                    <Typography
                      as="p"
                      size="10"
                      color="white/20"
                      className="pt-0.5 text-center italic"
                    >
                      Chọn một đáp án để bình chọn
                    </Typography>
                  )}
                  {expired && (
                    <Typography as="p" size="10" color="white/15" className="pt-0.5 text-center">
                      Poll đã kết thúc
                    </Typography>
                  )}
                </div>
              </form>
            </div>
          </AccordionPrimitive.Panel>
        </AccordionPrimitive.Item>
      </AccordionPrimitive.Root>
    </div>
  )
}

/* ── Role resolution ─────────────────────────────────────── */

/**
 * Map roleType từ backend Java → CHAT_USER_ROLE.
 * Kimtvpc convention: 1=ADMIN, 2=ANCHOR(BLV), 3=HOUSING_MANAGEMENT(CSKH).
 * Hỗ trợ cả field `roleType` lẫn `type` vì backend có thể dùng khác nhau.
 * Chỉ ADMIN và HOUSING_MANAGEMENT (CSKH) được ghim tin nhắn — ANCHOR (BLV) không được.
 */
function resolveChatRole(user: KimtvUser | null, isLoggedIn: boolean): UserRole {
  if (!isLoggedIn || !user) return CHAT_USER_ROLE.NOT_LOGIN
  const raw = (user.roleType ?? user.type) as number | undefined
  switch (raw) {
    case 1:
      return CHAT_USER_ROLE.ADMIN
    case 2:
      return CHAT_USER_ROLE.ANCHOR
    case 3:
      return CHAT_USER_ROLE.HOUSING_MANAGEMENT
    default:
      return CHAT_USER_ROLE.ORDINARY
  }
}

/* ── Main Component ──────────────────────────────────────── */

const DEFAULT_SOCIALS: ChatSocials = {
  telegram: "https://t.me/anhemkimtv",
  facebook: "https://www.facebook.com/groups/5814050098675787",
  zalo: "https://zalo.me/0582963553",
}

export function Chat({
  socials,
  onReport,
  onBanRoom,
  onBanAll,
  onSetManager,
  onPollMessage,
  topContent,
  className,
  chatroomId: chatroomIdProp,
  gameId: gameIdProp,
  externalPoll = false,
}: ChatProps) {
  const { t } = useTranslation()
  const { getParam, pathname } = useRouter()
  const { isLoggedIn, user } = useAuth()

  const userRole = resolveChatRole(user, isLoggedIn)

  /* ── Internal state ──────────────────────────────────────── */
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([])
  const [poll, setPoll] = useState<PollInterface | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    CHAT_CONNECTION_STATUS.DISCONNECTED
  )
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const chatSchema = z.object({
    content: z.string().refine((v) => v.trim().length > 0, t("chat.empty-message")),
  })
  type ChatFormType = z.infer<typeof chatSchema>

  const {
    control,
    handleSubmit: handleFormSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ChatFormType>({
    resolver: zodResolver(chatSchema),
    defaultValues: { content: "" },
  })
  const [showNewMsg, setShowNewMsg] = useState(false)
  const [expandedPinId, setExpandedPinId] = useState<string | number | null>(null)
  const [popupMessage, setPopupMessage] = useState<ChatMessage | null>(null)

  const listRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const wsRef = useRef<WebSocket | null>(null)
  const onPollMessageRef = useRef(onPollMessage)
  // eslint-disable-next-line react-hooks/refs
  onPollMessageRef.current = onPollMessage
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function handlePollVote(optionKeys: string[]) {
    if (!poll?.pollId) return
    const updated = await votePollApi(poll.pollId, optionKeys)
    if (updated) return updated
  }
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectCountRef = useRef(0)
  const pageIndexRef = useRef(0)
  const loadingMoreRef = useRef(false)

  // Dùng window.location.search để tránh useSearchParams() hydration timing issue
  const pathLastSegment = pathname.split("/").filter(Boolean).pop() ?? ""
  const _urlParams =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const roomIdFromUrl = _urlParams?.get("room_id") ?? getParam("room_id")
  const matchIdFromUrl = /^\d+$/.test(pathLastSegment)
    ? pathLastSegment
    : (_urlParams?.get(HERO_VIDEO_PARAMS.MATCH_ID) ?? getParam(HERO_VIDEO_PARAMS.MATCH_ID))
  // isAnchor: có room_id → dùng roomId + game_id=0 (giống kimtvpc)
  // else: dùng matchId + gameId từ URL
  const isAnchor = !!roomIdFromUrl
  const chatroomId = isAnchor
    ? roomIdFromUrl!
    : (matchIdFromUrl ?? (chatroomIdProp != null ? String(chatroomIdProp) : undefined))
  const pollChatroomId = chatroomId
  const _gameIdFromUrl =
    _urlParams?.get(HERO_VIDEO_PARAMS.GAME_ID) ?? getParam(HERO_VIDEO_PARAMS.GAME_ID)
  const gameId = isAnchor ? 0 : Number(_gameIdFromUrl ?? 0) || gameIdProp || 0

  const mergedSocials = { ...DEFAULT_SOCIALS, ...socials }

  /* ── WebSocket ───────────────────────────────────────────── */

  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }, [])

  const parseLinks = (text: string) =>
    text.replace(
      /((www\.|https?:\/\/)[^\s]+)/g,
      (m) =>
        `<a href="${m.startsWith("www") ? `http://${m}` : m}" target="_blank" rel="noopener noreferrer">${m}</a>`
    )

  const startHeartbeat = useCallback(() => {
    clearHeartbeat()
    heartbeatRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ op_type: 9 }))
      }
    }, WS_HEARTBEAT_INTERVAL)
  }, [clearHeartbeat])

  const closeWs = useCallback(() => {
    clearHeartbeat()
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current)
      reconnectRef.current = null
    }
    if (wsRef.current) {
      const ws = wsRef.current
      wsRef.current = null
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.addEventListener("open", () => ws.close(), { once: true })
      } else {
        ws.close()
      }
    }
  }, [clearHeartbeat])

  const initWsRef = useRef<((cId: string, gId: number) => void) | undefined>(undefined)

  const initWs = useCallback(
    (cId: string, gId: number) => {
      closeWs()
      if (!("WebSocket" in window) || !cId) return
      setConnectionStatus(CHAT_CONNECTION_STATUS.CONNECTING)
      try {
        const token = getTokenFromCookie() ?? ""
        if (!env.wsBaseUrl)
          console.error("[chat] NEXT_PUBLIC_WS_BASE_URL is not set — check env config")
        if (!token)
          console.warn(
            "[chat] token is empty — server may reject (code 1000). Check login state or env mismatch (dev token vs prod WS)"
          )
        console.log(
          `[chat] connecting — url: ${env.wsBaseUrl}/chat?chatroom_id=${cId}&game_id=${gId}&token=***&lan=vi`
        )
        const ws = new WebSocket(
          `${env.wsBaseUrl}/chat?chatroom_id=${cId}&game_id=${gId}&token=${token}&lan=vi`
        )

        wsRef.current = ws

        ws.addEventListener("open", () => {
          if (ws !== wsRef.current) return
          setConnectionStatus(CHAT_CONNECTION_STATUS.CONNECTED)
          startHeartbeat()
          reconnectCountRef.current = 0
          console.log(`[chat] connected ✓ chatroom_id: ${cId}, game_id: ${gId}`)
        })

        ws.addEventListener("message", ({ data: raw }) => {
          if (ws !== wsRef.current || raw === "ping") return

          try {
            const res = JSON.parse(raw) as Record<string, unknown>

            console.log("[chat] raw:", raw)

            if (Object.values(PollChannelEnum).includes(res.channel as PollChannelEnum)) {
              console.log("[chat] poll event →", res.channel, res.data)
              onPollMessageRef.current?.(res.channel as string, res.data)
              if (!externalPoll) {
                const p = res.data as PollInterface
                if (res.channel === PollChannelEnum.START) {
                  setPoll(p)
                } else if (res.channel === PollChannelEnum.ACTIVE) {
                  setPoll((prev) =>
                    prev
                      ? {
                          ...prev,
                          remainingSec: p.remainingSec,
                          options: p.options,
                          totalVotes: p.totalVotes,
                          status: p.status,
                        }
                      : p
                  )
                } else if (res.channel === PollChannelEnum.UPDATE) {
                  setPoll((prev) =>
                    prev
                      ? {
                          ...prev,
                          options: p.options ?? prev.options,
                          totalVotes: p.totalVotes ?? prev.totalVotes,
                        }
                      : p
                  )
                } else if (res.channel === PollChannelEnum.CLOSED) {
                  setPoll(null)
                }
              }
              return
            }

            const data = res.data as Record<string, unknown> | undefined
            if (!data || (data.code as number) === 10) return
            if (res.channel === "CHATROOM" && data.content) {
              const msg: ChatMessage = {
                ...(data as unknown as ChatMessage),
                content: parseLinks(String(data.content)),
                userAvatar: (data.avatar as string | null) || undefined,
                sendTime: (data.timeMillis as number) || undefined,
              }
              setMessages((prev) => [...prev.slice(-200), msg])
            }
            if (res.channel === "PIN_MESSAGE") {
              const msgs = data.messages
              setPinnedMessages(
                Array.isArray(msgs) ? (msgs as ChatMessage[]) : msgs ? [msgs as ChatMessage] : []
              )
            }
            if (res.channel === "LIVE_END") {
              setMessages([])
              setPinnedMessages([])
            }
          } catch (err) {
            console.error("[chat] message parse error:", err, "raw:", raw)
          }
        })

        ws.addEventListener("close", (ev) => {
          if (ws !== wsRef.current) return
          const hint =
            ev.code === 1000
              ? " — server đóng bình thường (có thể do token sai môi trường: dev token → prod WS)"
              : ev.code === 1006
                ? " — mất kết nối bất thường (sai URL hoặc server không phản hồi)"
                : ""
          console.error(
            `[chat] ws closed — code: ${ev.code} reason: ${ev.reason || "(none)"}${hint}`
          )
          setConnectionStatus(CHAT_CONNECTION_STATUS.DISCONNECTED)
          clearHeartbeat()
          wsRef.current = null
          if (reconnectCountRef.current < 4) {
            reconnectRef.current = setTimeout(() => {
              reconnectCountRef.current++
              initWsRef.current?.(cId, gId)
            }, WS_RECONNECT_DELAY)
          } else {
            console.error(
              `[chat] max reconnect (4) reached — chatroom_id: ${cId}, game_id: ${gId}, wsBaseUrl: ${env.wsBaseUrl}`
            )
          }
        })
        ws.addEventListener("error", (ev) => {
          if (ws !== wsRef.current) return
          console.error("[chat] ws error:", ev)
          setConnectionStatus(CHAT_CONNECTION_STATUS.DISCONNECTED)
        })
      } catch (err) {
        console.error("[chat] ws init error:", err)
        setConnectionStatus(CHAT_CONNECTION_STATUS.DISCONNECTED)
      }
    },
    [closeWs, startHeartbeat, clearHeartbeat]
  )

  useEffect(() => {
    initWsRef.current = initWs
  })

  const handleLoadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreMessages || !chatroomId) return
    loadingMoreRef.current = true
    try {
      const result = await fetchChatMessagesAction({
        chatroomId,
        gameId,
        pageIndex: pageIndexRef.current + 1,
      })
      if (result.messages.length > 0) {
        pageIndexRef.current++
        setMessages((prev) => [...result.messages, ...prev])
      }
      setHasMoreMessages(result.hasMore)
    } finally {
      loadingMoreRef.current = false
    }
  }, [chatroomId, gameId, hasMoreMessages])

  /* ── Load messages khi chatroom đổi ─────────────────────── */
  useEffect(() => {
    if (!chatroomId) return
    pageIndexRef.current = 0
    Promise.all([
      fetchChatMessagesAction({ chatroomId, gameId, pageIndex: 0 }),
      fetchPinnedMessagesAction({ chatroomId, gameId }),
    ]).then(([chatResult, pinned]) => {
      setMessages(chatResult.messages)
      setHasMoreMessages(chatResult.hasMore)
      setPinnedMessages(pinned)
    })
  }, [chatroomId, gameId])

  /* ── Poll: fetch active + reset khi chatroom đổi ────────── */
  useEffect(() => {
    if (!pollChatroomId || externalPoll) return
    console.log("[poll] fetching — pollChatroomId:", pollChatroomId, "chatroomId:", chatroomId)
    getActivePollApi(pollChatroomId).then((p) => {
      console.log("[poll] active poll response:", p)
      if (p) setPoll(p)
    })
  }, [pollChatroomId, externalPoll])

  /* ── WebSocket: reconnect khi chatroom đổi hoặc auth đổi ── */
  useEffect(() => {
    if (!chatroomId) {
      console.warn(
        "[chat] chatroomId is undefined — WebSocket will not connect. Check URL params (match_id / game_id) or prop drilling from parent."
      )
      return
    }
    reconnectCountRef.current = 0
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initWs(chatroomId, gameId)
    return closeWs
  }, [chatroomId, gameId, isLoggedIn, initWs, closeWs])

  const handleSendMessage = ({ content }: ChatFormType) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 1, content: content }))
    resetForm()
  }

  const handleReconnect = useCallback(() => {
    reconnectCountRef.current = 0
    if (chatroomId) initWs(chatroomId, gameId)
  }, [chatroomId, gameId, initWs])

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom()
    } else {
      setShowNewMsg(true)
    }
  }, [messages, scrollToBottom])

  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const atBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 2
    isAtBottomRef.current = atBottom
    if (atBottom) setShowNewMsg(false)
    if (el.scrollTop <= 60 && hasMoreMessages) handleLoadMore()
  }, [hasMoreMessages, handleLoadMore])

  const handleDoubleClick = useCallback(
    (msg: ChatMessage) => {
      if (userRole === CHAT_USER_ROLE.NOT_LOGIN) return
      if (msg.type === CHAT_MESSAGE_TYPE.ORDINARY || msg.type === CHAT_MESSAGE_TYPE.VIRTUAL)
        setPopupMessage(msg)
    },
    [userRole]
  )

  const isPinned = (id: string | number) => pinnedMessages.some((m) => m.id === id)

  const handlePin = (msg: ChatMessage) => {
    chatroomOperateAction({
      operateType: "PIN_MESSAGE",
      userId: msg.userId,
      chatroomId: msg.chatroomId,
      gameId,
      messageId: msg.id,
    }).catch(console.error)
  }

  const handleUnpin = (msg: ChatMessage) => {
    chatroomOperateAction({
      operateType: "UNPIN_MESSAGE",
      userId: msg.userId,
      chatroomId: msg.chatroomId,
      gameId,
      messageId: msg.id,
    }).catch(console.error)
  }

  const handleDelete = useCallback(
    (msg: ChatMessage) => {
      chatroomOperateAction({
        operateType: "DELETE_MESSAGE",
        userId: msg.userId,
        chatroomId: msg.chatroomId,
        gameId,
        messageId: msg.id,
      })
        .then(() => {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id))
        })
        .catch(console.error)
    },
    [gameId]
  )

  return (
    <div
      className={cn(
        "card-glow rounded-12 relative flex h-full min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden p-4 backdrop-blur-2xl max-sm:p-2",
        className
      )}
    >
      {/* Social buttons */}
      <div className="flex shrink-0 items-center gap-1.5 max-sm:gap-1">
        {mergedSocials.telegram && (
          <a
            href={mergedSocials.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#2aabee] py-1.5 no-underline shadow-[0_2px_8px_rgba(42,171,238,0.3)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(42,171,238,0.45)] hover:brightness-110 active:scale-95 max-sm:gap-1 max-sm:px-2 max-sm:py-1"
          >
            <Img
              src={imgTele.src}
              alt=""
              width={14}
              height={14}
              className="size-3.5 shrink-0 object-contain max-sm:size-3"
            />
            <Typography
              as="span"
              variant="caption"
              weight="600"
              className="max-sm:text-10 leading-none text-white"
            >
              {CHAT_SOCIAL_NAMES.TELEGRAM}
            </Typography>
          </a>
        )}
        {mergedSocials.facebook && (
          <a
            href={mergedSocials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#1877f2] py-1.5 no-underline shadow-[0_2px_8px_rgba(24,119,242,0.3)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(24,119,242,0.45)] hover:brightness-110 active:scale-95 max-sm:gap-1 max-sm:px-2 max-sm:py-1"
          >
            <Img
              src={imgFacebook.src}
              alt=""
              width={14}
              height={14}
              className="size-3.5 shrink-0 object-contain max-sm:size-3"
            />
            <Typography
              as="span"
              variant="caption"
              weight="600"
              className="max-sm:text-10 leading-none text-white"
            >
              {CHAT_SOCIAL_NAMES.FACEBOOK}
            </Typography>
          </a>
        )}
        {mergedSocials.zalo && (
          <a
            href={mergedSocials.zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#0068ff] py-1.5 no-underline shadow-[0_2px_8px_rgba(0,104,255,0.3)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,104,255,0.45)] hover:brightness-110 active:scale-95 max-sm:gap-1 max-sm:px-2 max-sm:py-1"
          >
            <Img
              src={imgZalo.src}
              alt=""
              width={14}
              height={14}
              className="size-3.5 shrink-0 object-contain max-sm:size-3"
            />
            <Typography
              as="span"
              variant="caption"
              weight="600"
              className="max-sm:text-10 leading-none text-white"
            >
              {CHAT_SOCIAL_NAMES.ZALO}
            </Typography>
          </a>
        )}
      </div>
      {/* Poll slot */}
      {!externalPoll && poll && (
        <PollVoteView poll={poll} onVote={handlePollVote} onClose={() => setPoll(null)} />
      )}
      {topContent && <div className="shrink-0">{topContent}</div>}

      {/* Messages section */}
      <div className="rounded-6 relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white/[0.03] backdrop-blur-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-3 pt-2.5 pb-1.5">
          <div className="flex items-center gap-2">
            <div className="border-gold/30 rounded-full border p-1">
              <div className="border-gold/60 bg-gold rounded-full border p-1">
                <Img src={imgChat} alt="chat" width={16} height={16} objectFit="contain" />
              </div>
            </div>
            <Typography
              as="span"
              variant="h4"
              weight="800"
              className="tracking-widest uppercase italic"
            >
              <span className="text-gold drop-shadow-gold">Live</span>
              <span className="text-white"> Chat</span>
            </Typography>
          </div>
          {/* Live badge */}
          <div className="bg-live-green-bg border-live-green/30 shadow-live-green-sm flex items-center gap-1.5 rounded-full border px-2.5 py-1">
            <span className="relative flex size-2 shrink-0">
              <span className="bg-live-green absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-live-green relative inline-flex size-2 rounded-full" />
            </span>
            <Typography
              as="span"
              size="10"
              weight="600"
              className="text-live-green leading-none tabular-nums"
            >
              LIVE
            </Typography>
          </div>
        </div>

        {/* Pinned messages */}
        {pinnedMessages.length > 0 && (
          <div className="flex shrink-0 flex-col gap-px border-b border-white/6">
            {pinnedMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => !expandedPinId && setExpandedPinId(msg.id)}
                className={cn(
                  "rounded-4 mx-2 my-1 flex flex-col gap-1 border-l-[3px] bg-white/4 px-2.5 py-2 text-[12px] text-white select-none",
                  "border-chat-pin",
                  !expandedPinId ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div className="flex items-start gap-1.5">
                  <Typography as="span" size="12" className="shrink-0 pt-px leading-none">
                    {CHAT_SYMBOLS.PIN}
                  </Typography>
                  <Typography
                    as="span"
                    size="12"
                    weight="700"
                    className={cn("shrink-0 whitespace-nowrap", CHAT_CLASSES.pin)}
                  >
                    {t("chat.pin-label")}:
                  </Typography>
                  <span
                    className={cn(
                      "text-14 flex-1",
                      expandedPinId === msg.id
                        ? "max-h-[400px] overflow-y-auto break-words whitespace-normal"
                        : "overflow-hidden text-ellipsis whitespace-nowrap"
                    )}
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                  <span
                    className={cn("text-14 shrink-0 leading-none", CHAT_CLASSES.pin)}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (
                        userRole === CHAT_USER_ROLE.ADMIN ||
                        userRole === CHAT_USER_ROLE.HOUSING_MANAGEMENT
                      )
                        handleUnpin(msg)
                      else setExpandedPinId(expandedPinId === msg.id ? null : msg.id)
                    }}
                  >
                    {userRole === CHAT_USER_ROLE.ADMIN ||
                    userRole === CHAT_USER_ROLE.HOUSING_MANAGEMENT
                      ? CHAT_SYMBOLS.CLOSE
                      : expandedPinId === msg.id
                        ? CHAT_SYMBOLS.COLLAPSE
                        : CHAT_SYMBOLS.EXPAND}
                  </span>
                </div>
                {expandedPinId === msg.id && (
                  <button
                    className={cn(
                      "group mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5",
                      "text-12 font-500 transition-all duration-200",
                      CHAT_CLASSES.pin
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedPinId(null)
                    }}
                  >
                    <span className="not-italic transition-all duration-200 group-hover:italic">
                      Thu hẹp
                    </span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message list */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto py-2"
          style={CHAT_SCROLLBAR_STYLE}
        >
          {connectionStatus === CHAT_CONNECTION_STATUS.CONNECTING && (
            <Typography variant="body-sm" className="text-chat-status block py-2 text-center">
              {t("chat.connecting")}
            </Typography>
          )}
          {connectionStatus === CHAT_CONNECTION_STATUS.CONNECTED && (
            <Typography variant="body-sm" className="text-chat-status block py-2 text-center">
              {t("chat.connected")}
            </Typography>
          )}

          {messages.map((msg, i) => (
            <div key={`${msg.id}-${i}`} className="mb-2">
              <MessageItem
                message={msg}
                onDoubleClick={handleDoubleClick}

                t={t}
              />
            </div>
          ))}

          {connectionStatus === CHAT_CONNECTION_STATUS.DISCONNECTED && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Typography variant="body-sm" className="text-chat-status text-center">
                {t("chat.disconnected")}
              </Typography>
              <Typography variant="body-sm" className="text-chat-status text-center">
                {t("chat.reconnecting")}
              </Typography>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReconnect}
                className="bg-chat-status hover:bg-chat-status/80 gap-1.5 rounded-full text-white"
              >
                <RefreshCw className="size-3.5" />
                {t("chat.reconnect")}
              </Button>
            </div>
          )}
        </div>

        {/* New message button */}
        {showNewMsg && (
          <Button
            variant="gradient"
            onClick={() => {
              scrollToBottom()
              setShowNewMsg(false)
            }}
            className="absolute bottom-[58px] left-1/2 z-10 -translate-x-1/2 max-sm:zoom-75"
          >
            {t("chat.new-messages")}
          </Button>
        )}
      </div>
      {/* Input */}
      <div className="flex flex-col gap-1 max-sm:zoom-75">
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <MessageInput
              value={field.value}
              onChange={field.onChange}
              onSubmit={handleFormSubmit(handleSendMessage)}
              placeholder={isLoggedIn ? t("chat.placeholder") : t("chat.login-to-chat")}
              className={cn(
                "bg-chat-input-bg rounded-full backdrop-blur-xl transition-colors",
                errors.content && "ring-1 ring-red-500/60",
                CHAT_INPUT_HEIGHT
              )}
            />
          )}
        />
        {errors.content && (
          <Typography variant="caption" className="px-3 text-red-400">
            {errors.content.message}
          </Typography>
        )}
      </div>
      {/* User popup */}
      {popupMessage && (
        <UserPopup
          message={popupMessage}
          userRole={userRole}
          isPinned={isPinned(popupMessage.id)}
          onClose={() => setPopupMessage(null)}
          onReport={onReport}
          onDelete={handleDelete}
          onPin={handlePin}
          onUnpin={handleUnpin}
          onBanRoom={onBanRoom}
          onBanAll={onBanAll}
          onSetManager={onSetManager}
        />
      )}
    </div>
  )
}

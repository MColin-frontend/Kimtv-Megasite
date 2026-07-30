"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { RefreshCw } from "lucide-react"
import { z } from "zod"

import {
  chatroomOperateAction,
  fetchChatMessagesAction,
  fetchPinnedMessagesAction,
} from "@/server/actions/chat.action"
import { getTokenFromCookie, type KimtvUser } from "@/lib/auth-cookie"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useBoolean } from "@/hooks/use-boolean"
import { useRouter } from "@/hooks/use-router"

import { useTranslation } from "@/i18n"
import { env } from "@/config/env"
import { siteConfig } from "@/config/site"
import { HERO_VIDEO_PARAMS } from "@/constants/component/home.constants"
import {
  CHAT_CHANNEL,
  CHAT_CONNECTION_STATUS,
  CHAT_INPUT_HEIGHT,
  CHAT_MESSAGE_TYPE,
  CHAT_OPERATE_TYPE,
  CHAT_SCROLLBAR_STYLE,
  CHAT_SOCIAL_NAMES,
  CHAT_USER_ROLE,
  POLL_PARAM_KEY,
  POLL_VISIBLE,
  POLL_HIDDEN,
} from "@/constants/ui/ui-chat.constants"

import { getActivePollApi, votePollApi } from "@/features/live/api/poll.api"
import { PollVoteView } from "@/features/live/components/poll-vote-view"
import { PollChannelEnum } from "@/features/live/poll.constants"
import type { PollInterface } from "@/features/live/poll.models"
import { Button } from "@/components/ui/button"
import { Img } from "@/components/ui/image"
import { MessageInput } from "@/components/ui/message-input"
import { Typography } from "@/components/ui/typography"

import imgChat from "@assets/images/common/img-chat.png"
import imgFacebook from "@assets/images/layout/img-facebook.png"
import imgTele from "@assets/images/layout/img-tele.png"
import imgZalo from "@assets/images/layout/img-zalo.png"

import { MessageItem } from "./parts/message-item"
import { PinItemRow } from "./parts/pin-item-row"
import { UserPopup } from "./parts/user-popup"
import type { ChatMessage, ChatProps, ChatSocials, ConnectionStatus, UserRole } from "./types"

export type { ChatMessage, ChatSocials, ChatProps, UserRole, ConnectionStatus }
export type { ChatMessageType } from "./types"

const WS_RECONNECT_DELAY = 2000
const WS_HEARTBEAT_INTERVAL = 10_000

const DEFAULT_SOCIALS: ChatSocials = siteConfig.socials

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
  const { getParam, setParams, removeParams, pathname } = useRouter()
  const { isLoggedIn, user } = useAuth()

  const userRole = resolveChatRole(user, isLoggedIn)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([])
  const [poll, setPoll] = useState<PollInterface | null>(null)
  const [pollHidden, setPollHidden] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    CHAT_CONNECTION_STATUS.DISCONNECTED
  )
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
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
  const { value: showNewMsg, on: showNewMsgOn, off: showNewMsgOff } = useBoolean()
  const [expandedPinId, setExpandedPinId] = useState<string | number | null>(null)
  const [popupMessage, setPopupMessage] = useState<ChatMessage | null>(null)

  const listRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const wsRef = useRef<WebSocket | null>(null)
  const onPollMessageRef = useRef(onPollMessage)
  // eslint-disable-next-line react-hooks/refs
  onPollMessageRef.current = onPollMessage
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isPollHidden = poll !== null && pollHidden

  function handleClosePoll() {
    setPollHidden(true)
    setParams({ [POLL_PARAM_KEY]: POLL_HIDDEN }, { replace: true, scroll: false })
  }

  function handleRestorePoll() {
    setPollHidden(false)
    setParams({ [POLL_PARAM_KEY]: POLL_VISIBLE }, { replace: true, scroll: false })
  }

  async function handlePollVote(optionKeys: string[]) {
    if (!poll?.pollId) return
    const updated = await votePollApi(poll.pollId, optionKeys, poll.type)
    if (updated) return updated
  }
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectCountRef = useRef(0)
  const pageIndexRef = useRef(0)
  const loadingMoreRef = useRef(false)

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
        const wsUrl = `${env.wsBaseUrl}/chat?chatroom_id=${cId}&game_id=${gId}&token=${token}&lan=vi`
        console.log("[Chat] initWs → connecting to:", wsUrl, "| token:", token ? "✓" : "✗ (empty)")
        const ws = new WebSocket(wsUrl)

        wsRef.current = ws

        ws.addEventListener("open", () => {
          if (ws !== wsRef.current) return
          console.log("[Chat] WebSocket OPEN ✓ | chatroomId:", cId, "| gameId:", gId)
          setConnectionStatus(CHAT_CONNECTION_STATUS.CONNECTED)
          startHeartbeat()
          reconnectCountRef.current = 0
        })

        ws.addEventListener("message", ({ data: raw }) => {
          if (ws !== wsRef.current || raw === "ping") return

          try {
            const res = JSON.parse(raw) as Record<string, unknown>

            if (Object.values(PollChannelEnum).includes(res.channel as PollChannelEnum)) {
              onPollMessageRef.current?.(res.channel as string, res.data)
              if (!externalPoll) {
                const p = res.data as PollInterface
                if (res.channel === PollChannelEnum.START) {
                  setPoll(p)
                  setPollHidden(false)
                  setParams({ [POLL_PARAM_KEY]: POLL_VISIBLE }, { replace: true, scroll: false })
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
                  setPollHidden(false)
                  removeParams(POLL_PARAM_KEY, { replace: true, scroll: false })
                }
              }
              return
            }

            const data = res.data as Record<string, unknown> | undefined
            if (!data || (data.code as number) === 10) return
            if (res.channel === CHAT_CHANNEL.CHATROOM && data.content) {
              const msg: ChatMessage = {
                ...(data as unknown as ChatMessage),
                content: parseLinks(String(data.content)),
                userAvatar: (data.avatar as string | null) || undefined,
                sendTime: (data.timeMillis as number) || undefined,
              }
              setMessages((prev) => [...prev.slice(-200), msg])
            }
            if (res.channel === CHAT_OPERATE_TYPE.PIN_MESSAGE) {
              const msgs = data.messages
              setPinnedMessages(
                Array.isArray(msgs) ? (msgs as ChatMessage[]) : msgs ? [msgs as ChatMessage] : []
              )
            }
            if (res.channel === CHAT_CHANNEL.LIVE_END) {
              setMessages([])
              setPinnedMessages([])
            }
          } catch {
            // ignore malformed message
          }
        })

        ws.addEventListener("close", (_ev) => {
          if (ws !== wsRef.current) return
          setConnectionStatus(CHAT_CONNECTION_STATUS.DISCONNECTED)
          clearHeartbeat()
          wsRef.current = null
          if (reconnectCountRef.current < 4) {
            reconnectRef.current = setTimeout(() => {
              reconnectCountRef.current++
              initWsRef.current?.(cId, gId)
            }, WS_RECONNECT_DELAY)
          }
        })
        ws.addEventListener("error", (_ev) => {
          if (ws !== wsRef.current) return
          setConnectionStatus(CHAT_CONNECTION_STATUS.DISCONNECTED)
        })
      } catch {
        setConnectionStatus(CHAT_CONNECTION_STATUS.DISCONNECTED)
      }
    },
    [closeWs, startHeartbeat, clearHeartbeat, externalPoll]
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
        setMessages((prev) => [
          ...result.messages.map((m) => ({ ...m, content: parseLinks(m.content) })),
          ...prev,
        ])
      }
      setHasMoreMessages(result.hasMore)
    } finally {
      loadingMoreRef.current = false
    }
  }, [chatroomId, gameId, hasMoreMessages])

  useEffect(() => {
    if (!chatroomId) return
    pageIndexRef.current = 0
    Promise.all([
      fetchChatMessagesAction({ chatroomId, gameId, pageIndex: 0 }),
      fetchPinnedMessagesAction({ chatroomId, gameId }),
    ]).then(([chatResult, pinned]) => {
      setMessages(chatResult.messages.map((m) => ({ ...m, content: parseLinks(m.content) })))
      setHasMoreMessages(chatResult.hasMore)
      setPinnedMessages(pinned)
      setInitialLoading(false)
    })
  }, [chatroomId, gameId])

  useEffect(() => {
    if (!pollChatroomId || externalPoll) return
    getActivePollApi(pollChatroomId).then((p) => {
      if (p) {
        setPoll(p)
        setParams({ [POLL_PARAM_KEY]: POLL_VISIBLE }, { replace: true, scroll: false })
      } else {
        setPoll(null)
        // Không đưa removeParams vào deps để tránh loop — chỉ gọi 1 lần khi mount
        removeParams(POLL_PARAM_KEY, { replace: true, scroll: false })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollChatroomId, externalPoll])

  useEffect(() => {
    if (!chatroomId) return
    reconnectCountRef.current = 0
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initWs(chatroomId, gameId)
    return closeWs
  }, [chatroomId, gameId, isLoggedIn, initWs, closeWs])

  const handleSendMessage = ({ content }: ChatFormType) => {
    console.log("[Chat] handleSendMessage called", { content })
    console.log("[Chat] wsRef.current:", wsRef.current)
    console.log(
      "[Chat] readyState:",
      wsRef.current?.readyState,
      "(OPEN=1, CONNECTING=0, CLOSING=2, CLOSED=3)"
    )
    console.log("[Chat] chatroomId:", chatroomId, "| gameId:", gameId)
    console.log("[Chat] isLoggedIn:", isLoggedIn)
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("[Chat] Cannot send — WebSocket not OPEN")
      return
    }
    const payload = JSON.stringify({ type: 1, content: content })
    console.log("[Chat] Sending payload:", payload)
    wsRef.current.send(payload)
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
      showNewMsgOn()
    }
  }, [messages, scrollToBottom])

  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const atBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 2
    isAtBottomRef.current = atBottom
    if (atBottom) showNewMsgOff()
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
      operateType: CHAT_OPERATE_TYPE.PIN_MESSAGE,
      userId: msg.userId,
      chatroomId: chatroomId ?? msg.chatroomId,
      gameId,
      messageId: msg.id,
    }).catch(() => {})
  }

  const handleUnpin = (msg: ChatMessage) => {
    chatroomOperateAction({
      operateType: CHAT_OPERATE_TYPE.UNPIN_MESSAGE,
      userId: msg.userId,
      chatroomId: chatroomId ?? msg.chatroomId,
      gameId,
      messageId: msg.id,
    }).catch(() => {})
  }

  const handleDelete = useCallback(
    (msg: ChatMessage) => {
      chatroomOperateAction({
        operateType: CHAT_OPERATE_TYPE.DELETE_MESSAGE,
        userId: msg.userId,
        chatroomId: msg.chatroomId,
        gameId,
        messageId: msg.id,
      })
        .then(() => {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id))
        })
        .catch(() => {})
    },
    [gameId]
  )

  return (
    <div
      className={cn(
        "card-glow rounded-12 relative flex h-full min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden p-4 backdrop-blur-2xl max-sm:gap-2 max-sm:p-2",
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
      {!externalPoll && poll && !isPollHidden && (
        <div className="animate-poll-enter">
          <PollVoteView poll={poll} onVote={handlePollVote} onClose={handleClosePoll} />
        </div>
      )}
      {topContent && <div className="shrink-0">{topContent}</div>}

      {/* Messages section */}
      <div className="rounded-6 relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white/[0.03] backdrop-blur-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-3 pt-2.5 pb-1.5 max-sm:px-2 max-sm:py-1.5">
          <div className="flex items-center gap-2 max-sm:gap-1.5">
            <div className="border-gold/30 rounded-full border p-1 max-sm:p-0.5">
              <div className="border-gold/60 bg-gold rounded-full border p-1 max-sm:p-0.5">
                <Img
                  src={imgChat}
                  alt="chat"
                  objectFit="contain"
                  className="size-4 max-sm:size-3"
                />
              </div>
            </div>
            <Typography
              as="span"
              variant="h4"
              weight="800"
              className="max-sm:text-14 tracking-widest uppercase italic"
            >
              <span className="text-gold drop-shadow-gold">Live</span>
              <span className="text-white"> Chat</span>
            </Typography>
          </div>
          {/* Live badge */}
          <div className="bg-live-green-bg border-live-green/30 shadow-live-green-sm flex items-center gap-1.5 rounded-full border px-2.5 py-1 max-sm:gap-1 max-sm:px-2 max-sm:py-0.5">
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
          <div className="absolute top-[55px] right-0 left-0 z-20 flex flex-col gap-1 border-b border-white/6 pr-3 max-sm:top-[40px] max-sm:pr-0">
            {pinnedMessages.map((msg) => {
              const isExpanded = expandedPinId === msg.id
              const canUnpin =
                userRole === CHAT_USER_ROLE.ADMIN ||
                userRole === CHAT_USER_ROLE.ANCHOR ||
                userRole === CHAT_USER_ROLE.HOUSING_MANAGEMENT
              return (
                <PinItemRow
                  key={msg.id}
                  msg={msg}
                  isExpanded={isExpanded}
                  canUnpin={canUnpin}
                  onToggle={() => setExpandedPinId(isExpanded ? null : msg.id)}
                  onUnpin={() => handleUnpin(msg)}
                  pinLabel={t("chat.pin-label")}
                  tooltipUnpin={t("chat.actions.unpin")}
                  tooltipCollapse={t("chat.actions.collapse")}
                  tooltipExpand={t("chat.actions.expand")}
                  parseLinks={parseLinks}
                />
              )
            })}
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

          {initialLoading
            ? Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="relative mb-2 overflow-hidden px-[18px] py-1.5">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
                  <div className="flex gap-2">
                    {/* Avatar */}
                    <div
                      className="shrink-0 rounded-full bg-white/8"
                      style={{ width: 50, height: 50 }}
                    />
                    <div className="flex flex-1 flex-col gap-2 pt-1">
                      {/* Name row */}
                      <div className="flex items-center gap-2">
                        <div className="rounded-4 h-3.5 w-24 bg-white/8" />
                        <div className="rounded-4 h-3 w-12 bg-white/5" />
                      </div>
                      {/* Content lines */}
                      <div
                        className="rounded-4 h-3 bg-white/8"
                        style={{ width: `${60 + (i % 3) * 15}%` }}
                      />
                      {i % 2 === 0 && (
                        <div
                          className="rounded-4 h-3 bg-white/5"
                          style={{ width: `${40 + (i % 4) * 10}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            : messages.map((msg, i) => (
                <div key={`${msg.id}-${i}`} className="mb-2">
                  <MessageItem message={msg} onDoubleClick={handleDoubleClick} t={t} />
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
              showNewMsgOff()
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

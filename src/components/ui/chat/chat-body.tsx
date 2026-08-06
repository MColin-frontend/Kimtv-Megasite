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
import { HERO_VIDEO_PARAMS } from "@/constants/component/home.constants"
import {
  CHAT_CHANNEL,
  CHAT_CONNECTION_STATUS,
  CHAT_INPUT_HEIGHT,
  CHAT_MESSAGE_TYPE,
  CHAT_OPERATE_TYPE,
  CHAT_SCROLLBAR_STYLE,
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
import { MessageInput } from "@/components/ui/message-input"
import { Typography } from "@/components/ui/typography"

import { MessageItem } from "./parts/message-item"
import { PinItemRow } from "./parts/pin-item-row"
import { UserPopup } from "./parts/user-popup"
import type { ChatMessage, ChatProps, ConnectionStatus, UserRole } from "./types"

const WS_RECONNECT_DELAY = 2000
const WS_HEARTBEAT_INTERVAL = 10_000

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

export type ChatBodyProps = Omit<ChatProps, "socials" | "className">

export function ChatBody({
  onReport,
  onBanRoom,
  onBanAll,
  onSetManager,
  onPollMessage,
  topContent,
  chatroomId: chatroomIdProp,
  gameId: gameIdProp,
  externalPoll = false,
}: ChatBodyProps) {
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
  const isAnchor = !!roomIdFromUrl
  const chatroomId = isAnchor
    ? roomIdFromUrl!
    : (matchIdFromUrl ?? (chatroomIdProp != null ? String(chatroomIdProp) : undefined))
  const pollChatroomId = chatroomId
  const _gameIdFromUrl =
    _urlParams?.get(HERO_VIDEO_PARAMS.GAME_ID) ?? getParam(HERO_VIDEO_PARAMS.GAME_ID)
  const gameId = isAnchor ? 0 : Number(_gameIdFromUrl ?? 0) || gameIdProp || 0

  const parseLinks = (text: string) =>
    text.replace(
      /((www\.|https?:\/\/)[^\s]+)/g,
      (m) =>
        `<a href="${m.startsWith("www") ? `http://${m}` : m}" target="_blank" rel="noopener noreferrer">${m}</a>`
    )

  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }, [])

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
        const ws = new WebSocket(wsUrl)

        wsRef.current = ws

        ws.addEventListener("open", () => {
          if (ws !== wsRef.current) return
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

        ws.addEventListener("close", () => {
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
        ws.addEventListener("error", () => {
          if (ws !== wsRef.current) return
          setConnectionStatus(CHAT_CONNECTION_STATUS.DISCONNECTED)
        })
      } catch {
        setConnectionStatus(CHAT_CONNECTION_STATUS.DISCONNECTED)
      }
    },
    [closeWs, startHeartbeat, clearHeartbeat, externalPoll, setParams, removeParams]
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
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    const payload = JSON.stringify({ type: 1, content: content })
    wsRef.current.send(payload)
    resetForm()
  }

  const handleReconnect = useCallback(() => {
    reconnectCountRef.current = 0
    if (chatroomId) initWs(chatroomId, gameId)
  }, [chatroomId, gameId, initWs])

  const scrollToBottom = useCallback(() => {
    // useEffect (caller) fires post-paint — messages are in the DOM, no rAF needed.
    // Setting scrollTop to a large value lets the browser clamp it to the actual
    // maximum internally, eliminating the scrollHeight JS read that would otherwise
    // force a synchronous layout recalculation.
    const el = listRef.current
    if (el) el.scrollTop = 999999
  }, [])

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom()
    } else {
      showNewMsgOn()
    }
  }, [messages, scrollToBottom, showNewMsgOn])

  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const atBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 2
    isAtBottomRef.current = atBottom
    if (atBottom) showNewMsgOff()
    if (el.scrollTop <= 60 && hasMoreMessages) handleLoadMore()
  }, [hasMoreMessages, handleLoadMore, showNewMsgOff])

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
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Poll slot */}
      {!externalPoll && poll && !isPollHidden && (
        <div className="animate-poll-enter shrink-0">
          <PollVoteView poll={poll} onVote={handlePollVote} onClose={handleClosePoll} />
        </div>
      )}
      {topContent && <div className="shrink-0">{topContent}</div>}

      {/* Pinned messages — absolute from top of this container (below header) */}
      {pinnedMessages.length > 0 && (
        <div className="absolute top-0 right-0 left-0 z-20 flex flex-col gap-1 border-b border-white/6 pr-3 max-sm:pr-0">
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
                  <div
                    className="shrink-0 rounded-full bg-white/8"
                    style={{ width: 50, height: 50 }}
                  />
                  <div className="flex flex-1 flex-col gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="rounded-4 h-3.5 w-24 bg-white/8" />
                      <div className="rounded-4 h-3 w-12 bg-white/5" />
                    </div>
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
              className="bg-chat-status hover:bg-chat-status/80 gap-1.5 rounded-full text-gray-900"
            >
              <RefreshCw className="size-3.5" />
              {t("chat.reconnect")}
            </Button>
          </div>
        )}
      </div>

      {/* New message button — positioned above the input (input ~62px from bottom) */}
      {showNewMsg && (
        <Button
          variant="gradient"
          onClick={() => {
            scrollToBottom()
            showNewMsgOff()
          }}
          className="absolute bottom-[62px] left-1/2 z-10 -translate-x-1/2 max-sm:zoom-75"
        >
          {t("chat.new-messages")}
        </Button>
      )}

      {/* Input */}
      <div className="flex shrink-0 flex-col gap-1 border-t border-white/8 px-3 py-2 max-sm:zoom-75">
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

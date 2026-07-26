"use client"

import { useEffect, useRef } from "react"

import { env } from "@/config/env"

import { getPollWsUrl } from "@/features/live/api/poll.api"
import { PollChannelEnum } from "@/features/live/poll.constants"
import type { PollInterface } from "@/features/live/poll.models"

/* ── Constants ───────────────────────────────────────────── */

const WS_RECONNECT_DELAY = 2_000
const WS_HEARTBEAT_INTERVAL = 10_000
const WS_MAX_RECONNECT = 4

interface PollWsMessage {
  channel: PollChannelEnum
  data: PollInterface
}

/* ── Hook ────────────────────────────────────────────────── */

interface UsePollSocketOptions {
  chatroomId: string | number | null | undefined
  gameId?: number
  onStart?: (poll: PollInterface) => void
  onActive?: (poll: PollInterface) => void
  onUpdate?: (poll: PollInterface) => void
  onClosed?: () => void
}

export function usePollSocket({
  chatroomId,
  gameId = 0,
  onStart,
  onActive,
  onUpdate,
  onClosed,
}: UsePollSocketOptions): void {
  const wsRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectCount = useRef(0)

  const onStartRef = useRef(onStart)
  const onActiveRef = useRef(onActive)
  const onUpdateRef = useRef(onUpdate)
  const onClosedRef = useRef(onClosed)

  useEffect(() => {
    onStartRef.current = onStart
    onActiveRef.current = onActive
    onUpdateRef.current = onUpdate
    onClosedRef.current = onClosed
  })

  useEffect(() => {
    if (!chatroomId || !env.wsBaseUrl) return
    const cId = chatroomId

    function clearTimer() {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    function heartbeat() {
      timerRef.current = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ op_type: 9 }))
        }
        heartbeat()
      }, WS_HEARTBEAT_INTERVAL)
    }

    function connect() {
      const url = getPollWsUrl(cId, gameId)
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.addEventListener("open", () => {
        if (ws !== wsRef.current) return
        reconnectCount.current = 0
        heartbeat()
      })

      ws.addEventListener("message", ({ data: raw }) => {
        if (ws !== wsRef.current || raw === "ping") return
        try {
          const msg = JSON.parse(raw) as PollWsMessage
          if (!msg.channel) return
          if (msg.channel === PollChannelEnum.START) onStartRef.current?.(msg.data)
          if (msg.channel === PollChannelEnum.ACTIVE) onActiveRef.current?.(msg.data)
          if (msg.channel === PollChannelEnum.UPDATE) onUpdateRef.current?.(msg.data)
          if (msg.channel === PollChannelEnum.CLOSED) onClosedRef.current?.()
        } catch {
          console.error("[poll-ws] parse error", raw)
        }
      })

      ws.addEventListener("close", (ev) => {
        if (ws !== wsRef.current) return
        console.warn(
          "[poll-ws] closed — code:",
          ev.code,
          "reason:",
          ev.reason || "(none)",
          "reconnect:",
          reconnectCount.current
        )
        clearTimer()
        wsRef.current = null
        if (reconnectCount.current < WS_MAX_RECONNECT) {
          timerRef.current = setTimeout(() => {
            reconnectCount.current++
            connect()
          }, WS_RECONNECT_DELAY)
        } else {
          console.warn("[poll-ws] max reconnect reached")
        }
      })

      ws.addEventListener("error", (ev) => {
        console.error("[poll-ws] error:", ev)
      })
    }

    reconnectCount.current = 0
    connect()

    return () => {
      clearTimer()
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [chatroomId, gameId])
}

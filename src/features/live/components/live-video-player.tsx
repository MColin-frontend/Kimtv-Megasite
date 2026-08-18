"use client"

import { useEffect, useRef } from "react"

import {
  buildStreamBufferingPayload,
  buildStreamErrorPayload,
  buildStreamFullscreenPayload,
  buildStreamPausedPayload,
  buildStreamProgressPayload,
  buildStreamRecoveredPayload,
  buildStreamResumedPayload,
  buildStreamStartedPayload,
  clearStreamWatching,
  markStreamPlaybackPaused,
  registerStreamWatching,
  STREAM_PROGRESS_INTERVAL_MS,
} from "@/lib/tracking.constants"
import { useAuth } from "@/hooks/use-auth"
import { useTracking } from "@/hooks/use-tracking"

import { VideoPlayer } from "@/components/ui/video"

import { buildStreamSources } from "../api/live.api"

interface LiveVideoPlayerProps {
  liveUrls?: Array<{ liveUrl: string | null; liveUrlFlv: string | null }>
  matchId?: string
  roomId?: string
  gameId?: number
}

export function LiveVideoPlayer({
  liveUrls = [],
  matchId = "",
  roomId = "",
  gameId,
}: LiveVideoPlayerProps) {
  const sources = liveUrls.flatMap((u, i) =>
    buildStreamSources(u.liveUrl, u.liveUrlFlv, `#${i + 1}`)
  )

  const { user } = useAuth()
  const userId =
    user?.userId != null ? String(user.userId) : user?.uid != null ? String(user.uid) : null
  const {
    onClick: track,
    onStreamEndedByUserUnload,
    tryTrackStreamEndedByUser,
  } = useTracking({ userId })

  const hasStartedRef = useRef(false)
  const isPlayingRef = useRef(false)
  // PC: track last error for stream_recovered detection
  const lastErrorRef = useRef<{ errorCode: string; errorMessage: string } | null>(null)
  // PC: flag for resume-after-pause (not recovery)
  const resumeAfterPauseRef = useRef(false)

  useEffect(() => {
    hasStartedRef.current = false
    isPlayingRef.current = false
    lastErrorRef.current = null
    resumeAfterPauseRef.current = false
    return () => {
      tryTrackStreamEndedByUser()
      clearStreamWatching()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, roomId])

  // STREAM_PROGRESS heartbeat — fires every 30s while stream is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPlayingRef.current) return
      track(buildStreamProgressPayload({ matchId, roomId, gameId }))
    }, STREAM_PROGRESS_INTERVAL_MS)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, roomId, gameId])

  useEffect(() => {
    return onStreamEndedByUserUnload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, roomId])

  return (
    <VideoPlayer
      key={sources[0]?.url ?? "no-source"}
      sources={sources}
      isLive
      autoplay
      onPlay={() => {
        isPlayingRef.current = true
        if (!hasStartedRef.current) {
          // PC: stream_started — lần đầu phát
          hasStartedRef.current = true
          registerStreamWatching({ matchId, roomId })
          track(buildStreamStartedPayload({ matchId, roomId }))
          track(buildStreamProgressPayload({ matchId, roomId, gameId }))
        } else if (lastErrorRef.current && hasStartedRef.current) {
          // PC: stream_recovered — resume sau error
          const { errorCode, errorMessage } = lastErrorRef.current
          lastErrorRef.current = null
          resumeAfterPauseRef.current = false
          track(buildStreamRecoveredPayload({ matchId, gameId, errorCode, errorMessage }))
          track(buildStreamProgressPayload({ matchId, roomId, gameId }))
        } else if (resumeAfterPauseRef.current) {
          // PC: stream_resumed — resume sau pause
          resumeAfterPauseRef.current = false
          track(buildStreamResumedPayload({ matchId, roomId }))
          track(buildStreamProgressPayload({ matchId, roomId, gameId }))
        }
      }}
      onPause={() => {
        isPlayingRef.current = false
        resumeAfterPauseRef.current = true
        markStreamPlaybackPaused()
        track(buildStreamPausedPayload({ matchId, roomId }))
      }}
      onError={() => {
        const errorCode = "STREAM_ERROR"
        const errorMessage = "Stream playback error"
        lastErrorRef.current = { errorCode, errorMessage }
        track(buildStreamErrorPayload({ matchId, gameId, errorCode, errorMessage }))
      }}
      onWaiting={() => {
        // PC: stream_buffering — player đang chờ dữ liệu (stream đứng)
        if (hasStartedRef.current) {
          track(
            buildStreamBufferingPayload({
              matchId,
              gameId,
              errorCode: "BUFFERING",
              errorMessage: "waiting",
            })
          )
        }
      }}
      onFullscreenChange={() => {
        track(buildStreamFullscreenPayload({ matchId }))
      }}
    />
  )
}

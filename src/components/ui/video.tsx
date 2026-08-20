"use client"

import { useEffect, useId, useRef } from "react"
import { preload } from "react-dom"
import dynamic from "next/dynamic"
import type { SimplePlayer } from "xgplayer"

import { resolveStreamPlayerError } from "@/lib/stream-player-error"
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
import { cn } from "@/lib/utils"
import { useAdPlacements } from "@/hooks/tanstack/use-ad-placements"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "@/hooks/use-router"
import { useTracking } from "@/hooks/use-tracking"

import { useTranslation } from "@/i18n"
import { TrackingValueEnum } from "@/enums/tracking.enum"

import { Typography } from "@/components/ui/typography"

import "xgplayer/dist/index.min.css"

import imgLiveSmall from "@assets/images/common/img-live-small.gif"
import imgNoSource from "@assets/images/common/img-no-source.webp"
import videoBanner from "@assets/videos/common/video-banner.mp4"

const AdBanner = dynamic(() => import("@/components/ui/ad-banner").then((m) => m.AdBanner), {
  ssr: false,
})

// ─── xgplayer event name constants — không hardcode string ───────────────────
const PLAYER_EVENT = {
  READY: "ready",
  PLAYING: "playing",
  PAUSE: "pause",
  ENDED: "ended",
  ERROR: "error",
  FULLSCREEN_CHANGE: "fullscreen_change",
  WAITING: "waiting",
  AUTOPLAY_PREVENTED: "autoplay_was_prevented",
  RESOURCE_READY: "resourceReady",
} as const

export interface VideoSource {
  url: string
  name?: string
}

export interface VideoPlayerProps {
  /** Single URL hoặc dùng sources cho multi-source */
  url?: string
  sources?: VideoSource[]
  poster?: string
  /** true = live stream (HLS/FLV), false = VOD (MP4/HLS) */
  isLive?: boolean
  autoplay?: boolean
  autoplayMuted?: boolean
  volume?: number
  /** false = ẩn controls hoàn toàn */
  controls?: boolean
  pip?: boolean
  /** Unique id cho player DOM mount */
  id?: string
  className?: string
  onReady?: () => void
  onPlay?: () => void
  onPause?: () => void
  onError?: (error: unknown) => void
  onEnded?: () => void
  onFullscreenChange?: () => void
  onWaiting?: () => void
}

function detectFormat(url: string) {
  if (url.includes(".m3u8")) return "hls"
  if (url.includes(".flv")) return "flv"
  return "native"
}

export function VideoPlayer({
  url,
  sources,
  poster,
  isLive = false,
  autoplay = true,
  autoplayMuted = false,
  volume = 0.6,
  controls = true,
  pip = true,
  id,
  className,
  onReady,
  onPlay,
  onPause,
  onError,
  onEnded,
  onFullscreenChange,
  onWaiting,
}: VideoPlayerProps) {
  const generatedId = useId()
  const mountId = id ?? `xgp-${generatedId.replace(/[^a-z0-9]/gi, "")}`
  const playerRef = useRef<SimplePlayer | null>(null)
  const isPlayingRef = useRef(false)

  const { t } = useTranslation()
  const { data: ads } = useAdPlacements()
  const playerOverlay = ads?.playerOverlay || []

  const { getParam, pathname } = useRouter()
  const matchId = pathname.split("/").at(-1) ?? ""
  const gameId = getParam("game_id") ? Number(getParam("game_id")) : undefined

  const { user } = useAuth()
  const userId =
    user?.userId != null ? String(user.userId) : user?.uid != null ? String(user.uid) : null
  const {
    onClick: track,
    onStreamEndedByUserUnload,
    tryTrackStreamEndedByUser,
  } = useTracking({ userId })

  const hasStartedRef = useRef(false)
  const lastErrorRef = useRef<{ errorCode: string; errorMessage: string } | null>(null)
  const resumeAfterPauseRef = useRef(false)
  const streamBufferingPendingRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let destroyed = false

    async function initPlayer() {
      const activeUrl = url ?? sources?.[0]?.url
      if (!activeUrl) return

      // Detect formats across ALL sources to load correct plugins
      const allUrls = [url, ...(sources?.map((s) => s.url) ?? [])].filter(Boolean) as string[]
      const formats = new Set(allUrls.map(detectFormat))

      const [xgMod, hlsMod, flvMod] = await Promise.all([
        import("xgplayer"),
        formats.has("hls") ? import("xgplayer-hls") : Promise.resolve(null),
        formats.has("flv") ? import("xgplayer-flv") : Promise.resolve(null),
      ])

      if (destroyed) return

      // CJS build: module.exports = PresetPlayer (function) → interop default
      // ESM build: no default, only named SimplePlayer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Player = ((xgMod as any).default ?? (xgMod as any).SimplePlayer) as typeof SimplePlayer

      const plugins: unknown[] = []
      // xgplayer-hls exports HlsPlugin as default
      if (hlsMod) plugins.push(hlsMod.default ?? hlsMod.HlsPlugin)
      // xgplayer-flv exports FlvPlugin as default
      if (flvMod) plugins.push(flvMod.default ?? flvMod.FlvPlugin)

      const resourceList =
        sources && sources.length > 1
          ? sources.map((s, i) => ({ name: s.name ?? `Nguồn ${i + 1}`, url: s.url }))
          : undefined

      playerRef.current = new Player({
        id: mountId,
        url: activeUrl,
        poster: poster || undefined,
        plugins,
        isLive,
        autoplay,
        autoplayMuted,
        volume,
        controls,
        pip,
        playsinline: true,
        width: "100%",
        height: "100%",
        fluid: false,
        cssFullscreen: false,
        playbackRate: !isLive,
        ignores: ["start"],
      })

      const player = playerRef.current

      player.on(PLAYER_EVENT.READY, () => {
        if (destroyed) return
        onReady?.()
        if (resourceList && resourceList.length > 1) {
          player.emit(PLAYER_EVENT.RESOURCE_READY, resourceList)
        }
      })
      player.on(PLAYER_EVENT.PLAYING, () => {
        if (!destroyed) {
          isPlayingRef.current = true
          if (isLive && matchId) {
            streamBufferingPendingRef.current = false
            registerStreamWatching({ matchId, streamEntrySource: TrackingValueEnum.DETAIL })
            if (!hasStartedRef.current) {
              hasStartedRef.current = true
              track(
                buildStreamStartedPayload({ matchId, streamEntrySource: TrackingValueEnum.DETAIL })
              )
              track(buildStreamProgressPayload({ matchId, gameId }))
            } else if (lastErrorRef.current) {
              const { errorCode, errorMessage } = lastErrorRef.current
              lastErrorRef.current = null
              resumeAfterPauseRef.current = false
              track(buildStreamRecoveredPayload({ matchId, gameId, errorCode, errorMessage }))
              track(buildStreamProgressPayload({ matchId, gameId }))
            } else if (resumeAfterPauseRef.current) {
              resumeAfterPauseRef.current = false
              track(buildStreamResumedPayload({ matchId }))
              track(buildStreamProgressPayload({ matchId, gameId }))
            }
            if (intervalRef.current == null) {
              intervalRef.current = setInterval(() => {
                if (!isPlayingRef.current) return
                track(buildStreamProgressPayload({ matchId, gameId }))
              }, STREAM_PROGRESS_INTERVAL_MS)
            }
          }
          onPlay?.()
        }
      })
      player.on(PLAYER_EVENT.PAUSE, () => {
        if (!destroyed) {
          isPlayingRef.current = false
          if (isLive && matchId) {
            clearInterval(intervalRef.current ?? undefined)
            intervalRef.current = null
            resumeAfterPauseRef.current = true
            markStreamPlaybackPaused()
            track(buildStreamPausedPayload({ matchId }))
          }
          onPause?.()
        }
      })
      player.on(PLAYER_EVENT.ENDED, () => {
        if (!destroyed) {
          isPlayingRef.current = false
          onEnded?.()
        }
      })
      player.on(PLAYER_EVENT.ERROR, (err: unknown) => {
        if (!destroyed) {
          isPlayingRef.current = false
          if (isLive && matchId) {
            const { errorCode, errorMessage } = resolveStreamPlayerError(err)
            lastErrorRef.current = { errorCode, errorMessage }
            track(buildStreamErrorPayload({ matchId, gameId, errorCode, errorMessage }))
          }
          onError?.(err)
        }
      })
      player.on(PLAYER_EVENT.FULLSCREEN_CHANGE, () => {
        if (!destroyed) {
          if (isLive && matchId) track(buildStreamFullscreenPayload({ matchId }))
          onFullscreenChange?.()
        }
      })
      player.on(PLAYER_EVENT.WAITING, () => {
        if (!destroyed) {
          if (isLive && matchId && hasStartedRef.current && !streamBufferingPendingRef.current) {
            streamBufferingPendingRef.current = true
            track(
              buildStreamBufferingPayload({
                matchId,
                gameId,
                errorCode: "BUFFERING",
                errorMessage: "waiting",
              })
            )
          }
          onWaiting?.()
        }
      })

      player.on(PLAYER_EVENT.AUTOPLAY_PREVENTED, () => {
        if (destroyed) return
        player.destroy()
        setTimeout(() => {
          if (!destroyed) initPlayer()
        }, 100)
      })
    }

    initPlayer()

    return () => {
      destroyed = true
      try {
        const p = playerRef.current
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const videoEl = (p as any)?.video || (p as any)?.media
        if (videoEl) {
          videoEl.muted = true
          videoEl.pause?.()
          videoEl.removeAttribute?.("src")
          videoEl.load?.()
        }
        p?.pause?.()
        p?.destroy?.()
      } catch {}
      clearInterval(intervalRef.current ?? undefined)
      intervalRef.current = null
      isPlayingRef.current = false
      playerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, sources?.map((s) => s.url).join(",")])

  useEffect(() => {
    if (!isLive || !matchId) return
    hasStartedRef.current = false
    lastErrorRef.current = null
    resumeAfterPauseRef.current = false
    streamBufferingPendingRef.current = false
    return () => {
      clearInterval(intervalRef.current ?? undefined)
      intervalRef.current = null
      tryTrackStreamEndedByUser()
      clearStreamWatching()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId])

  useEffect(() => {
    if (!isLive || !matchId) return
    return onStreamEndedByUserUnload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId])

  const hasSource = !!(url ?? sources?.[0]?.url)

  if (!hasSource) {
    preload(imgNoSource.src, { as: "image", fetchPriority: "high" })
  }

  return (
    <div
      className={cn(
        "panel-news rounded-8 relative min-h-0 flex-1 overflow-hidden max-lg:aspect-video max-lg:flex-none",
        className
      )}
    >
      {!hasSource && (
        <div>
          <div
            className="absolute inset-0 z-0 opacity-30"
            style={{
              backgroundImage: `url(${imgNoSource.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="card-gold rounded-8 relative overflow-hidden px-8 py-5 max-sm:scale-50">
              <div className="via-gold/50 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
              <Typography variant="body" weight="700" className="text-gold drop-shadow-gold">
                {t("video.no-source.title")}
              </Typography>
              <Typography variant="caption" className="text-gold/50 mt-1.5 block">
                {t("video.no-source.description")}
              </Typography>
            </div>
          </div>
        </div>
      )}
      <div
        id={mountId}
        className="xg-mount relative h-full w-full overflow-hidden rounded-[inherit]"
      />

      {/* Vị trí 0: full overlay phủ toàn video */}
      <AdBanner
        src={playerOverlay?.[0]?.mediaPc || null}
        href={playerOverlay?.[0]?.jumpUrl || null}
        fallback={videoBanner}
        className="video-ad-banner absolute bottom-0 left-0 z-10 w-full"
        skeletonClassName="aspect-[1200/58]"
        sizes="100vw"
      />
      {/* Vị trí 1: banner góc trái trên — w-16=64px, max-sm:w-8=32px */}
      <AdBanner
        src={playerOverlay?.[1]?.mediaPc || null}
        href={playerOverlay?.[1]?.jumpUrl || null}
        fallback={imgLiveSmall}
        className="video-ad-banner absolute top-1 left-1 z-10 w-16 max-md:w-12 max-sm:w-8"
        skeletonClassName="aspect-[60/25]"
        sizes="(max-width: 640px) 32px, (max-width: 768px) 48px, 64px"
      />
    </div>
  )
}

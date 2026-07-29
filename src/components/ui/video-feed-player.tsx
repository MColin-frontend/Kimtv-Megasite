"use client"

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react"

import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type XgPlayer = any

export interface VideoFeedPlayerHandle {
  play: () => Promise<void> | void
  pause: () => void
  setMuted: (muted: boolean, volume?: number) => void
  seek: (time: number) => void
  getCurrentTime: () => number
  getDuration: () => number
}

export interface VideoFeedPlayerProps {
  url: string
  poster?: string
  muted?: boolean
  volume?: number
  autoplay?: boolean
  /** Khi false, player pause và preload — dùng cho slide prev/next trong feed stack. */
  active?: boolean
  onReady?: () => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onError?: (err: unknown) => void
  className?: string
}

/**
 * Xgplayer wrapper dành cho feed dạng TikTok — không có controls, expose
 * imperative ref để parent tự điều khiển play/pause/seek/mute.
 *
 * Khác với VideoPlayer (src/components/ui/video.tsx):
 * - Không hiển thị thanh controls, replay button, start button
 * - Hỗ trợ MP4, HLS (.m3u8), FLV (.flv) tự động qua format detection
 * - Expose VideoFeedPlayerHandle qua forwardRef
 */
export const VideoFeedPlayer = forwardRef<VideoFeedPlayerHandle, VideoFeedPlayerProps>(
  function VideoFeedPlayer(
    {
      url,
      poster,
      muted = false,
      volume = 0.8,
      autoplay = true,
      active,
      onReady,
      onPlay,
      onPause,
      onEnded,
      onTimeUpdate,
      onError,
      className,
    },
    ref
  ) {
    const generatedId = useId()
    const mountId = `vfp-${generatedId.replace(/[^a-z0-9]/gi, "")}`
    const playerRef = useRef<XgPlayer>(null)
    const mutedRef = useRef(muted)
    const volumeRef = useRef(volume)
    const activeRef = useRef(active ?? autoplay)
    const hasPlayedRef = useRef(false)
    const userPausedRef = useRef(false)
    const onReadyRef = useRef(onReady)
    const onPlayRef = useRef(onPlay)
    const onPauseRef = useRef(onPause)
    const onEndedRef = useRef(onEnded)
    const onTimeUpdateRef = useRef(onTimeUpdate)
    const onErrorRef = useRef(onError)

    mutedRef.current = muted
    volumeRef.current = volume
    activeRef.current = active ?? autoplay
    onReadyRef.current = onReady
    onPlayRef.current = onPlay
    onPauseRef.current = onPause
    onEndedRef.current = onEnded
    onTimeUpdateRef.current = onTimeUpdate
    onErrorRef.current = onError

    function getVideoEl(): HTMLVideoElement | null {
      const p = playerRef.current
      if (!p) return null
      return p.video ?? p.media ?? null
    }

    useImperativeHandle(ref, () => ({
      play: () => {
        userPausedRef.current = false
        const p = playerRef.current
        if (!p) return
        const v = getVideoEl()
        if (v) {
          v.muted = mutedRef.current
          v.volume = mutedRef.current ? 0 : volumeRef.current
          void v.play?.()
        }
        return p.play?.()
      },
      pause: () => {
        userPausedRef.current = true
        const v = getVideoEl()
        v?.pause?.()
        playerRef.current?.pause?.()
      },
      setMuted: (m: boolean, vol?: number) => {
        const p = playerRef.current
        if (!p) return
        const actualVol = vol ?? volumeRef.current
        const v = getVideoEl()
        if (v) {
          v.muted = m
          v.volume = m ? 0 : actualVol
        }
        try {
          if ("muted" in p) p.muted = m
          if ("volume" in p) p.volume = m ? 0 : actualVol
        } catch {}
      },
      seek: (t: number) => {
        const v = getVideoEl()
        if (v && Number.isFinite(t)) v.currentTime = t
      },
      getCurrentTime: () => getVideoEl()?.currentTime ?? 0,
      getDuration: () => getVideoEl()?.duration ?? 0,
    }))

    useEffect(() => {
      const p = playerRef.current
      if (!p) return
      const shouldPlay = activeRef.current && !userPausedRef.current
      if (shouldPlay) {
        void p.play?.()
      } else {
        p.pause?.()
      }
    }, [active])

    useEffect(() => {
      let destroyed = false
      hasPlayedRef.current = false
      userPausedRef.current = false

      async function initPlayer() {
        if (!url) return

        const isHls = url.includes(".m3u8")
        const isFlv = url.includes(".flv")

        const [xgMod, hlsMod, flvMod] = await Promise.all([
          import("xgplayer"),
          isHls ? import("xgplayer-hls") : Promise.resolve(null),
          isFlv ? import("xgplayer-flv") : Promise.resolve(null),
        ])

        if (destroyed) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Player = ((xgMod as any).default ?? (xgMod as any).SimplePlayer) as new (
          config: object
        ) => XgPlayer

        const plugins: unknown[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (hlsMod) plugins.push((hlsMod as any).default ?? (hlsMod as any).HlsPlugin)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (flvMod) plugins.push((flvMod as any).default ?? (flvMod as any).FlvPlugin)

        playerRef.current = new Player({
          id: mountId,
          url,
          poster: poster || undefined,
          plugins,
          isLive: false,
          autoplay,
          autoplayMuted: muted,
          volume: muted ? 0 : volume,
          controls: false,
          pip: false,
          playsinline: true,
          width: "100%",
          height: "100%",
          fluid: false,
          cssFullscreen: false,
          ignores: ["start"],
        })

        const p = playerRef.current

        p.on("ready", () => {
          if (destroyed) return
          const v = getVideoEl()
          if (v) {
            v.muted = mutedRef.current
            v.volume = mutedRef.current ? 0 : volumeRef.current
            v.style.objectFit = "contain"
            v.style.width = "100%"
            v.style.height = "100%"
          }
          onReadyRef.current?.()
          if (activeRef.current && !userPausedRef.current) {
            void p.play?.()
          }
        })
        p.on("playing", () => {
          hasPlayedRef.current = true
          if (!destroyed) onPlayRef.current?.()
        })
        p.on("pause", () => {
          if (!destroyed && hasPlayedRef.current) onPauseRef.current?.()
        })
        p.on("ended", () => {
          if (!destroyed) onEndedRef.current?.()
        })
        p.on("error", (err: unknown) => {
          if (!destroyed) onErrorRef.current?.(err)
        })
        p.on("timeupdate", () => {
          if (destroyed || !onTimeUpdateRef.current) return
          const v = getVideoEl()
          if (!v) return
          onTimeUpdateRef.current(v.currentTime ?? 0, v.duration ?? 0)
        })
        p.on("autoplay_was_prevented", () => {
          if (destroyed) return
          p.destroy()
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
          const v = getVideoEl()
          if (v) {
            v.muted = true
            v.pause?.()
            v.removeAttribute?.("src")
            v.load?.()
          }
          p?.pause?.()
          p?.destroy?.()
        } catch {}
        playerRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url])

    return (
      <div className={cn("relative h-full w-full bg-black", className)}>
        <div
          id={mountId}
          className="h-full w-full overflow-hidden [&_.xgplayer]:pointer-events-none [&_.xgplayer-controls]:!hidden [&_.xgplayer-poster]:!hidden [&_.xgplayer-replay]:!hidden [&_.xgplayer-start]:!hidden [&_video]:h-full [&_video]:w-full [&_video]:object-contain"
        />
      </div>
    )
  }
)

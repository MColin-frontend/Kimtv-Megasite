"use client"

import { useEffect, useId, useRef } from "react"
import dynamic from "next/dynamic"
import NextImage from "next/image"
import type { SimplePlayer } from "xgplayer"

import { cn } from "@/lib/utils"
import { useAdPlacements } from "@/hooks/tanstack/use-ad-placements"

import { useTranslation } from "@/i18n"

import { Typography } from "@/components/ui/typography"

import imgLiveSmall from "@assets/images/common/img-live-small.gif"
import imgNoSource from "@assets/images/common/img-no-source.png"
import videoBanner from "@assets/videos/common/video-banner.mp4"

const AdBanner = dynamic(() => import("@/components/ui/ad-banner").then((m) => m.AdBanner), {
  ssr: false,
})

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
}: VideoPlayerProps) {
  const generatedId = useId()
  const mountId = id ?? `xgp-${generatedId.replace(/[^a-z0-9]/gi, "")}`
  const playerRef = useRef<SimplePlayer | null>(null)

  const { t } = useTranslation()
  const { data: ads } = useAdPlacements()
  const playerOverlay = ads?.playerOverlay || []

  useEffect(() => {
    if (!document.getElementById("xgplayer-css")) {
      const link = document.createElement("link")
      link.id = "xgplayer-css"
      link.rel = "stylesheet"
      link.href = "/xgplayer.min.css"
      document.head.appendChild(link)
    }
    if (!document.getElementById("xgplayer-overrides-css")) {
      const link = document.createElement("link")
      link.id = "xgplayer-overrides-css"
      link.rel = "stylesheet"
      link.href = "/xgplayer-overrides.css"
      document.head.appendChild(link)
    }
  }, [])

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

      player.on("ready", () => {
        if (destroyed) return
        onReady?.()
        if (resourceList && resourceList.length > 1) {
          player.emit("resourceReady", resourceList)
        }
      })
      player.on("playing", () => {
        if (!destroyed) onPlay?.()
      })
      player.on("pause", () => {
        if (!destroyed) onPause?.()
      })
      player.on("ended", () => {
        if (!destroyed) onEnded?.()
      })
      player.on("error", (err: unknown) => {
        if (!destroyed) onError?.(err)
      })

      player.on("autoplay_was_prevented", () => {
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
      playerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, sources?.map((s) => s.url).join(",")])

  const hasSource = !!(url ?? sources?.[0]?.url)

  return (
    <div
      className={cn(
        "panel-news rounded-8 relative min-h-0 flex-1 overflow-hidden max-lg:aspect-video max-lg:flex-none",
        className
      )}
    >
      {!hasSource && (
        <>
          <NextImage
            src={imgNoSource}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="z-0 object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 z-[1] bg-black/40" />

          <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="card-gold rounded-8 relative overflow-hidden px-4 py-3.5 sm:px-8 sm:py-5">
              <div className="via-gold/50 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
              <Typography variant="body" weight="700" className="text-gold drop-shadow-gold">
                {t("video.no-source.title")}
              </Typography>
              <Typography variant="caption" className="text-gold/50 mt-1.5 block">
                {t("video.no-source.description")}
              </Typography>
            </div>
          </div>
        </>
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
      />
      {/* Vị trí 1: banner góc trái trên */}
      <AdBanner
        src={playerOverlay?.[1]?.mediaPc || null}
        href={playerOverlay?.[1]?.jumpUrl || null}
        fallback={imgLiveSmall}
        className="video-ad-banner absolute top-1 left-1 z-10 w-16 max-md:w-12 max-sm:w-8"
        skeletonClassName="aspect-[60/25]"
      />
    </div>
  )
}

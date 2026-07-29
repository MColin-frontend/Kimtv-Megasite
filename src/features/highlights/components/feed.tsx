"use client"

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { ReactSVG } from "react-svg"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react"

import { cn, formatCount, formatDuration } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useDisclosure } from "@/hooks/useDisclosure"

import { useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"
import { siteConfig } from "@/config/site"
import { FeedMenu } from "@/enums/highlights.enum"

import {
  fetchVideoFeed,
  toggleFollowAction,
  toggleLikeAction,
} from "@/features/highlights/api/highlights.api"
import type { HighlightVideoInterface } from "@/features/highlights/highlight.models"
import { FILTER_MENU_CONFIG, LINK_MENU_CONFIG } from "@/features/highlights/highlights.constants"
import { resolveIsLiked } from "@/features/highlights/highlights.utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { Img } from "@/components/ui/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Typography } from "@/components/ui/typography"
import type { VideoFeedPlayerHandle } from "@/components/ui/video-feed-player"

import icShare from "@assets/icons/common/ic-share.svg"
import icDiscount from "@assets/icons/video/ic-discount.svg"
import icGuide from "@assets/icons/video/ic-guide.svg"
import icNews from "@assets/icons/video/ic-news.svg"
import icOutstanding from "@assets/icons/video/ic-outstanding.svg"
import icTopTrending from "@assets/icons/video/ic-top-trending.svg"

import { FeedSkeleton } from "./skeleton"

function svgSrc(mod: unknown): string {
  return typeof mod === "string" ? mod : (mod as { src: string }).src
}

const menuIconClass =
  "size-5 shrink-0 [&>div]:flex [&>div]:items-center [&>div]:justify-center [&_svg]:h-5! [&_svg]:w-5! max-md:size-4 max-md:[&_svg]:h-4! max-md:[&_svg]:w-4!"

// ─── Static icon maps (module-level, không re-create mỗi render) ─────────────
const FILTER_ICON: Record<FeedMenu, string> = {
  [FeedMenu.Featured]: svgSrc(icTopTrending),
  [FeedMenu.Latest]: svgSrc(icGuide),
  [FeedMenu.Trending]: svgSrc(icOutstanding),
}
const LINK_ICON: Record<string, string> = {
  news: svgSrc(icNews),
  promotion: svgSrc(icDiscount),
}

const VideoFeedPlayer = dynamic(
  () => import("@/components/ui/video-feed-player").then((m) => m.VideoFeedPlayer),
  { ssr: false }
)
const CommentDrawer = dynamic(() => import("./comment-drawer").then((m) => m.CommentDrawer), {
  ssr: false,
})

function resolveNewsId(item: HighlightVideoInterface | null): string {
  if (!item) return ""
  return String(item.newsId ?? "")
}

function resolveIsFollowed(item: HighlightVideoInterface): boolean {
  return resolveIsLiked(item.hasFollow)
}

/** Một slide trong stack — cùng cấu trúc DOM để React giữ instance player khi đổi prev/current/next. */
function FeedStackSlide({
  item,
  width,
  height,
  isActive,
  playerRef,
  isMuted = true,
  videoReady = false,
  isPaused = false,
  isEnded = false,
  showPauseHint = false,
  showHeartBurst = false,
  playbackProgress = 0,
  newsId = "",
  routes,
  t,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onToggleMute,
  onResume,
  onProgressMouseDown,
}: {
  item: HighlightVideoInterface
  width: number
  height: number
  isActive: boolean
  playerRef?: React.RefObject<VideoFeedPlayerHandle | null>
  isMuted?: boolean
  videoReady?: boolean
  isPaused?: boolean
  isEnded?: boolean
  showPauseHint?: boolean
  showHeartBurst?: boolean
  playbackProgress?: number
  newsId?: string
  routes?: ReturnType<typeof getRoutes>
  t?: ReturnType<typeof useTranslation>["t"]
  onReady?: () => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (cur: number, dur: number) => void
  onToggleMute?: () => void
  onResume?: () => void
  onProgressMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void
}) {
  const cover = item.coverUrl ?? ""
  const showCover = !isActive || !videoReady

  return (
    <div className="relative shrink-0 overflow-hidden rounded bg-black" style={{ width, height }}>
      {item.videoUrl ? (
        <VideoFeedPlayer
          ref={isActive ? playerRef : undefined}
          url={item.videoUrl}
          poster={cover}
          muted={isActive ? isMuted : true}
          volume={isActive ? 0.8 : 0}
          autoplay={false}
          active={isActive}
          onReady={isActive ? onReady : undefined}
          onPlay={isActive ? onPlay : undefined}
          onPause={isActive ? onPause : undefined}
          onEnded={isActive ? onEnded : undefined}
          onTimeUpdate={isActive ? onTimeUpdate : undefined}
          className="absolute inset-0 z-1"
        />
      ) : null}

      {showCover && cover ? (
        <Img
          src={cover}
          alt={item.title ?? ""}
          fill
          objectFit="contain"
          unoptimized
          sizes="100vw"
          wrapperClassName="absolute inset-0 z-2"
        />
      ) : null}

      {isActive ? (
        <>
          <div
            aria-hidden="true"
            data-feed-tap-zone
            className={cn("absolute inset-0 z-14 cursor-pointer", isEnded && "pointer-events-none")}
          />

          {item.videoUrl && onToggleMute && t ? (
            <Button
              type="button"
              data-feed-nav-block
              className="absolute top-4 left-4 z-20 h-12 w-12 rounded-full border-0 bg-black/35 p-0 text-white hover:bg-black/50"
              onClick={onToggleMute}
              aria-label={isMuted ? t("video.actions.unmute") : t("video.actions.mute")}
            >
              {isMuted ? (
                <VolumeX className="size-[22px] text-white" strokeWidth={2} />
              ) : (
                <Volume2 className="size-[22px] text-white" strokeWidth={2} />
              )}
            </Button>
          ) : null}

          {showPauseHint ? (
            <div className="pointer-events-none absolute inset-0 z-18 flex animate-[feedPauseHint_0.5s_ease_forwards] items-center justify-center">
              <div className="flex h-18 w-18 items-center justify-center rounded-full border-2 border-white/85 bg-black/28 backdrop-blur-[10px]">
                <Pause className="size-11 text-white" strokeWidth={2} />
              </div>
            </div>
          ) : null}

          {((isPaused && !isEnded && videoReady) || isEnded) && onResume && t ? (
            <div className="pointer-events-none absolute inset-0 z-18 flex items-center justify-center">
              <Button
                type="button"
                data-feed-nav-block
                className="pointer-events-auto h-18 w-18 rounded-full border-0 bg-transparent p-0 hover:bg-transparent"
                onClick={onResume}
                aria-label={isEnded ? t("video.actions.replay") : t("video.actions.play")}
              >
                <span className="flex h-18 w-18 items-center justify-center rounded-full border-2 border-white/92 bg-black/28 backdrop-blur-[10px] transition-transform hover:scale-105">
                  {isEnded ? (
                    <RotateCcw className="size-9 text-white" strokeWidth={2} />
                  ) : (
                    <Play className="size-11 fill-white text-white" strokeWidth={2} />
                  )}
                </span>
              </Button>
            </div>
          ) : null}

          {showHeartBurst ? (
            <div className="pointer-events-none absolute inset-0 z-18 flex animate-[heartPop_0.7s_ease_forwards] items-center justify-center text-[#fe2c55]">
              <Heart className="size-24 fill-[#fe2c55] text-[#fe2c55]" strokeWidth={1.8} />
            </div>
          ) : null}

          {item.videoUrl && onProgressMouseDown ? (
            <div className="absolute right-0 bottom-5 left-0 z-22 px-2" data-feed-nav-block>
              {item.durationMillis ? (
                <Typography
                  as="p"
                  variant="caption"
                  className="mb-1.5 px-1 text-right font-semibold text-white/95"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,.7)" }}
                >
                  {formatDuration(Number(item.durationMillis))}
                </Typography>
              ) : null}
              <div className="feed-progress cursor-pointer" onMouseDown={onProgressMouseDown}>
                <div className="feed-progress__track relative h-[3px] w-full rounded-full bg-white/25 transition-[height] hover:h-1">
                  <span
                    className="absolute top-0 left-0 block h-full rounded-full bg-white"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-12 bg-linear-to-t from-black/72 via-black/40 to-transparent px-5 pt-16 pb-14">
        {item.authorId && routes && isActive ? (
          <Link
            href={routes.userInfo(item.authorId)}
            data-feed-nav-block
            className="pointer-events-auto mb-2 inline-block"
          >
            <Typography as="span" variant="h2" className="text-white drop-shadow">
              @{item.userName || "KIMTV"}
            </Typography>
          </Link>
        ) : (
          <Typography as="span" variant="h2" className="mb-2 inline-block text-white drop-shadow">
            @{item.userName || "KIMTV"}
          </Typography>
        )}
        {routes && isActive && newsId ? (
          <Link
            href={routes.video.article(String(newsId))}
            data-feed-nav-block
            className="pointer-events-auto block w-full text-left"
          >
            <Typography
              as="p"
              variant="h6"
              className="line-clamp-3 leading-snug text-white/95 drop-shadow"
            >
              {item.title}
            </Typography>
          </Link>
        ) : (
          <Typography
            as="p"
            variant="h6"
            className="line-clamp-2 leading-snug text-white/95 drop-shadow"
          >
            {item.title}
          </Typography>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface HighlightsFeedProps {
  initialVideos: HighlightVideoInterface[]
  initialMenu?: FeedMenu
  initialHasMore?: boolean
}

export function HighlightsFeed({
  initialVideos,
  initialMenu = FeedMenu.Featured,
  initialHasMore = false,
}: HighlightsFeedProps) {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoggedIn, login } = useAuth()
  const routes = getRoutes(locale)

  // Nếu có ?vid=ID, đưa video đó lên đầu feed
  const featuredVid = searchParams.get("vid")
  const orderedInitialVideos = React.useMemo(() => {
    if (!featuredVid) return initialVideos
    const idx = initialVideos.findIndex((v) => String(v.newsId) === featuredVid)
    if (idx <= 0) return initialVideos
    const copy = [...initialVideos]
    const [featured] = copy.splice(idx, 1)
    return [featured, ...copy]
  }, [initialVideos, featuredVid])

  // ── Data state ──────────────────────────────────────────────────────────────
  const [videos, setVideos] = useState<HighlightVideoInterface[]>(orderedInitialVideos)
  const [activeMenu, setActiveMenu] = useState<FeedMenu>(initialMenu)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(1)

  // ── Navigation state ────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0)
  const pendingAdvance = useRef(false)

  // ── Playback state ──────────────────────────────────────────────────────────
  const [isMuted, setIsMuted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isEnded, setIsEnded] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [showPauseHint, setShowPauseHint] = useState(false)
  const pauseHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Social state ────────────────────────────────────────────────────────────
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})
  const [followMap, setFollowMap] = useState<Record<string, boolean>>({})
  const [likeLoading, setLikeLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [showHeartBurst, setShowHeartBurst] = useState(false)

  // ── UI state ─────────────────────────────────────────────────────────────────
  const { state: drawerState, open: openDrawer, close: closeDrawer } = useDisclosure("comment")

  // ── Player refs ─────────────────────────────────────────────────────────────
  const playerRef = useRef<VideoFeedPlayerHandle | null>(null)

  // ── Progress drag ────────────────────────────────────────────────────────────
  const isDragging = useRef(false)

  // ── Player container (wheel cần native listener passive: false) ─────────────
  const playerContainerRef = useRef<HTMLDivElement>(null)

  // ── Wheel / swipe debounce ───────────────────────────────────────────────────
  const navLocked = useRef(false)
  const suppressTapAfterDrag = useRef(false)
  const userWantsPausedRef = useRef(false)
  const onPlayerTapRef = useRef<() => void>(() => {})
  const pendingSnapDirection = useRef<0 | 1 | -1>(0)
  const isStackAnimatingRef = useRef(false)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const [isStackAnimating, setIsStackAnimating] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const menuDragRef = useRef({
    active: false,
    startClientY: 0,
    startClientX: 0,
    startTop: 0,
    startLeft: 0,
  })
  const gestureRef = useRef<{
    shouldIgnoreNavGesture: (target: EventTarget | null) => boolean
    handleNavByDelta: (deltaY: number, target: EventTarget | null) => void
    setDragOffsetY: (y: number) => void
    snapFeed: (deltaY: number, offsetY: number) => void
    clampDragOffset: (offsetY: number) => number
    isStackAnimating: () => boolean
  }>({
    shouldIgnoreNavGesture: () => false,
    handleNavByDelta: () => {},
    setDragOffsetY: () => {},
    snapFeed: () => {},
    clampDragOffset: (y) => y,
    isStackAnimating: () => false,
  })

  // ── Last tap for double-tap like ─────────────────────────────────────────────
  const lastTapTime = useRef(0)

  // ── Stage sizing ─────────────────────────────────────────────────────────────
  const [stageHeight, setStageHeight] = useState(720)
  const [playerWidth, setPlayerWidth] = useState(360)
  const [layoutReady, setLayoutReady] = useState(false)

  const updateLayout = useCallback(() => {
    if (typeof window === "undefined") return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const headerH = document.getElementById("site-header")?.offsetHeight ?? 78
    const isMobile = vw < 1024
    const bottomNavH = isMobile ? 72 : 0 // 64px bar + 8px buffer
    const sideMenuW = isMobile ? 0 : 96
    const railW = isMobile ? 0 : 60
    const gap = 12

    const stageH = Math.max(vh - headerH - bottomNavH - (isMobile ? 0 : 34), 360)
    let pw: number
    if (isMobile) {
      pw = vw
    } else {
      const maxPlayerW = Math.max(vw - sideMenuW - railW - gap * 2 - 48, 260)
      pw = Math.round((stageH * 9) / 16)
      if (pw > maxPlayerW) pw = maxPlayerW
    }

    setStageHeight(Math.round(stageH))
    setPlayerWidth(Math.round(pw))
    setLayoutReady(true)
  }, [])

  // useLayoutEffect chạy đồng bộ trước khi browser paint → không bao giờ hiện state sai kích thước
  useLayoutEffect(() => {
    updateLayout() // eslint-disable-line react-hooks/set-state-in-effect
  }, [updateLayout])

  // Resize listener không cần synchronous
  useEffect(() => {
    window.addEventListener("resize", updateLayout)
    return () => window.removeEventListener("resize", updateLayout)
  }, [updateLayout])

  // ── Derived ──────────────────────────────────────────────────────────────────
  const currentItem = videos[currentIndex] ?? null
  const newsId = resolveNewsId(currentItem)

  const isLiked = (() => {
    if (!currentItem) return false
    if (likedMap[newsId] !== undefined) return likedMap[newsId]
    return resolveIsLiked(currentItem.isLike)
  })()

  const isFollowed = (() => {
    if (!currentItem?.authorId) return false
    const aid = String(currentItem.authorId)
    if (followMap[aid] !== undefined) return followMap[aid]
    return resolveIsFollowed(currentItem)
  })()

  const displayLikeCount = Number(currentItem?.likeCount) || 0
  const canGoNext = currentIndex < videos.length - 1 || hasMore
  const prevItem = currentIndex > 0 ? (videos[currentIndex - 1] ?? null) : null
  const nextItem = currentIndex < videos.length - 1 ? (videos[currentIndex + 1] ?? null) : null
  const stackBaseTranslate = prevItem ? -stageHeight : 0
  const showNextSlide = Boolean(nextItem) || canGoNext
  const loginUserId =
    user?.userId != null ? String(user.userId) : user?.uid != null ? String(user.uid) : ""
  const showFollowBtn =
    !!currentItem?.authorId &&
    !(isLoggedIn && loginUserId && loginUserId === String(currentItem.authorId))

  // ── Fetch videos ─────────────────────────────────────────────────────────────
  const fetchVideos = useCallback(
    async (menu: FeedMenu, pageNum = 1, append = false) => {
      if (append) setLoadingMore(true)
      else setLoading(true)
      try {
        const { videos: newVideos, hasMore: more } = await fetchVideoFeed({
          status: menu,
          page: pageNum,
          loginUserId,
        })
        if (append) {
          setVideos((prev) => [...prev, ...newVideos])
        } else {
          setVideos(newVideos)
          setCurrentIndex(0)
        }
        setHasMore(more)
        setPage(pageNum)
      } catch {
        if (!append) setVideos([])
      } finally {
        if (append) {
          setLoadingMore(false)
          if (pendingAdvance.current) {
            pendingAdvance.current = false
            setDragOffsetY(0)
          }
        } else {
          setLoading(false)
        }
      }
    },
    [loginUserId]
  )

  // ── Menu change ───────────────────────────────────────────────────────────────
  const onMenuChange = useCallback(
    async (menu: FeedMenu) => {
      if (menu === activeMenu || loading) return
      setActiveMenu(menu)
      router.replace(`?highlight-status=${menu}`, { scroll: false })
      await fetchVideos(menu, 1, false)
    },
    [activeMenu, loading, fetchVideos, router]
  )

  // ── Load more ────────────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (activeMenu !== FeedMenu.Latest || loadingMore || !hasMore) return
    fetchVideos(activeMenu, page + 1, true)
  }, [activeMenu, loadingMore, hasMore, page, fetchVideos])

  // ── Sync liked map on video change ───────────────────────────────────────────
  useEffect(() => {
    videos.forEach((v) => {
      const id = resolveNewsId(v)
      if (!id || likedMap[id] !== undefined) return
      if (resolveIsLiked(v.isLike)) setLikedMap((prev) => ({ ...prev, [id]: true }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos])

  // ── Advance after more loaded ─────────────────────────────────────────────────
  useEffect(() => {
    if (pendingAdvance.current && videos.length > 0) {
      pendingAdvance.current = false
      setCurrentIndex((i) => Math.min(i + 1, videos.length - 1))
      setDragOffsetY(0)
    }
  }, [videos.length])

  // ── Reset playback on video/menu change ──────────────────────────────────────
  useLayoutEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reset UI when active video changes */
    userWantsPausedRef.current = false
    setIsPaused(false)
    setIsEnded(false)
    setShowPauseHint(false)
    setPlaybackProgress(0)
    closeDrawer("comment")
    if (pauseHintTimer.current) clearTimeout(pauseHintTimer.current)

    const p = playerRef.current
    if (p) {
      const dur = p.getDuration()
      if (Number.isFinite(dur) && dur > 0) {
        setVideoReady(true)
        p.setMuted(isMuted)
        setIsPaused(false)
        void p.play()
        return
      }
    }
    setVideoReady(false)
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newsId, activeMenu])

  // ── Keyboard nav ─────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable)
        return
      if ((e.target as HTMLElement)?.closest?.(".comment-compose-input")) return

      if (e.key === "Escape" && drawerState.comment) {
        e.preventDefault()
        closeDrawer("comment")
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        goNext()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        goPrev()
      } else if (e.key === " ") {
        e.preventDefault()
        togglePlayPause()
      }
    }
    window.addEventListener("keydown", onKeydown)
    return () => window.removeEventListener("keydown", onKeydown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, videos.length, hasMore, drawerState.comment, isPaused, isEnded])

  // ── Load more near end ────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeMenu === FeedMenu.Latest && hasMore && currentIndex >= videos.length - 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadMore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  // ── Navigation ───────────────────────────────────────────────────────────────
  function goPrev() {
    if (currentIndex <= 0) return
    setCurrentIndex((i) => i - 1)
  }

  function goNext() {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((i) => i + 1)
      return
    }
    if (activeMenu !== FeedMenu.Latest || !hasMore) return
    pendingAdvance.current = true
    if (!loadingMore) loadMore()
  }

  function shouldIgnoreNavGesture(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false
    if (isDragging.current || drawerState.comment) return true
    if (target.closest("[data-feed-nav-block]") || target.closest(".comment-compose-input"))
      return true
    return false
  }

  function lockNav() {
    navLocked.current = true
    setTimeout(() => {
      navLocked.current = false
    }, 450)
  }

  function handleNavByDelta(deltaY: number, target: EventTarget | null) {
    if (navLocked.current || shouldIgnoreNavGesture(target)) return
    lockNav()
    if (deltaY > 0) goNext()
    else if (deltaY < 0) goPrev()
  }

  function clampDragOffset(offsetY: number) {
    const hasPrev = currentIndex > 0
    const hasNext = canGoNext
    const rubber = stageHeight * 0.12
    const maxUp = hasNext ? -stageHeight : -rubber
    const maxDown = hasPrev ? stageHeight : rubber
    return Math.max(maxUp, Math.min(maxDown, offsetY))
  }

  function applySnapCommit(dir: 0 | 1 | -1) {
    pendingSnapDirection.current = 0
    isStackAnimatingRef.current = false
    setIsStackAnimating(false)

    if (dir === 1) {
      setDragOffsetY(0)
      if (currentIndex < videos.length - 1) {
        setCurrentIndex((i) => i + 1)
      } else if (activeMenu === FeedMenu.Latest && hasMore) {
        pendingAdvance.current = true
        setDragOffsetY(-stageHeight)
        if (!loadingMore) loadMore()
      }
      return
    }

    if (dir === -1) {
      setDragOffsetY(0)
      goPrev()
      return
    }

    setDragOffsetY(0)
  }

  function snapFeed(deltaY: number, offsetY: number) {
    if (isStackAnimatingRef.current) return
    const threshold = Math.min(stageHeight * 0.2, 64)

    // deltaY = startY - endY → kéo lên (next) = dương; kéo xuống (prev) = âm
    const wantsNext = (deltaY > threshold || offsetY <= -threshold) && canGoNext
    const wantsPrev = (deltaY < -threshold || offsetY >= threshold) && currentIndex > 0

    if (wantsNext) {
      const target = -stageHeight
      if (Math.abs(offsetY - target) < 12) {
        applySnapCommit(1)
        return
      }
      pendingSnapDirection.current = 1
      isStackAnimatingRef.current = true
      setIsStackAnimating(true)
      setDragOffsetY(target)
      return
    }

    if (wantsPrev) {
      const target = stageHeight
      if (Math.abs(offsetY - target) < 12) {
        applySnapCommit(-1)
        return
      }
      pendingSnapDirection.current = -1
      isStackAnimatingRef.current = true
      setIsStackAnimating(true)
      setDragOffsetY(target)
      return
    }

    pendingSnapDirection.current = 0
    if (Math.abs(offsetY) < 1) {
      setDragOffsetY(0)
      return
    }
    isStackAnimatingRef.current = true
    setIsStackAnimating(true)
    setDragOffsetY(0)
  }

  function handleStackTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return
    if (!isStackAnimatingRef.current) return
    applySnapCommit(pendingSnapDirection.current)
  }

  isStackAnimatingRef.current = isStackAnimating

  gestureRef.current = {
    shouldIgnoreNavGesture,
    handleNavByDelta,
    setDragOffsetY,
    snapFeed,
    clampDragOffset,
    isStackAnimating: () => isStackAnimatingRef.current,
  }

  // Native wheel + pointer drag (mouse + touch)
  useEffect(() => {
    const el = playerContainerRef.current
    if (!el) return

    const dragState = {
      active: false,
      pointerId: -1,
      startY: 0,
      startX: 0,
      currentY: 0,
      axis: null as "x" | "y" | null,
      moved: false,
      startTarget: null as EventTarget | null,
    }

    const resetDragState = () => {
      dragState.active = false
      dragState.pointerId = -1
      dragState.axis = null
      dragState.moved = false
      dragState.startTarget = null
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return
      if (gestureRef.current.isStackAnimating()) return
      if (gestureRef.current.shouldIgnoreNavGesture(e.target)) return

      dragState.active = true
      dragState.pointerId = e.pointerId
      dragState.startY = e.clientY
      dragState.startX = e.clientX
      dragState.currentY = e.clientY
      dragState.axis = null
      dragState.moved = false
      dragState.startTarget = e.target
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragState.active || e.pointerId !== dragState.pointerId) return

      const dy = e.clientY - dragState.startY
      const dx = e.clientX - dragState.startX

      if (!dragState.axis) {
        if (Math.abs(dy) < 8 && Math.abs(dx) < 8) return
        dragState.axis = Math.abs(dy) >= Math.abs(dx) ? "y" : "x"
        if (dragState.axis === "y") {
          el.setPointerCapture(e.pointerId)
          gestureRef.current.setDragOffsetY(gestureRef.current.clampDragOffset(dy))
        }
      }
      if (dragState.axis !== "y") return

      e.preventDefault()
      dragState.currentY = e.clientY
      dragState.moved = true
      gestureRef.current.setDragOffsetY(gestureRef.current.clampDragOffset(dy))
    }

    const finishDrag = (e: PointerEvent) => {
      if (!dragState.active || e.pointerId !== dragState.pointerId) return

      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId)
      }

      const endY = e.clientY
      const deltaY = dragState.startY - endY
      const offsetY = gestureRef.current.clampDragOffset(endY - dragState.startY)
      const moved = dragState.moved
      const axis = dragState.axis
      const startTarget = dragState.startTarget
      resetDragState()

      if (moved) {
        suppressTapAfterDrag.current = true
        setTimeout(() => {
          suppressTapAfterDrag.current = false
        }, 400)
      } else if (
        !suppressTapAfterDrag.current &&
        startTarget instanceof HTMLElement &&
        !gestureRef.current.shouldIgnoreNavGesture(startTarget) &&
        startTarget.closest("[data-feed-tap-zone]")
      ) {
        onPlayerTapRef.current()
      }

      if (axis === "y") {
        gestureRef.current.snapFeed(deltaY, offsetY)
      } else {
        gestureRef.current.setDragOffsetY(0)
      }
    }

    const onPointerUp = (e: PointerEvent) => finishDrag(e)
    const onPointerCancel = (e: PointerEvent) => finishDrag(e)

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault()
      gestureRef.current.handleNavByDelta(e.deltaY, e.target)
    }

    el.addEventListener("pointerdown", onPointerDown)
    el.addEventListener("pointermove", onPointerMove)
    el.addEventListener("pointerup", onPointerUp)
    el.addEventListener("pointercancel", onPointerCancel)
    el.addEventListener("wheel", onNativeWheel, { passive: false })

    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerup", onPointerUp)
      el.removeEventListener("pointercancel", onPointerCancel)
      el.removeEventListener("wheel", onNativeWheel)
    }
  }, [layoutReady, videos.length, drawerState.comment, currentIndex, canGoNext, stageHeight])

  // ── Playback controls ─────────────────────────────────────────────────────────
  function pauseVideo() {
    userWantsPausedRef.current = true
    const p = playerRef.current
    p?.pause()
    setIsPaused(true)
    setShowPauseHint(true)
    if (pauseHintTimer.current) clearTimeout(pauseHintTimer.current)
    pauseHintTimer.current = setTimeout(() => setShowPauseHint(false), 500)
  }

  function resumeVideo() {
    const p = playerRef.current
    if (!p) return
    userWantsPausedRef.current = false
    const dur = p.getDuration()
    const cur = p.getCurrentTime()
    if (dur > 0 && cur >= dur - 0.1) p.seek(0)
    p.setMuted(isMuted)
    setIsPaused(false)
    setIsEnded(false)
    setShowPauseHint(false)
    void p.play()
  }

  function togglePlayPause() {
    if (isEnded) {
      resumeVideo()
      return
    }
    if (isPaused) resumeVideo()
    else pauseVideo()
  }

  function toggleMute() {
    const next = !isMuted
    setIsMuted(next)
    playerRef.current?.setMuted(next)
  }

  // ── Tap handler (single = play/pause, double = like) ──────────────────────────
  function onPlayerTap() {
    if (suppressTapAfterDrag.current) return
    const now = Date.now()
    if (now - lastTapTime.current < 280) {
      triggerLike(true)
      lastTapTime.current = 0
      return
    }
    lastTapTime.current = now
    setTimeout(() => {
      if (Date.now() - lastTapTime.current >= 280) {
        togglePlayPause()
      }
    }, 300)
  }

  onPlayerTapRef.current = onPlayerTap

  // ── Progress bar ──────────────────────────────────────────────────────────────
  function seekToX(clientX: number, trackEl: HTMLElement) {
    const p = playerRef.current
    if (!p) return
    const rect = trackEl.getBoundingClientRect()
    if (!rect.width) return
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    const dur = p.getDuration()
    if (!Number.isFinite(dur) || dur <= 0) return
    p.seek(ratio * dur)
    setPlaybackProgress(Math.round(ratio * 100))
  }

  function onProgressMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const trackEl = e.currentTarget.querySelector<HTMLElement>(".feed-progress__track")
    if (!trackEl) return
    seekToX(e.clientX, trackEl)
    isDragging.current = true

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return
      seekToX(ev.clientX, trackEl)
    }
    const onUp = () => {
      isDragging.current = false
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  // ── Like ──────────────────────────────────────────────────────────────────────
  function triggerLike(fromDoubleTap = false) {
    if (fromDoubleTap && !isLiked) {
      setShowHeartBurst(true)
      setTimeout(() => setShowHeartBurst(false), 700)
    }
    if (!isLiked) toggleLike(true)
  }

  async function toggleLike(fromDoubleTap = false) {
    if (!currentItem || likeLoading) return
    if (!isLoggedIn) {
      login()
      return
    }

    const wasLiked = isLiked
    if (fromDoubleTap && wasLiked) return

    await toggleLikeAction({
      newsId,
      isLike: fromDoubleTap ? true : !wasLiked,
      wasLiked,
      loginUserId,
      originalCount: displayLikeCount,
      setLikedMap,
      setVideos,
      setLikeLoading,
    })
  }

  async function handleFollow() {
    if (!isLoggedIn) {
      login()
    } else {
      await toggleFollowAction({
        userId: String(currentItem?.authorId),
        setFollowMap,
        setVideos,
        setFollowLoading,
        messageSuccess: t("video.follow.success"),
      })
    }
  }

  function handleShareVideo() {
    if (!currentItem) return
    const url = `${window.location.origin}${routes.video.article(String(newsId))}`
    try {
      navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
  }

  // ── Menu items — built from static config + runtime t() / routes ────────────
  const filterMenuItems = FILTER_MENU_CONFIG.map((c) => ({
    ...c,
    label: t(c.labelKey),
    iconSrc: FILTER_ICON[c.key],
  }))

  const linkUrlMap: Record<string, string> = {
    news: routes.news.index,
    promotion: siteConfig.links.promotion,
  }
  const linkMenuItems = LINK_MENU_CONFIG.map((c) => ({
    ...c,
    label: t(c.labelKey),
    iconSrc: LINK_ICON[c.key],
    url: linkUrlMap[c.key],
  }))

  return (
    <div
      className="flex w-full gap-3 max-md:gap-0"
      style={{ height: stageHeight, minHeight: stageHeight }}
    >
      {/* ── Side menu (desktop) / Bottom nav (mobile) ───────────────────── */}
      <aside
        className="feed-menu sticky top-0 w-24 shrink-0 self-start pt-6 max-md:fixed max-md:top-1/2 max-md:left-0 max-md:z-40 max-md:w-16 max-md:-translate-y-1/2 max-md:touch-none max-md:pt-0 max-md:select-none"
        style={
          menuPos !== null
            ? { top: menuPos.top, left: menuPos.left, transform: "translateY(-50%)" }
            : undefined
        }
        onPointerDown={(e) => {
          if (window.innerWidth >= 768) return
          const rect = e.currentTarget.getBoundingClientRect()
          menuDragRef.current = {
            active: true,
            startClientY: e.clientY,
            startClientX: e.clientX,
            startTop: rect.top + rect.height / 2,
            startLeft: rect.left,
          }
          e.currentTarget.setPointerCapture(e.pointerId)
          e.stopPropagation()
        }}
        onPointerMove={(e) => {
          if (!menuDragRef.current.active) return
          const { startClientY, startClientX, startTop, startLeft } = menuDragRef.current
          const menuW = 64 // max-md:w-16
          const newTop = Math.max(
            60,
            Math.min(window.innerHeight - 60, startTop + (e.clientY - startClientY))
          )
          const newLeft = Math.max(
            0,
            Math.min(window.innerWidth - menuW, startLeft + (e.clientX - startClientX))
          )
          setMenuPos({ top: newTop, left: newLeft })
          e.stopPropagation()
        }}
        onPointerUp={(e) => {
          menuDragRef.current.active = false
          e.stopPropagation()
        }}
      >
        <nav className="overflow-hidden rounded-2xl bg-[#101622] shadow-[0_16px_56px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
          {/* Drag handle — mobile only */}
          <div className="hidden cursor-grab items-center justify-center py-2 active:cursor-grabbing max-md:flex">
            <div className="h-[3px] w-7 rounded-full bg-white/15" />
          </div>

          {/* Filter group */}
          <div className="flex flex-col gap-px py-2 max-md:py-1">
            {filterMenuItems.map(({ key, label, iconSrc }) => {
              const isActive = activeMenu === key
              return (
                <button
                  key={key}
                  type="button"
                  disabled={loading}
                  onClick={() => onMenuChange(key)}
                  className={cn(
                    "flex w-full flex-col items-center justify-center gap-1.5 px-2 py-3.5 transition-all duration-150 active:scale-95",
                    "max-md:py-2.5",
                    isActive ? "text-[#ffd220]" : "text-white/50 hover:text-white/80"
                  )}
                >
                  <ReactSVG src={iconSrc} className={menuIconClass} />
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        "line-clamp-1 text-center text-[11px] leading-none text-inherit max-md:text-[9px]",
                        isActive ? "font-700" : "font-500"
                      )}
                    >
                      {label}
                    </span>
                    {isActive && <span className="h-[2px] w-4 rounded-full bg-[#ffd220]" />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="mx-3 h-px bg-white/[0.06]" />

          {/* Link group */}
          <div className="flex flex-col gap-px py-2 max-md:py-1">
            {linkMenuItems.map(({ key, label, iconSrc, url, external }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (external || /^https?:\/\//i.test(url)) {
                    window.open(url, "_blank", "noopener,noreferrer")
                  } else {
                    window.location.href = url
                  }
                }}
                className="flex w-full flex-col items-center justify-center gap-1.5 px-2 py-3.5 text-white/50 transition-all duration-150 hover:text-white/80 active:scale-95 max-md:py-2.5"
              >
                <ReactSVG src={iconSrc} className={menuIconClass} />
                <span className="font-500 line-clamp-1 text-center text-[11px] leading-none text-inherit max-md:text-[9px]">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </aside>

      <main className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-black">
        {loading || !layoutReady ? (
          <FeedSkeleton playerWidth={playerWidth} stageHeight={stageHeight} />
        ) : videos.length === 0 ? (
          <Empty tip={t("video.empty")} className="[&_p]:text-white/50" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ height: stageHeight }}
          >
            {/* center: player + rail */}
            <div className="flex h-full items-stretch gap-3 max-md:relative">
              {/* Player */}
              <div
                ref={playerContainerRef}
                className={cn(
                  "relative touch-none overflow-hidden rounded bg-black select-none",
                  dragOffsetY !== 0 && !isStackAnimating ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{ width: playerWidth, height: stageHeight }}
              >
                <div
                  className="feed-stack flex flex-col"
                  onTransitionEnd={handleStackTransitionEnd}
                  style={{
                    transform: `translateY(${stackBaseTranslate + dragOffsetY}px)`,
                    transition: isStackAnimating
                      ? "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                      : undefined,
                  }}
                >
                  {prevItem ? (
                    <FeedStackSlide
                      key={resolveNewsId(prevItem)}
                      item={prevItem}
                      width={playerWidth}
                      height={stageHeight}
                      isActive={false}
                    />
                  ) : null}

                  {currentItem ? (
                    <FeedStackSlide
                      key={newsId}
                      item={currentItem}
                      width={playerWidth}
                      height={stageHeight}
                      isActive
                      playerRef={playerRef}
                      isMuted={isMuted}
                      videoReady={videoReady}
                      isPaused={isPaused}
                      isEnded={isEnded}
                      showPauseHint={showPauseHint}
                      showHeartBurst={showHeartBurst}
                      playbackProgress={playbackProgress}
                      newsId={newsId}
                      routes={routes}
                      t={t}
                      onReady={() => setVideoReady(true)}
                      onPlay={() => {
                        setVideoReady(true)
                        if (!userWantsPausedRef.current) setIsPaused(false)
                        setIsEnded(false)
                      }}
                      onPause={() => {
                        userWantsPausedRef.current = true
                        setIsPaused(true)
                      }}
                      onEnded={() => {
                        userWantsPausedRef.current = true
                        setIsEnded(true)
                        setIsPaused(true)
                        setPlaybackProgress(100)
                      }}
                      onTimeUpdate={(cur, dur) => {
                        if (isDragging.current || !dur) return
                        setPlaybackProgress(Math.round((cur / dur) * 100))
                      }}
                      onToggleMute={toggleMute}
                      onResume={resumeVideo}
                      onProgressMouseDown={onProgressMouseDown}
                    />
                  ) : null}

                  {showNextSlide ? (
                    nextItem ? (
                      <FeedStackSlide
                        key={resolveNewsId(nextItem)}
                        item={nextItem}
                        width={playerWidth}
                        height={stageHeight}
                        isActive={false}
                      />
                    ) : (
                      <div
                        className="relative shrink-0 overflow-hidden rounded bg-black"
                        style={{ width: playerWidth, height: stageHeight }}
                      >
                        <Skeleton className="h-full w-full rounded" />
                      </div>
                    )
                  ) : null}
                </div>
              </div>

              {/* Rail */}
              <aside className="flex flex-col items-center justify-center gap-7 self-stretch py-4 max-md:absolute max-md:top-1/2 max-md:right-1 max-md:z-15 max-md:-translate-y-1/2 max-md:gap-4 max-md:py-0">
                {/* Avatar + Follow */}
                <div className="relative">
                  {currentItem?.authorId ? (
                    <Link href={routes.userInfo(currentItem.authorId)}>
                      <Avatar size={56} className="border-2 border-white max-md:size-10!">
                        <AvatarImage
                          src={currentItem?.userAvatar}
                          alt={currentItem?.userName || ""}
                        />
                      </Avatar>
                    </Link>
                  ) : (
                    <Avatar size={56} className="border-2 border-white max-md:size-10!">
                      <AvatarImage
                        src={currentItem?.userAvatar}
                        alt={currentItem?.userName || ""}
                      />
                    </Avatar>
                  )}
                  {showFollowBtn && !isFollowed && (
                    <Button
                      type="button"
                      disabled={followLoading}
                      onClick={handleFollow}
                      className="absolute -bottom-2.5 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-0 bg-[#fe2c55] p-0 text-center text-xl leading-6 font-bold text-white hover:bg-[#fe2c55]/90 max-md:h-5 max-md:w-5 max-md:text-sm"
                    >
                      +
                    </Button>
                  )}
                </div>

                {/* Like */}
                <Button
                  type="button"
                  disabled={likeLoading}
                  onClick={() => toggleLike(false)}
                  className="h-auto w-auto flex-col items-center gap-2 border-0 bg-transparent p-0 text-white hover:bg-transparent disabled:opacity-60 max-md:gap-1"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(84,84,84,0.72)] max-md:h-11 max-md:w-11">
                    {isLiked ? (
                      <Heart className="size-8 fill-[#fe2c55] text-[#fe2c55]" strokeWidth={1.8} />
                    ) : (
                      <Heart className="size-8 text-white" strokeWidth={1.8} />
                    )}
                  </span>
                  <Typography
                    as="span"
                    variant="label"
                    className={cn("font-semibold max-md:text-[11px]", isLiked && "text-[#fe2c55]")}
                  >
                    {formatCount(displayLikeCount)}
                  </Typography>
                </Button>

                {/* Comment */}
                <Button
                  type="button"
                  onClick={() => openDrawer("comment")}
                  className="h-auto w-auto flex-col items-center gap-2 border-0 bg-transparent p-0 text-white hover:bg-transparent max-md:gap-1"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(84,84,84,0.72)] max-md:h-11 max-md:w-11">
                    <MessageCircle className="size-8 text-white" strokeWidth={1.8} />
                  </span>
                  <Typography
                    as="span"
                    variant="label"
                    className="font-semibold max-md:text-[11px]"
                  >
                    {formatCount(Number(currentItem?.commentCount) || 0)}
                  </Typography>
                </Button>

                {/* Share */}
                <Button
                  type="button"
                  onClick={handleShareVideo}
                  className="h-auto w-auto flex-col items-center gap-2 border-0 bg-transparent p-0 text-white hover:bg-transparent max-md:gap-1"
                  aria-label={t("video.actions.share")}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(84,84,84,0.72)] max-md:h-11 max-md:w-11">
                    <ReactSVG
                      src={svgSrc(icShare)}
                      className="size-8 text-white [&_svg]:h-8! [&_svg]:w-8! [&>div]:flex [&>div]:size-full [&>div]:items-center [&>div]:justify-center"
                    />
                  </span>
                </Button>
              </aside>
            </div>

            {/* Nav buttons */}
            <div className="absolute top-1/2 right-0 flex -translate-y-1/2 flex-col gap-3 pr-1 max-md:hidden">
              <Button
                type="button"
                disabled={currentIndex <= 0}
                onClick={goPrev}
                className="h-12 w-12 rounded-full border-0 bg-white/12 text-white hover:bg-white/22 disabled:opacity-35"
                aria-label="Previous"
              >
                <ChevronUp className="size-5" strokeWidth={2} />
              </Button>
              <Button
                type="button"
                disabled={!canGoNext}
                onClick={goNext}
                className="h-12 w-12 rounded-full border-0 bg-white/12 text-white hover:bg-white/22 disabled:opacity-35"
                aria-label="Next"
              >
                <ChevronDown className="size-5" strokeWidth={2} />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Comment drawer */}
      {drawerState.comment && currentItem && (
        <CommentDrawer
          key={newsId}
          newsId={newsId}
          newsType={currentItem.newsType ?? 3}
          commentCount={Number(currentItem.commentCount) || 0}
          status={activeMenu}
          onClose={() => closeDrawer("comment")}
          onCountChange={(count) => {
            setVideos((prev) =>
              prev.map((v) => (resolveNewsId(v) === newsId ? { ...v, commentCount: count } : v))
            )
          }}
        />
      )}
    </div>
  )
}

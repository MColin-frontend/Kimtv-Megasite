"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"

import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/use-router"

import { SKELETON_BG } from "@/constants/common.constants"
import { HERO_VIDEO_PARAMS } from "@/constants/component/home.constants"
import type { AnchorRoomVo, MatchInterface } from "@/models/match.models"

import { Chat, type UserRole } from "@/components/ui/chat"
import { MatchLiveInfoBar } from "@/components/ui/match/card-live-info"
import { Skeleton } from "@/components/ui/skeleton"

import {
  getHeroPlaybackKey,
  hasHeroCommentator,
  HERO_PLAYBACK_TIMEOUT_MS,
  pickHeroFallbackMatch,
  type LiveMatch,
} from "./hero-video.utils"

export function HeroVideoClientSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[min(76vh,880px)] w-full gap-4 max-lg:h-auto max-lg:flex-col",
        className
      )}
    >
      {/* Video + info bar */}
      <div className="card-glow rounded-12 flex min-w-0 flex-1 flex-col overflow-hidden">
        <Skeleton className={cn("w-full flex-1", SKELETON_BG)} style={{ aspectRatio: "16/9" }} />
        {/* Info bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <Skeleton className={cn("size-8 shrink-0 rounded-full", SKELETON_BG)} />
            <Skeleton className={cn("h-3.5 w-24", SKELETON_BG)} />
            <Skeleton className={cn("h-3.5 w-4", SKELETON_BG)} />
            <Skeleton className={cn("size-8 shrink-0 rounded-full", SKELETON_BG)} />
            <Skeleton className={cn("h-3.5 w-24", SKELETON_BG)} />
          </div>
          <Skeleton className={cn("h-7 w-28 rounded-full", SKELETON_BG)} />
        </div>
      </div>

      {/* Chat sidebar */}
      <div className="flex w-[min(30vw,420px)] shrink-0 flex-col overflow-hidden max-lg:w-full max-sm:h-[50vh]">
        <Skeleton className={cn("rounded-12 h-full w-full", SKELETON_BG)} />
      </div>
    </div>
  )
}

const VideoPlayer = dynamic(() => import("@/components/ui/video").then((m) => m.VideoPlayer))

export interface HeroVideoClientProps {
  matches: LiveMatch[]
  defaultMatchId?: string | number
  userRole?: UserRole
  className?: string
}

export function HeroVideoClient({ matches, defaultMatchId, className }: HeroVideoClientProps) {
  const { getParam, setParams } = useRouter()
  const failedKeysRef = useRef(new Set<string>())
  const playedRef = useRef(false)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const preferredMatch =
    matches.find((m) => hasHeroCommentator(m) && m.sources.length > 0) ??
    matches.find((m) => m.sources.length > 0) ??
    matches[0]

  const urlMatchId =
    getParam(HERO_VIDEO_PARAMS.MATCH_ID) ?? (defaultMatchId != null ? String(defaultMatchId) : null)

  const activeMatch =
    matches.find((m) => activeKey != null && getHeroPlaybackKey(m) === activeKey) ??
    matches.find((m) => urlMatchId != null && String(m.id) === urlMatchId) ??
    preferredMatch

  const playbackKey = activeMatch ? getHeroPlaybackKey(activeMatch) : "default"

  function goToMatch(match: LiveMatch) {
    setActiveKey(getHeroPlaybackKey(match))
    setParams(
      {
        [HERO_VIDEO_PARAMS.MATCH_ID]: String(match.id),
        [HERO_VIDEO_PARAMS.GAME_ID]: String(match.gameId),
      },
      { scroll: false, replace: true }
    )
  }

  function handleVideoError() {
    if (!activeMatch) return
    const failedKey = getHeroPlaybackKey(activeMatch)
    failedKeysRef.current.add(failedKey)
    const nextMatch = pickHeroFallbackMatch(matches, failedKey, failedKeysRef.current)
    if (nextMatch) goToMatch(nextMatch)
  }

  useEffect(() => {
    if (!activeMatch || getParam(HERO_VIDEO_PARAMS.MATCH_ID)) return
    setParams(
      {
        [HERO_VIDEO_PARAMS.MATCH_ID]: String(activeMatch.id),
        [HERO_VIDEO_PARAMS.GAME_ID]: String(activeMatch.gameId),
      },
      { scroll: false, replace: true }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackKey])

  useEffect(() => {
    playedRef.current = false
    if (!activeMatch) return

    const delay = activeMatch.sources.length === 0 ? 0 : HERO_PLAYBACK_TIMEOUT_MS
    const timer = window.setTimeout(() => {
      if (activeMatch.sources.length === 0 || !playedRef.current) handleVideoError()
    }, delay)

    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackKey])

  return (
    <div
      className={cn(
        "flex h-[min(76vh,880px)] w-full gap-4 max-lg:h-auto max-lg:flex-col",
        className
      )}
    >
      <div className="card-glow rounded-12 flex min-w-0 flex-1 flex-col overflow-hidden max-lg:h-auto">
        <VideoPlayer
          key={playbackKey}
          sources={activeMatch?.sources ?? []}
          poster={activeMatch?.poster}
          isLive
          autoplay={!!activeMatch}
          onPlay={() => {
            playedRef.current = true
          }}
          onError={handleVideoError}
        />
        {activeMatch && (
          <MatchLiveInfoBar
            match={{
              ...(activeMatch as unknown as MatchInterface),
              matchId: Number(activeMatch.id),
              homeName: activeMatch.homeName ?? "--",
              awayName: activeMatch.awayName ?? "--",
              homeLogo: activeMatch.homeLogo ?? "",
              awayLogo: activeMatch.awayLogo ?? "",
              homeScore: activeMatch.homeScore ?? 0,
              awayScore: activeMatch.awayScore ?? 0,
              gameTime: typeof activeMatch.period === "number" ? activeMatch.period : null,
              anchorRoomVos: (activeMatch.anchors as unknown as AnchorRoomVo[]) ?? null,
            }}
          />
        )}
      </div>

      <div className="flex w-[min(30vw,420px)] shrink-0 flex-col overflow-hidden max-lg:w-full max-sm:h-[50vh]">
        <Chat chatroomId={activeMatch?.id} gameId={activeMatch?.gameId} />
      </div>
    </div>
  )
}

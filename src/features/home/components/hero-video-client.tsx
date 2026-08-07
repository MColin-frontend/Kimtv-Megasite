"use client"

import { useCallback, useEffect } from "react"
import dynamic from "next/dynamic"

import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/use-router"

import { SKELETON_BG } from "@/constants/common.constants"
import { HERO_VIDEO_PARAMS } from "@/constants/component/home.constants"
import type { AnchorRoomVo, MatchInterface } from "@/models/match.models"

import type { UserRole } from "@/components/ui/chat/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Typography } from "@/components/ui/typography"

import type { LiveMatch } from "./hero-video"

const Chat = dynamic(() => import("@/components/ui/chat").then((m) => m.Chat))
const MatchLiveInfoBar = dynamic(() =>
  import("@/components/ui/match/card-live-info").then((m) => m.MatchLiveInfoBar)
)

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

      {/* Chat sidebar skeleton — header text is real markup so LCP is measured from initial HTML */}
      <div className="flex w-[min(30vw,420px)] shrink-0 flex-col overflow-hidden max-lg:w-full max-sm:h-[50vh]">
        <div
          className={cn(
            "card-glow rounded-12 flex h-full flex-col gap-4 overflow-hidden p-4 backdrop-blur-2xl max-sm:gap-2 max-sm:p-2",
            SKELETON_BG
          )}
        >
          <Skeleton className={cn("h-8 w-full shrink-0 rounded-full", SKELETON_BG)} />
          <div className="rounded-6 flex min-h-0 flex-1 flex-col overflow-hidden bg-white/[0.03] backdrop-blur-xl">
            <div className="flex shrink-0 items-center border-b border-white/8 px-3 pt-2.5 pb-1.5 max-sm:px-2 max-sm:py-1.5">
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
            <Skeleton className={cn("flex-1", SKELETON_BG)} />
          </div>
        </div>
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

  const activeIdFromUrl =
    getParam(HERO_VIDEO_PARAMS.MATCH_ID) ?? String(defaultMatchId ?? matches[0]?.id ?? "")
  const activeMatch = matches.find((m) => String(m.id) === activeIdFromUrl) ?? matches[0]

  useEffect(() => {
    if (!activeMatch) return
    const currentId = getParam(HERO_VIDEO_PARAMS.MATCH_ID)
    if (!currentId) {
      setParams(
        {
          [HERO_VIDEO_PARAMS.MATCH_ID]: String(activeMatch.id),
          [HERO_VIDEO_PARAMS.GAME_ID]: String(activeMatch.gameId),
        },
        { scroll: false }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMatch?.id])

  // Khi video lỗi → tự động chuyển sang trận kế tiếp
  const handleVideoError = useCallback(() => {
    if (!activeMatch || matches.length <= 1) return
    const currentIndex = matches.findIndex((m) => String(m.id) === String(activeMatch.id))
    const nextMatch = matches[currentIndex + 1] ?? matches[0]
    if (!nextMatch || String(nextMatch.id) === String(activeMatch.id)) return
    setParams(
      {
        [HERO_VIDEO_PARAMS.MATCH_ID]: String(nextMatch.id),
        [HERO_VIDEO_PARAMS.GAME_ID]: String(nextMatch.gameId),
      },
      { scroll: false }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMatch?.id, matches])

  return (
    <div
      className={cn(
        "flex h-[min(76vh,880px)] w-full gap-4 max-lg:h-auto max-lg:flex-col",
        className
      )}
    >
      <div className="card-glow rounded-12 flex min-w-0 flex-1 flex-col overflow-hidden max-lg:h-auto">
        <VideoPlayer
          key={activeMatch?.id.toString() ?? "default"}
          sources={activeMatch?.sources ?? []}
          poster={activeMatch?.poster}
          isLive
          autoplay={!!activeMatch}
          onError={handleVideoError}
        />
        {activeMatch && (
          <MatchLiveInfoBar
            priority
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

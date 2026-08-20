"use client"

import { useEffect } from "react"

import { LIVE_MATCH_TYPE } from "@/lib/match.utils"
import { buildMatchDetailViewedPayload } from "@/lib/tracking.constants"
import { useRouter } from "@/hooks/use-router"
import { useTracking } from "@/hooks/use-tracking"

import { POLL_PARAM_KEY, POLL_VISIBLE } from "@/constants/ui/ui-chat.constants"
import type { AnchorRoomVo, MatchInterface } from "@/models/match.models"

import { Chat } from "@/components/ui/chat"
import { MatchLiveInfoBar } from "@/components/ui/match/card-live-info"
import { Carousel } from "@/components/ui/match/carousel"

import { LIVE_SECTION_CONFIG } from "../live.constants"
import type { LiveMatchInterface } from "../live.models"
import { LiveBanner } from "./live-banner"
import { LiveVideoPlayer } from "./live-video-player"

export interface LivePageProps {
  match: LiveMatchInterface | null
}

export function LivePage({ match }: LivePageProps) {
  const { getParam } = useRouter()
  const hasPollVisible = getParam(POLL_PARAM_KEY) === POLL_VISIBLE
  const { onClick: track } = useTracking()

  useEffect(() => {
    if (!match?.matchId) return
    track(
      buildMatchDetailViewedPayload(
        match as unknown as import("@/lib/tracking.constants").MatchTrackingData
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.matchId])

  const liveUrls = (() => {
    if (match?.liveUrls?.length) return match.liveUrls
    const firstAnchor = match?.anchorRoom?.[0]
    if (firstAnchor?.liveUrl || firstAnchor?.liveUrlFlv) {
      return [{ liveUrl: firstAnchor.liveUrl, liveUrlFlv: firstAnchor.liveUrlFlv }]
    }
    return []
  })()

  return (
    <div className="container flex flex-col gap-6 max-sm:gap-3">
      <div className="flex h-[min(90vh,900px)] gap-4 max-lg:h-auto max-lg:flex-col">
        <div className="card-glow rounded-12 flex min-w-0 flex-1 flex-col overflow-hidden">
          <LiveVideoPlayer liveUrls={liveUrls} />
          {match && (
            <MatchLiveInfoBar
              match={{
                ...(match as unknown as MatchInterface),
                anchorRoomVos: (match.anchorRoom as unknown as AnchorRoomVo[]) ?? null,
              }}
            />
          )}
        </div>
        <div
          className={`flex w-[420px] shrink-0 flex-col overflow-hidden max-lg:h-auto max-lg:w-full ${hasPollVisible ? "max-sm:h-[60vh]" : "max-sm:h-[50vh]"}`}
        >
          <Chat />
        </div>
      </div>

      <LiveBanner matchId={match?.matchId != null ? String(match.matchId) : undefined} />

      {[LIVE_SECTION_CONFIG.LIVE, LIVE_SECTION_CONFIG.UPCOMING, LIVE_SECTION_CONFIG.FINISHED].map(
        (cfg) => (
          <Carousel
            key={cfg.i18nKey}
            statusType={cfg.statusType}
            endpoint={cfg.endpoint}
            method={cfg.method}
            params={{ ...cfg.params }}
            matchType={cfg.matchType}
            hideFilter={cfg.matchType === LIVE_MATCH_TYPE.LIVE}
          />
        )
      )}
    </div>
  )
}

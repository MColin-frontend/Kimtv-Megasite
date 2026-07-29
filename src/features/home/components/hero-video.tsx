import { fetchLiveScheduleMatches } from "@/features/live-schedule/live-schedule.api"
import { buildStreamSources, fetchAnchorLiveData } from "@/features/live/api/live.api"
import type { VideoSource } from "@/components/ui/video"

import { HeroVideoClient } from "./hero-video-client"

/* ── Types ───────────────────────────────────────────────── */

export interface LiveMatch {
  id: string | number
  chatroomId: string | number
  gameId: number
  leagueName?: string
  leagueLogo?: string
  homeName: string
  homeLogo?: string
  awayName: string
  awayLogo?: string
  homeScore?: number
  awayScore?: number
  period?: string | number
  state?: number | null
  homeCornerKick?: number
  awayCornerKick?: number
  homeYellowCard?: number
  awayYellowCard?: number
  homeRedCard?: number
  awayRedCard?: number
  anchors?: { userAvatar: string; userName: string }[]
  startTime?: number | null
  sources: VideoSource[]
  poster?: string
}

/* ── Server Component ────────────────────────────────────── */

export async function HeroVideo({ className }: { className?: string }) {
  const liveList = await fetchLiveScheduleMatches()

  const matches: LiveMatch[] = await Promise.all(
    liveList.map(async (m) => {
      // Anchor stream → gọi /v2/live/detail?roomId=xxx (giống trang /live/[id])
      if (m.anchor && m.roomId) {
        const detail = await fetchAnchorLiveData(String(m.roomId)).catch(() => null)
        const dm = detail?.match

        const anchorSources =
          dm?.anchorRoom?.flatMap((a, i) =>
            buildStreamSources(a.liveUrl, a.liveUrlFlv, `BLV ${i + 1}`)
          ) ?? buildStreamSources(m.liveUrl, m.liveUrlFlv, "BLV")

        return {
          id: m.matchId,
          chatroomId: m.matchId,
          gameId: m.gameId ?? 0,
          homeName: dm?.homeName ?? m.homeName ?? "",
          homeLogo: dm?.homeLogo ?? m.homeLogo ?? "",
          awayName: dm?.awayName ?? m.awayName ?? "",
          awayLogo: dm?.awayLogo ?? m.awayLogo ?? "",
          homeScore: dm?.homeScore ?? m.homeScore ?? undefined,
          awayScore: dm?.awayScore ?? m.awayScore ?? undefined,
          period: dm?.gameTime ?? m.gameTime ?? undefined,
          state: dm?.state ?? m.state ?? null,
          startTime: dm?.startTime ?? m.startTime ?? null,
          leagueName: dm?.leagueName ?? m.leagueName ?? undefined,
          leagueLogo: dm?.leagueLogo ?? m.leagueLogo ?? undefined,
          homeCornerKick: dm?.homeCornerKick ?? m.homeCornerKick ?? undefined,
          awayCornerKick: dm?.awayCornerKick ?? m.awayCornerKick ?? undefined,
          homeYellowCard: dm?.homeYellowCard ?? m.homeYellowCard ?? undefined,
          awayYellowCard: dm?.awayYellowCard ?? m.awayYellowCard ?? undefined,
          homeRedCard: dm?.homeRedCard ?? m.homeRedCard ?? undefined,
          awayRedCard: dm?.awayRedCard ?? m.awayRedCard ?? undefined,
          anchors:
            dm?.anchorRoom?.map((a) => ({
              userAvatar: a.userAvatar ?? "",
              userName: a.userName ?? "",
            })) ??
            (m.anchorName ? [{ userAvatar: m.anchorAvatar ?? "", userName: m.anchorName }] : []),
          sources: anchorSources,
          poster: dm?.anchorRoom?.[0]?.cover ?? m.liveImage ?? undefined,
        } satisfies LiveMatch
      }

      // Match thường (không có anchor) → dùng sources trực tiếp từ list
      const matchSources = buildStreamSources(m.liveUrl, m.liveUrlFlv, "Nguồn 1")

      return {
        id: m.matchId,
        chatroomId: m.matchId,
        gameId: m.gameId ?? 0,
        homeName: m.homeName ?? "",
        homeLogo: m.homeLogo ?? "",
        awayName: m.awayName ?? "",
        awayLogo: m.awayLogo ?? "",
        homeScore: m.homeScore ?? undefined,
        awayScore: m.awayScore ?? undefined,
        period: m.gameTime ?? undefined,
        state: m.state ?? null,
        startTime: m.startTime ?? null,
        leagueName: m.leagueName ?? undefined,
        leagueLogo: m.leagueLogo ?? undefined,
        homeCornerKick: m.homeCornerKick ?? undefined,
        awayCornerKick: m.awayCornerKick ?? undefined,
        homeYellowCard: m.homeYellowCard ?? undefined,
        awayYellowCard: m.awayYellowCard ?? undefined,
        homeRedCard: m.homeRedCard ?? undefined,
        awayRedCard: m.awayRedCard ?? undefined,
        anchors: [],
        sources: matchSources,
        poster: m.liveImage ?? undefined,
      } satisfies LiveMatch
    })
  )

  return <HeroVideoClient matches={matches} className={className} />
}

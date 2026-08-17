import { MatchStatusEnum } from "@/enums/match.enum"
import type { LiveSearchMatchInterface } from "@/models/match.models"

import {
  fetchLiveScheduleMatches,
  fetchPcLiveGameMatches,
} from "@/features/live-schedule/live-schedule.api"
import {
  buildStreamSources,
  fetchAnchorLiveData,
  fetchMatchLiveData,
} from "@/features/live/api/live.api"
import type { VideoSource } from "@/components/ui/video"

import { HeroVideoClient } from "./hero-video-client"
import { makeHeroPlaybackKey, sortHeroMatches, type LiveMatch } from "./hero-video.utils"

export type { LiveMatch } from "./hero-video.utils"

function dedupeSources(sources: VideoSource[]): VideoSource[] {
  const seen = new Set<string>()
  return sources.filter((source) => {
    if (!source.url || seen.has(source.url)) return false
    seen.add(source.url)
    return true
  })
}

function mapPcLiveMatch(raw: Record<string, unknown>): LiveMatch | null {
  const matchId = raw.matchId as string | number | undefined
  if (matchId == null) return null

  const liveUrls = (raw.liveUrls as { liveUrl?: string; liveUrlFlv?: string }[] | null) ?? []
  const sources = dedupeSources([
    ...liveUrls.flatMap((u, i) => buildStreamSources(u.liveUrl, u.liveUrlFlv, `Nguồn ${i + 1}`)),
    ...buildStreamSources(
      raw.liveUrl as string | null | undefined,
      raw.liveUrlFlv as string | null | undefined,
      "Nguồn 1"
    ),
  ])

  const anchors = ((raw.anchorRoomVos as { userAvatar?: string; userName?: string }[] | null) ?? [])
    .slice(0, 3)
    .map((a) => ({ userAvatar: a.userAvatar ?? "", userName: a.userName ?? "" }))

  return {
    id: matchId,
    chatroomId: matchId,
    gameId: (raw.gameId as number) ?? 0,
    homeName: (raw.homeName as string) ?? "",
    homeLogo: (raw.homeLogo as string) ?? "",
    awayName: (raw.awayName as string) ?? "",
    awayLogo: (raw.awayLogo as string) ?? "",
    homeScore: (raw.homeScore as number) ?? undefined,
    awayScore: (raw.awayScore as number) ?? undefined,
    period: (raw.gameTime as number) ?? undefined,
    state: (raw.state as number) ?? null,
    status: (raw.status as number) ?? null,
    isLive: (raw.isLive as boolean | null) ?? true,
    kind: "live",
    playbackKey: makeHeroPlaybackKey("live", matchId),
    startTime: (raw.startTime as number) ?? null,
    leagueName: (raw.leagueName as string) ?? undefined,
    leagueLogo: (raw.leagueLogo as string) ?? undefined,
    homeCornerKick: (raw.homeCornerKick as number) ?? undefined,
    awayCornerKick: (raw.awayCornerKick as number) ?? undefined,
    homeYellowCard: (raw.homeYellowCard as number) ?? undefined,
    awayYellowCard: (raw.awayYellowCard as number) ?? undefined,
    homeRedCard: (raw.homeRedCard as number) ?? undefined,
    awayRedCard: (raw.awayRedCard as number) ?? undefined,
    anchors,
    sources,
    poster: (raw.liveImage as string) ?? undefined,
  }
}

async function resolveLiveSources(
  match: LiveSearchMatchInterface,
  pcById: Map<string, LiveMatch>,
  shouldFetchDetail: boolean
): Promise<VideoSource[]> {
  const fromList = buildStreamSources(match.liveUrl, match.liveUrlFlv, "Nguồn 1")
  if (fromList.length > 0) return fromList

  const fromPc = pcById.get(String(match.matchId))?.sources ?? []
  if (fromPc.length > 0) return fromPc

  const inPlay = match.isLive === true || match.status === MatchStatusEnum.LIVE
  if (!shouldFetchDetail || !inPlay) return []

  const detail = await fetchMatchLiveData(String(match.matchId), match.gameId).catch(() => null)
  const liveUrls = detail?.match?.liveUrls ?? []
  return dedupeSources(
    liveUrls.flatMap((u, i) => buildStreamSources(u.liveUrl, u.liveUrlFlv, `Nguồn ${i + 1}`))
  )
}

/* ── Server Component ────────────────────────────────────── */

export async function HeroVideo({ className }: { className?: string }) {
  const [liveList, pcLiveRaw] = await Promise.all([
    fetchLiveScheduleMatches(),
    fetchPcLiveGameMatches(),
  ])

  const pcLiveMatches = pcLiveRaw.map(mapPcLiveMatch).filter((m): m is LiveMatch => m != null)
  const pcById = new Map(pcLiveMatches.map((m) => [String(m.id), m]))
  const shouldFetchDetail = pcLiveMatches.length === 0

  const fromSearch: LiveMatch[] = await Promise.all(
    liveList.map(async (m) => {
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
          status: dm?.status ?? m.status ?? null,
          isLive: m.isLive ?? null,
          kind: "commentator",
          playbackKey: makeHeroPlaybackKey("commentator", m.matchId, m.roomId),
          roomId: m.roomId,
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

      const matchSources = await resolveLiveSources(m, pcById, shouldFetchDetail)

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
        status: m.status ?? null,
        isLive: m.isLive ?? null,
        kind: "live",
        playbackKey: makeHeroPlaybackKey("live", m.matchId),
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

  const existingKeys = new Set(fromSearch.map((m) => m.playbackKey))
  const extraLive = pcLiveMatches.filter(
    (m) => m.sources.length > 0 && !existingKeys.has(m.playbackKey)
  )

  return (
    <HeroVideoClient
      matches={sortHeroMatches([...fromSearch, ...extraLive])}
      className={className}
    />
  )
}

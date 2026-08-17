import { MatchFootballStateEnum, MatchStatusEnum } from "@/enums/match.enum"

import type { VideoSource } from "@/components/ui/video"

export type HeroPlaybackKindType = "commentator" | "live"

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
  status?: number | null
  isLive?: boolean | null
  kind?: HeroPlaybackKindType
  playbackKey?: string
  roomId?: string | number | null
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

export const HERO_PLAYBACK_TIMEOUT_MS = 6_000

const IN_PLAY_STATES = new Set<number>([
  MatchFootballStateEnum.PROGRESS,
  MatchFootballStateEnum.FIRST_HALF,
  MatchFootballStateEnum.HALF_TIME,
  MatchFootballStateEnum.SECOND_HALF,
  MatchFootballStateEnum.EXTRA_TIME,
  MatchFootballStateEnum.EXTRA_TIME_SECOND,
  MatchFootballStateEnum.PENALTIES,
])

export function hasHeroCommentator(match: LiveMatch): boolean {
  if (match.kind === "commentator") return true
  if (match.kind === "live") return false
  return (match.anchors?.length ?? 0) > 0
}

export function isHeroMatchInPlay(match: LiveMatch): boolean {
  if (match.kind === "live") return true
  if (match.isLive === true) return true
  if (match.status === MatchStatusEnum.LIVE) return true
  return match.state != null && IN_PLAY_STATES.has(Number(match.state))
}

export function getHeroPlaybackKey(match: LiveMatch): string {
  if (match.playbackKey) return match.playbackKey
  return hasHeroCommentator(match) ? `c-${match.id}-${match.roomId ?? 0}` : `l-${match.id}`
}

export function makeHeroPlaybackKey(
  kind: HeroPlaybackKindType,
  id: string | number,
  roomId?: string | number | null
): string {
  return kind === "commentator" ? `c-${id}-${roomId ?? 0}` : `l-${id}`
}

function heroPlaybackPriority(match: LiveMatch): number {
  if (match.sources.length === 0) return 0
  if (hasHeroCommentator(match)) return 2
  if (isHeroMatchInPlay(match)) return 1
  return 0
}

export function sortHeroMatches(matches: LiveMatch[]): LiveMatch[] {
  return matches
    .map((match, index) => ({ match, index, priority: heroPlaybackPriority(match) }))
    .sort((a, b) => b.priority - a.priority || a.index - b.index)
    .map(({ match }) => match)
}

export function pickHeroFallbackMatch(
  matches: LiveMatch[],
  failedKey: string,
  failedKeys: Set<string>
): LiveMatch | undefined {
  const isUsable = (match: LiveMatch) => {
    const key = getHeroPlaybackKey(match)
    return match.sources.length > 0 && key !== failedKey && !failedKeys.has(key)
  }

  return (
    matches.find(
      (match) => isUsable(match) && isHeroMatchInPlay(match) && !hasHeroCommentator(match)
    ) ?? matches.find(isUsable)
  )
}

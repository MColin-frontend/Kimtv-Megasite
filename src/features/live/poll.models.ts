import type { PollTypeValue } from "./poll.constants"

/* ── API response types ──────────────────────────────────── */

/** Khớp với field `type` từ API response */
export type PollTypeApiValue = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RATING"

/** Trạng thái poll từ API */
export enum PollStatusEnum {
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
}
export type PollStatusValue = `${PollStatusEnum}`

export interface PollOptionInterface {
  optionKey: string // "A", "B", "C"...
  label: string // text hiển thị
  voteCount: number
  percent: number // 0-100
}

export interface PollInterface {
  pollId: string
  chatroomId: number
  liveId: string | null
  gameId: number
  type: PollTypeApiValue
  status: PollStatusValue
  question: string
  options: PollOptionInterface[]
  totalVotes: number
  remainingSec: number
  endsAt: number
  minSelect: number | null
  maxSelect: number | null
  scaleMax: number | null
  requireLogin: boolean
  showRealtime: boolean
  voters: number | null
  average: number | null
  correctOptionKeys: string[] | null
  userVotedOptionKey: string | null
  userVotedOptionKeys: string[] | null
}

/* ── Computed helpers ────────────────────────────────────── */

export function isPollActive(poll: PollInterface): boolean {
  return poll.status === PollStatusEnum.ACTIVE
}

export function isPollVoted(poll: PollInterface): boolean {
  return (poll.userVotedOptionKeys?.length ?? 0) > 0
}

/** Map API type → local PollTypeValue */
export const POLL_TYPE_API_MAP: Record<PollTypeApiValue, PollTypeValue> = {
  SINGLE_CHOICE: "single",
  MULTIPLE_CHOICE: "multiple",
  RATING: "rating",
}

export const POLL_TYPE_BADGE_CONFIG: Record<PollTypeApiValue, { label: string; cls: string }> = {
  SINGLE_CHOICE: {
    label: "SINGLE CHOICE",
    cls: "text-green-400 bg-green-400/10 border border-green-400/25",
  },
  MULTIPLE_CHOICE: {
    label: "MULTIPLE CHOICE",
    cls: "text-violet-400 bg-violet-400/10 border border-violet-400/25",
  },
  RATING: { label: "RATING", cls: "text-gold bg-gold/10 border border-gold/25" },
}

/* ── Create/Vote payload types ───────────────────────────── */

export interface CreatePollPayloadInterface {
  chatroomId: string | number
  gameId?: number
  pollType: PollTypeValue
  question: string
  options: string[]
  /** Thời gian tính bằng giây */
  duration: number
  minSelect?: number
  maxSelect?: number
}

export interface VotePayloadInterface {
  pollId: string
  optionKeys: string[]
}

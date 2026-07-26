import { PollStatusEnum, type PollStatusValue, type PollTypeApiValue } from "./poll.constants"

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

export function isPollActive(poll: PollInterface): boolean {
  return poll.status === PollStatusEnum.ACTIVE
}

export function isPollVoted(poll: PollInterface): boolean {
  return (poll.userVotedOptionKeys?.length ?? 0) > 0
}

export interface CreatePollPayloadInterface {
  chatroomId: string | number
  gameId: number
  type: PollTypeApiValue
  question: string
  durationSec: number
  requireLogin: boolean
  showRealtime: boolean
  options?: string[]
  minSelect?: number
  maxSelect?: number
  scaleMax?: number
}

export interface VotePayloadInterface {
  pollId: string
  optionKeys: string[]
}

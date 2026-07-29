"use client"

import { javaGet, javaPost } from "@/server/services/client-request"
import { getTokenFromCookie } from "@/lib/auth-cookie"

import { env } from "@/config/env"

import { PollTypeApiEnum, type PollTypeApiValue } from "../poll.constants"
import type {
  CreatePollPayloadInterface,
  PollInterface,
  VotePayloadInterface,
} from "../poll.models"

/* ── Endpoints ───────────────────────────────────────────── */

export function getPollWsUrl(chatroomId: string | number, gameId: number) {
  const token = getTokenFromCookie()
  const params = new URLSearchParams({
    chatroom_id: String(chatroomId),
    game_id: String(gameId),
    lan: "vi",
  })
  if (token) params.set("token", token)
  return `${env.wsBaseUrl}/poll?${params}`
}

export const POLL_API = {
  CREATE: "/live-poll/create",
  VOTE: "/live-poll/vote",
  CLOSE: "/live-poll/close",
  HISTORY: "/live-poll/history",
  ACTIVE: "/live-poll/active",
} as const

/* ── API functions ───────────────────────────────────────── */

export function createPollApi(payload: CreatePollPayloadInterface) {
  return javaPost<PollInterface>(POLL_API.CREATE, payload, { isMessageError: true })
}

export function votePollApi(pollId: string, optionKeys: string[], pollType: PollTypeApiValue) {
  // MULTIPLE_CHOICE → optionKeys[]; SINGLE_CHOICE / RATING → optionKey
  const payload: VotePayloadInterface =
    pollType === PollTypeApiEnum.MULTIPLE_CHOICE
      ? { pollId, optionKeys }
      : { pollId, optionKey: optionKeys[0] }

  return javaPost<PollInterface>(POLL_API.VOTE, payload, { isMessageError: true })
}

export function closePollApi(pollId: string) {
  return javaPost<void>(POLL_API.CLOSE, { pollId }, { isMessageError: true })
}

export function getPollHistoryApi(chatroomId: string | number, limit = 50) {
  return javaGet<PollInterface[]>(POLL_API.HISTORY, {
    params: { chatroomId, gameId: 0, limit },
    isMessageError: false,
  })
}

export function getActivePollApi(chatroomId: string | number) {
  return javaGet<PollInterface | null>(POLL_API.ACTIVE, {
    params: { chatroomId, gameId: 0 },
    isMessageError: false,
  })
}

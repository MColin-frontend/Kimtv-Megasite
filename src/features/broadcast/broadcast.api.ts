import type { ApiEnvelopeInterface } from "@/server/request.models"
import { clientGet, javaGet, javaPost, javaUrl } from "@/server/services/client-request"

import type {
  AnchorInfoInterface,
  ApplyAnchorPayloadInterface,
  BroadcastMatchGroupInterface,
  CreateAnchorLivePayloadInterface,
  CreateAnchorLiveResultInterface,
  IsBroadcastResponseInterface,
  IsBroadcastWithTimeInterface,
  LeagueFetchParamsInterface,
  LeagueFetchResultInterface,
  LeagueItemInterface,
  LiveInfoInterface,
  LiveUrlItemInterface,
  ReservationItemInterface,
  ToggleMatchIdPayloadInterface,
  UpdateAnchorPayloadInterface,
} from "./broadcast.models"

/* ── Endpoints ────────────────────────────────────────────── */

export const BROADCAST_API = {
  BROADCAST: "/anchor/broadcast",
  DOWNCAST: "/anchor/downcast",
  IS_BROADCAST: "/anchor/is-broadcast",
  LIVE_INFO: "/anchor/live-info",
  CREATE_LIVE: "/anchor/creat-anchor-live",
  TOGGLE_MATCH_ID: "/anchor/toggle-match-id",
  ANCHOR_INFO: "/anchor-info",
  APPLY_ANCHOR: "/anchor/user",
  MATCHES_BY_GAME: "/match/game-living-future",
  LEAGUE_LIST: "/match/league",
  UPDATE_ANCHOR: "/update-anchor",
  RESERVATION_LIST: "/get-reservation-list",
  RESERVATION_LIST_BY_ANTHOR: "/anthor/reservation-list",
  RESERVATION: "/reservation",
  DELETE_RESERVATION: "/delete-reservation",
} as const

/* ── Match list ───────────────────────────────────────────── */

export type { BroadcastMatchGroupInterface as BroadcastMatchGroup }

export function fetchMatchesByGame(gameId: string): Promise<BroadcastMatchGroupInterface[] | null> {
  return javaGet<BroadcastMatchGroupInterface[]>(BROADCAST_API.MATCHES_BY_GAME, {
    params: { gameId },
  })
}

/* ── League async fetch ───────────────────────────────────── */

export async function fetchLeagueOptions(
  gameId: string,
  { search, page, pageSize }: LeagueFetchParamsInterface
): Promise<LeagueFetchResultInterface> {
  const res = await javaGet<LeagueItemInterface[]>(BROADCAST_API.LEAGUE_LIST, {
    params: { sportId: gameId, search, page, pageSize },
  })

  const items = res ?? []
  return {
    options: items.map((l) => ({
      value: String(l.leagueId),
      label: l.leagueName ?? `League #${l.leagueId}`,
    })),
    hasMore: items.length === pageSize,
  }
}

/* ── Anchor info ──────────────────────────────────────────── */

export function fetchAnchorInfo(): Promise<AnchorInfoInterface | null> {
  return javaPost<AnchorInfoInterface>(BROADCAST_API.ANCHOR_INFO)
}

export function applyAnchor(form: {
  name: string
  phone: string
  idNumber: string
  brief: string
  idFront: string
  idBack: string
  idHolding: string
}): Promise<void | null> {
  const payload: ApplyAnchorPayloadInterface = {
    userName: form.name,
    mobile: form.phone,
    idCard: form.idNumber,
    description: form.brief,
    idCardFront: form.idFront,
    idCardOpposite: form.idBack,
    handIdCard: form.idHolding,
    gameIds: "202",
    customTags: "1",
  }
  return javaPost<void>(BROADCAST_API.APPLY_ANCHOR, payload, { isMessageSuccess: true })
}

/* ── Create anchor live ───────────────────────────────────── */

export type { CreateAnchorLiveResultInterface as CreateAnchorLiveResult }

export function createAnchorLive(
  payload: CreateAnchorLivePayloadInterface
): Promise<CreateAnchorLiveResultInterface | null> {
  return javaPost<CreateAnchorLiveResultInterface>(BROADCAST_API.CREATE_LIVE, payload)
}

/* ── Update anchor ────────────────────────────────────────── */

export function updateAnchor(payload: UpdateAnchorPayloadInterface) {
  return javaPost<void>(BROADCAST_API.UPDATE_ANCHOR, payload, {
    isMessageSuccess: true,
    messageSuccess: "Cập nhật thông tin thành công",
  })
}

/* ── Start / end stream ───────────────────────────────────── */

export function startBroadcast(liveId: string): Promise<unknown> {
  return javaGet(BROADCAST_API.BROADCAST, { params: { liveId } })
}

export function fetchLiveInfo(liveId: string): Promise<LiveInfoInterface | null> {
  return javaGet<LiveInfoInterface>(BROADCAST_API.LIVE_INFO, { params: { liveId } })
}

export function downcastStream(liveId: string): Promise<unknown> {
  return javaGet(BROADCAST_API.DOWNCAST, { params: { liveId } })
}

export function fetchIsBroadcast(): Promise<IsBroadcastResponseInterface | null> {
  return javaGet<IsBroadcastResponseInterface>(BROADCAST_API.IS_BROADCAST)
}

export async function fetchIsBroadcastWithTime(): Promise<IsBroadcastWithTimeInterface> {
  const res = await clientGet<ApiEnvelopeInterface<IsBroadcastResponseInterface>>(
    javaUrl(BROADCAST_API.IS_BROADCAST)
  )

  return {
    result: res.data?.result ?? null,
    time: res.data?.time ?? null,
  }
}

export type { IsBroadcastResponseInterface, LiveUrlItemInterface }

export function toggleMatchId(payload: ToggleMatchIdPayloadInterface): Promise<unknown> {
  return javaPost(BROADCAST_API.TOGGLE_MATCH_ID, payload)
}

export type { ToggleMatchIdPayloadInterface as ToggleMatchIdPayload }

export function cancelReservation(liveId: string): Promise<unknown> {
  return javaGet("/anchor/cancel-reservation", { params: { liveId } })
}

/* ── Reservation ──────────────────────────────────────────── */

export interface ReservationListPayloadInterface {
  date: number
  gameId: number
  leagueIds: string
  option: number
  page: number
  lot: number | null
}

export function fetchReservations(): Promise<ReservationItemInterface[] | null> {
  return javaGet<ReservationItemInterface[]>(BROADCAST_API.RESERVATION_LIST)
}

export function createReservation(matchId: number, gameId: number): Promise<unknown> {
  return javaPost(
    BROADCAST_API.RESERVATION,
    { matchId, gameId },
    {
      isMessageSuccess: true,
      messageSuccess: "Đặt lịch thành công",
    }
  )
}

export function deleteReservation(matchId: number, gameId: number): Promise<unknown> {
  return javaPost(
    BROADCAST_API.DELETE_RESERVATION,
    { matchId, gameId },
    {
      isMessageSuccess: true,
      messageSuccess: "Hủy đặt lịch thành công",
    }
  )
}

export type { ReservationItemInterface }

export function fetchReservationList(payload: {
  date: number
  gameId: number
  leagueIds: string
}): Promise<ReservationItemInterface[] | null> {
  return javaPost<ReservationItemInterface[]>(BROADCAST_API.RESERVATION_LIST_BY_ANTHOR, {
    option: 1,
    page: 1,
    lot: null,
    ...payload,
  })
}

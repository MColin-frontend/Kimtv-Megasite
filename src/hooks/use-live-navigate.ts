"use client"

import type { LocaleType } from "@/i18n"
import { getRoutes } from "@/config/routes"

import { useRouter } from "./useRouter"

export function useLiveNavigate() {
  const { push, pathname } = useRouter()

  return function navigateToLive(matchId: string | number, gameId: number, roomId?: number | null) {
    const locale = (pathname.split("/")[1] || "vi") as LocaleType
    const base = getRoutes(locale).live(matchId, gameId)
    push(roomId ? `${base}&room_id=${roomId}` : base)
  }
}

import { Suspense } from "react"

import { fetchAnchorLiveData, fetchMatchLiveData } from "@/features/live/api/live.api"
import { LivePage } from "@/features/live/components"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ lang: string; id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TrucTiepPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams

  const gameId = sp.game_id ? Number(sp.game_id) : null
  const roomId = sp.room_id ? Number(sp.room_id) : undefined
  const liveType = sp.liveType ? Number(sp.liveType) : undefined
  const anchorLiveId = sp.anchorLiveId ? Number(sp.anchorLiveId) : undefined

  // kimtvpc: isAnchor → chatroomId=roomId + gameId=0, else → chatroomId=matchId + gameId
  const isAnchor = !!roomId
  const chatroomId = isAnchor ? String(roomId) : id
  const chatGameId = isAnchor ? 0 : (gameId ?? 0)

  const data = gameId
    ? await fetchMatchLiveData(id, gameId, { liveType, anchorLiveId })
    : await fetchAnchorLiveData(id)

  return (
    <Suspense>
      <LivePage match={data.match} chatroomId={chatroomId} gameId={chatGameId} />
    </Suspense>
  )
}

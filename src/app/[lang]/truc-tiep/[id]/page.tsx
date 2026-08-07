import { Suspense } from "react"

import { createMetadata } from "@/lib/metadata"
import { getRoutes } from "@/config/routes"
import type { LocaleType } from "@/i18n"

import { fetchAnchorLiveData, fetchMatchLiveData } from "@/features/live/api/live.api"
import { LivePage } from "@/features/live/components"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ lang: string; id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { lang, id } = await params
  const sp = await searchParams
  const gameId = sp.game_id ? Number(sp.game_id) : null

  const data = gameId ? await fetchMatchLiveData(id, gameId) : await fetchAnchorLiveData(id)

  const match = data.match
  const home = match?.homeName?.trim()
  const away = match?.awayName?.trim()
  const league = match?.leagueName?.trim()
  const title =
    home && away ? `${home} vs ${away}${league ? ` — ${league}` : ""}` : "Xem bóng đá trực tiếp"

  const description =
    home && away
      ? `Xem trực tiếp ${home} vs ${away}${league ? ` (${league})` : ""} trên KimTV — tỉ số live, bình luận và phòng chat.`
      : "Xem bóng đá trực tiếp trên KimTV — tỉ số live, bình luận viên và phòng chat."

  const path = getRoutes(lang as LocaleType).liveBase(id)
  const ogImage = match?.homeLogo ?? match?.awayLogo ?? null

  return createMetadata({
    title,
    description,
    keywords: [
      "bóng đá trực tiếp",
      "xem live",
      "KimTV",
      ...(home ? [home] : []),
      ...(away ? [away] : []),
      ...(league ? [league] : []),
    ],
    alternates: { canonical: path },
    openGraph: {
      url: path,
      title,
      description,
      images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
    },
  })
}

export default async function TrucTiepPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams

  const gameId = sp.game_id ? Number(sp.game_id) : null
  const liveType = sp.liveType ? Number(sp.liveType) : undefined
  const anchorLiveId = sp.anchorLiveId ? Number(sp.anchorLiveId) : undefined

  const data = gameId
    ? await fetchMatchLiveData(id, gameId, { liveType, anchorLiveId })
    : await fetchAnchorLiveData(id)

  return (
    <Suspense>
      <LivePage match={data.match} />
    </Suspense>
  )
}

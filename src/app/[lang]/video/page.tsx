import { createMetadata } from "@/lib/metadata"

import { FeedMenu } from "@/enums/highlights.enum"

import { fetchInitialHighlights } from "@/features/highlights/api/highlights.server"
import { HighlightsPage } from "@/features/highlights/components/index"
import { HIGHLIGHT_STATUS_PARAM } from "@/features/highlights/highlights.constants"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const path = `/${lang}/video`

  const data = await fetchInitialHighlights(FeedMenu.Featured).catch(() => ({
    videos: [],
    hasMore: false,
  }))
  const firstVideo = data.videos[0] ?? null

  return createMetadata({
    title: "Highlight thể thao",
    description:
      "Xem highlight bóng đá, video thể thao mới nhất trên KimTV — cập nhật liên tục, xem nhanh như feed ngắn.",
    keywords: [
      "highlight bóng đá",
      "video bóng đá",
      "clip bàn thắng",
      "highlight thể thao",
      "KimTV",
    ],
    alternates: { canonical: path },
    openGraph: {
      url: path,
      images: firstVideo?.coverUrl
        ? [{ url: firstVideo.coverUrl, alt: "Highlight thể thao | KimTV" }]
        : undefined,
    },
  })
}

export default async function VideoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const highlightStatus = params[HIGHLIGHT_STATUS_PARAM]

  return (
    <HighlightsPage
      highlightStatus={typeof highlightStatus === "string" ? highlightStatus : undefined}
    />
  )
}

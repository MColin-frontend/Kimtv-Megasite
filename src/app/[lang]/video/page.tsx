import { createMetadata } from "@/lib/metadata"

import { HighlightsPage } from "@/features/highlights/components/index"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const path = `/${lang}/video`
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
    openGraph: { url: path },
  })
}

export default async function VideoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const highlightStatus = params["highlight-status"]

  return (
    <HighlightsPage
      highlightStatus={typeof highlightStatus === "string" ? highlightStatus : undefined}
    />
  )
}

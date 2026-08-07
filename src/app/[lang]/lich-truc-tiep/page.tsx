import { createMetadata } from "@/lib/metadata"
import { getRoutes } from "@/config/routes"
import type { LocaleType } from "@/i18n"
import { fetchLiveScheduleMatches } from "@/features/live-schedule/live-schedule.api"

import { LiveSchedulePage } from "@/features/live-schedule/components"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const path = getRoutes(lang as LocaleType).liveSchedule

  const matches = await fetchLiveScheduleMatches().catch(() => [])
  const first = matches[0] ?? null
  const ogImage = first?.liveImage ?? first?.homeLogo ?? null

  return createMetadata({
    title: "Lịch trực tiếp",
    description:
      "Danh sách trận bóng đá đang và sắp phát sóng trực tiếp trên KimTV — theo dõi live, bình luận viên và phòng chat.",
    keywords: [
      "lịch trực tiếp",
      "bóng đá live",
      "xem bóng đá trực tiếp",
      "phòng live",
      "bình luận viên",
      "KimTV",
    ],
    alternates: { canonical: path },
    openGraph: {
      url: path,
      images: ogImage ? [{ url: ogImage, alt: "Lịch trực tiếp | KimTV" }] : undefined,
    },
  })
}

export default function Page() {
  return <LiveSchedulePage />
}

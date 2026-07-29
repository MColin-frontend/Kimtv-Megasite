import { createMetadata } from "@/lib/metadata"

import { LiveSchedulePage } from "@/features/live-schedule/components"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const path = `/${lang}/lich-truc-tiep`
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
    openGraph: { url: path },
  })
}

export default function Page() {
  return <LiveSchedulePage />
}

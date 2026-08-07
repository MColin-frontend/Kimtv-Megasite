import { createMetadata } from "@/lib/metadata"
import { getRoutes } from "@/config/routes"
import type { LocaleType } from "@/i18n"

import { BroadcastCenterPage } from "@/features/broadcast/components"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const path = getRoutes(lang as LocaleType).broadcastCenter
  return createMetadata({
    title: "Trung tâm phát trực tiếp",
    description:
      "Trung tâm quản lý phát sóng KimTV — cài đặt luồng, đặt lịch trước, theo dõi lịch sử và quy định livestream.",
    keywords: [
      "trung tâm phát trực tiếp",
      "quản lý livestream",
      "đặt lịch phát sóng",
      "cài đặt RTMP",
      "KimTV",
    ],
    alternates: { canonical: path },
    openGraph: { url: path },
  })
}

export default function Page() {
  return <BroadcastCenterPage />
}

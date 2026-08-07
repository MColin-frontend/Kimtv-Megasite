import { createMetadata } from "@/lib/metadata"
import { getRoutes } from "@/config/routes"
import type { LocaleType } from "@/i18n"

import { HomePage } from "@/features/home/components"

export const revalidate = 30

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const { home } = getRoutes(lang as LocaleType)
  return createMetadata({
    title: "Trang chủ",
    description:
      "KimTV — trang chủ bóng đá trực tiếp: lịch thi đấu hôm nay, tỉ số live, tin nóng và highlight mới nhất.",
    keywords: [
      "KimTV",
      "trang chủ bóng đá",
      "bóng đá trực tiếp",
      "tỉ số online",
      "lịch thi đấu hôm nay",
      "highlight bóng đá",
    ],
    alternates: { canonical: home },
    openGraph: { url: home },
  })
}

export default function Page() {
  return <HomePage />
}

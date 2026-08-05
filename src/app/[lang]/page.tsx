import { createMetadata } from "@/lib/metadata"

import { HomePage } from "@/features/home/components"

export const revalidate = 30

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
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
    alternates: { canonical: `/${lang}` },
    openGraph: { url: `/${lang}` },
  })
}

export default function Page() {
  return <HomePage />
}

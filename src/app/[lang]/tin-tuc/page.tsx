import { createMetadata } from "@/lib/metadata"

import { fetchHotNewsByGameAction } from "@/features/news/news.server"

export { NewsIndexPage as default } from "@/features/news/components"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const path = `/${lang}/tin-tuc`

  const hotNews = await fetchHotNewsByGameAction().catch(() => ({ news: [], videos: [] }))
  const firstItem = hotNews.news[0] ?? null

  return createMetadata({
    title: "Tin tức bóng đá",
    description:
      "Tin tức bóng đá mới nhất trên KimTV — chuyển nhượng, phân tích trận đấu, xu hướng và góc nhìn chuyên sâu.",
    keywords: ["tin tức bóng đá", "tin chuyển nhượng", "bóng đá hôm nay", "tin thể thao", "KimTV"],
    alternates: { canonical: path },
    openGraph: {
      url: path,
      images: firstItem?.coverUrl
        ? [{ url: firstItem.coverUrl, alt: "Tin tức bóng đá | KimTV" }]
        : undefined,
    },
  })
}

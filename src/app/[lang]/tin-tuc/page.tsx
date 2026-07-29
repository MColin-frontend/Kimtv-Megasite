import { createMetadata } from "@/lib/metadata"

export { NewsIndexPage as default } from "@/features/news/components"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const path = `/${lang}/tin-tuc`
  return createMetadata({
    title: "Tin tức bóng đá",
    description:
      "Tin tức bóng đá mới nhất trên KimTV — chuyển nhượng, phân tích trận đấu, xu hướng và góc nhìn chuyên sâu.",
    keywords: ["tin tức bóng đá", "tin chuyển nhượng", "bóng đá hôm nay", "tin thể thao", "KimTV"],
    alternates: { canonical: path },
    openGraph: { url: path },
  })
}

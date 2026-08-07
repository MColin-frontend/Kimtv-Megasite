import { createMetadata } from "@/lib/metadata"
import { getRoutes } from "@/config/routes"
import type { LocaleType } from "@/i18n"

import { NewsArticlePage } from "@/features/news/components/details"
import { fetchNewsArticleAction } from "@/features/news/news.server"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const detail = await fetchNewsArticleAction(slug)
  const path = getRoutes(lang as LocaleType).news.article(slug)
  const title = detail?.title?.trim() || "Chi tiết tin tức"
  const description =
    detail?.summary?.trim() ||
    (detail?.title?.trim()
      ? `${detail.title.trim()} — tin tức bóng đá trên KimTV.`
      : "Đọc tin tức bóng đá chi tiết trên KimTV.")

  return createMetadata({
    title,
    description,
    keywords: ["tin tức bóng đá", "KimTV", title],
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
      images: detail?.coverUrl ? [{ url: detail.coverUrl, alt: title }] : undefined,
    },
  })
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { slug } = await params
  return <NewsArticlePage slug={slug} />
}

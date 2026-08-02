import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { getRoutes } from "@/config/routes"
import { fetchPopularNewsListAction } from "@/features/news/news.server"

export const revalidate = 3600

const BASE = siteConfig.url
const routes = getRoutes("vi")

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}${routes.home}`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}${routes.schedule}`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}${routes.liveSchedule}`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}${routes.news.index}`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}${routes.video.index}`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}${routes.broadcast}`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}${routes.broadcastCenter}`, changeFrequency: "weekly", priority: 0.7 },
  ]

  const newsItems = await fetchPopularNewsListAction().catch(() => [])
  const newsRoutes: MetadataRoute.Sitemap = newsItems.map((item) => ({
    url: `${BASE}${routes.news.article(String(item.newsId))}`,
    lastModified: item.publishTime ? new Date(item.publishTime) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...newsRoutes]
}

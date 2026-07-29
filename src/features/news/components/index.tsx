import { Suspense } from "react"

import { getTranslation } from "@/i18n/get-locale"
import { getRoutes } from "@/config/routes"

import { fetchFeaturedNewsAction, fetchLatestNewsListAction } from "@/features/home/home.api"
import { fetchPopularNewsListAction } from "@/features/news/news.server"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Typography } from "@/components/ui/typography"

import { NewsHeroCarousel } from "./hero"
import { NewsLatestPanel } from "./latest"
import { NewsPopularPanel } from "./popular"
import { NewsHeroSkeleton, NewsPanelsSkeleton } from "./skeleton"

async function HeroSection() {
  const items = await fetchFeaturedNewsAction()
  if (!items.length) return null
  return <NewsHeroCarousel items={items.slice(0, 5)} />
}

async function PanelsSection() {
  const { t, locale } = await getTranslation()
  const routes = getRoutes(locale)

  const [latestResult, popularResult] = await Promise.allSettled([
    fetchLatestNewsListAction(5),
    fetchPopularNewsListAction(),
  ])

  const latestNews = latestResult.status === "fulfilled" ? latestResult.value : []
  const popularNews = popularResult.status === "fulfilled" ? popularResult.value : []

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.43fr]">
      <NewsLatestPanel
        items={latestNews}
        title={t("news.latest")}
        viewAllHref={routes.news.index}
        viewAllLabel={t("news.view-all")}
        categoryLabel={t("news.category")}
        getHref={(id) => routes.news.article(id)}
      />
      <NewsPopularPanel
        items={popularNews.slice(0, 4)}
        title={t("news.popular")}
        viewAllHref={routes.news.index}
        viewAllLabel={t("news.view-all")}
        categoryLabel={t("news.category")}
        getHref={(id) => routes.news.article(id)}
      />
    </div>
  )
}

export async function NewsIndexPage() {
  const { t } = await getTranslation()

  return (
    <div className="container flex flex-col gap-8 py-8 max-lg:gap-6 max-lg:py-6 max-md:gap-4 max-md:py-4">
      <ScrollReveal variant="fade-up" duration={500} distance={20}>
        <div className="flex flex-col gap-1">
          <Typography variant="h1" className="text-gold uppercase">
            {t("news.page-title")}
          </Typography>
          <Typography variant="body" weight="600" className="text-white">
            {t("news.subtitle")}
          </Typography>
        </div>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" duration={600} distance={24} delay={80}>
        <Suspense fallback={<NewsHeroSkeleton />}>
          <HeroSection />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" duration={600} distance={20} delay={160}>
        <Suspense fallback={<NewsPanelsSkeleton />}>
          <PanelsSection />
        </Suspense>
      </ScrollReveal>
    </div>
  )
}

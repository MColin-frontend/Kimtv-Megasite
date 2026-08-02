import { Suspense } from "react"

import { getTranslation } from "@/i18n/get-locale"
import { getRoutes } from "@/config/routes"

import { HighlightsCarousel } from "@/features/home/components/match-fixtures/news/highlights"
import { NewsSectionCard } from "@/features/home/components/match-fixtures/news/news-section-card"
import {
  HighlightsSkeleton,
  NewsSectionSkeleton,
} from "@/features/home/components/match-fixtures/news/skeleton"
import {
  fetchFeaturedNewsAction,
  fetchLatestNewsListAction,
  fetchPopularNewsAction,
} from "@/features/home/home.api"

async function HighlightsSection() {
  const items = await fetchPopularNewsAction()
  return <HighlightsCarousel items={items} />
}

export async function ScheduleSidebar() {
  const { t, locale } = await getTranslation()
  const routes = getRoutes(locale)

  const [trendingItems, latestItems] = await Promise.all([
    fetchFeaturedNewsAction(),
    fetchLatestNewsListAction(5),
  ])

  const commonProps = {
    categoryLabel: t("news.category"),
    viewAllHref: routes.news.index,
    viewAllLabel: t("news.view-all"),
    locale,
  }

  return (
    <section className="flex flex-col gap-4">
      <Suspense fallback={<HighlightsSkeleton />}>
        <HighlightsSection />
      </Suspense>

      <Suspense fallback={<NewsSectionSkeleton />}>
        <NewsSectionCard
          {...commonProps}
          title={t("news.title")}
          items={trendingItems.filter((item) => item.coverUrl && item.title).slice(0, 5)}
        />
      </Suspense>

      <Suspense fallback={<NewsSectionSkeleton />}>
        <NewsSectionCard
          {...commonProps}
          title={t("schedule.latest-news")}
          items={latestItems}
        />
      </Suspense>
    </section>
  )
}

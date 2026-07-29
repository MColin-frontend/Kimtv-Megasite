import { Suspense } from "react"
import { isEmpty } from "lodash"

import { getTranslation } from "@/i18n/get-locale"
import { getRoutes } from "@/config/routes"

import { HighlightsCarousel } from "@/features/home/components/match-fixtures/news/highlights"
import { NewsCarouselMobile } from "@/features/home/components/match-fixtures/news/news-carousel-mobile"
import { NewsSectionHeader } from "@/features/home/components/match-fixtures/news/news-section-header"
import {
  HighlightsSkeleton,
  NewsSectionSkeleton,
} from "@/features/home/components/match-fixtures/news/skeleton"
import {
  fetchFeaturedNewsAction,
  fetchLatestNewsListAction,
  fetchPopularNewsAction,
} from "@/features/home/home.api"
import type { NewsItem } from "@/features/home/home.api"
import { NewsItemRow } from "@/features/news/components/item"
import { NewsSectionPropsInterface } from "@/features/news/news.models"

interface NewsSectionCardProps {
  title: string
  viewAllHref: string
  viewAllLabel: string
  items: NewsItem[]
  categoryLabel: string
  getHref: (id: string) => string
}

function NewsSectionCard({
  title,
  viewAllHref,
  viewAllLabel,
  items,
  categoryLabel,
  getHref,
}: NewsSectionCardProps) {
  if (isEmpty(items)) return null
  return (
    <div className="card-glow rounded-12 flex flex-col gap-2 p-4 max-sm:p-3">
      <NewsSectionHeader title={title} href={viewAllHref} viewAllLabel={viewAllLabel} />

      <div className="hidden flex-col lg:flex">
        {items.slice(0, 5).map((item) => (
          <NewsItemRow
            key={String(item.newsId)}
            item={item}
            categoryLabel={categoryLabel}
            href={getHref(String(item.newsId))}
          />
        ))}
      </div>

      <div className="lg:hidden">
        <NewsCarouselMobile items={items.slice(0, 5)} categoryLabel={categoryLabel} />
      </div>
    </div>
  )
}

async function TrendingNewsSection(props: NewsSectionPropsInterface) {
  const items = await fetchFeaturedNewsAction()
  return <NewsSectionCard {...props} items={items} />
}

async function LatestNewsSection(props: NewsSectionPropsInterface) {
  const items = await fetchLatestNewsListAction(5)
  return <NewsSectionCard {...props} items={items} />
}

async function HighlightsSection() {
  const items = await fetchPopularNewsAction()
  return <HighlightsCarousel items={items} />
}

export async function ScheduleSidebar() {
  const { t, locale } = await getTranslation()
  const routes = getRoutes(locale)

  const commonProps: Omit<NewsSectionPropsInterface, "title"> = {
    categoryLabel: t("news.category"),
    viewAllHref: routes.news.index,
    viewAllLabel: t("news.view-all"),
    getHref: (id) => routes.news.article(id),
  }

  return (
    <section className="flex flex-col gap-4">
      <Suspense fallback={<HighlightsSkeleton />}>
        <HighlightsSection />
      </Suspense>

      <Suspense fallback={<NewsSectionSkeleton />}>
        <TrendingNewsSection {...commonProps} title={t("news.title")} />
      </Suspense>

      <Suspense fallback={<NewsSectionSkeleton />}>
        <LatestNewsSection {...commonProps} title={t("schedule.latest-news")} />
      </Suspense>
    </section>
  )
}

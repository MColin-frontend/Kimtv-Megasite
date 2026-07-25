import { Suspense } from "react"
import { isEmpty } from "lodash"

import { getTranslation } from "@/i18n/get-locale"
import { getRoutes } from "@/config/routes"

import type { NewsItem } from "@/features/home/home.api"
import { fetchFeaturedNewsAction } from "@/features/home/home.api"
import { NewsItemRow } from "@/features/news/components/item"
import type { NewsSectionPropsInterface } from "@/features/news/news.models"

import { NewsCarouselMobile } from "./news-carousel-mobile"
import { NewsSectionHeader } from "./news-section-header"
import { NewsSectionSkeleton } from "./skeleton"

function NewsListContent({
  items,
  categoryLabel,
  getHref,
}: {
  items: NewsItem[]
  categoryLabel: string
  getHref: (id: string) => string
}) {
  return (
    <>
      <div className="hidden flex-col gap-2 divide-y divide-white/[0.06] lg:flex">
        {items.map((item) => (
          <NewsItemRow
            key={String(item.newsId)}
            item={item}
            categoryLabel={categoryLabel}
            href={getHref(String(item.newsId))}
          />
        ))}
      </div>

      {/* Mobile: slide full width */}
      <div className="lg:hidden">
        <NewsCarouselMobile items={items} categoryLabel={categoryLabel} />
      </div>
    </>
  )
}

async function FeaturedSection({
  title,
  categoryLabel,
  viewAllHref,
  viewAllLabel,
  getHref,
}: NewsSectionPropsInterface) {
  const items = await fetchFeaturedNewsAction()
  const validItems = items?.filter((item) => item.coverUrl && item.title) ?? []
  if (isEmpty(validItems)) return null
  return (
    <div className="card-glow rounded-12 flex flex-col gap-3 p-4 max-sm:gap-2 max-sm:p-3">
      <NewsSectionHeader title={title} href={viewAllHref} viewAllLabel={viewAllLabel} />
      <NewsListContent
        items={validItems.slice(0, 5)}
        categoryLabel={categoryLabel}
        getHref={getHref}
      />
    </div>
  )
}

export default async function NewsList() {
  const { t, locale } = await getTranslation()
  const routes = getRoutes(locale)
  const commonProps = {
    categoryLabel: t("news.category"),
    viewAllHref: routes.news.index,
    viewAllLabel: t("news.view-all"),
    getHref: (id: string) => routes.news.article(id),
  }

  return (
    <Suspense fallback={<NewsSectionSkeleton />}>
      <FeaturedSection {...commonProps} title={t("news.title")} />
    </Suspense>
  )
}

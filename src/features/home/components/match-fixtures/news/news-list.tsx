import { Suspense } from "react"
import { isEmpty } from "lodash"

import { getTranslation } from "@/i18n/get-locale"
import { getRoutes } from "@/config/routes"

import { fetchFeaturedNewsAction } from "@/features/home/home.api"

import { NewsSectionCard } from "./news-section-card"
import { NewsSectionSkeleton } from "./skeleton"

export default async function NewsList() {
  const { t, locale } = await getTranslation()
  const routes = getRoutes(locale)
  const items = await fetchFeaturedNewsAction()
  const validItems = items?.filter((item) => item.coverUrl && item.title) ?? []

  if (isEmpty(validItems)) return null

  return (
    <Suspense fallback={<NewsSectionSkeleton />}>
      <NewsSectionCard
        title={t("news.title")}
        categoryLabel={t("news.category")}
        viewAllHref={routes.news.index}
        viewAllLabel={t("news.view-all")}
        locale={locale}
        items={validItems.slice(0, 5)}
      />
    </Suspense>
  )
}

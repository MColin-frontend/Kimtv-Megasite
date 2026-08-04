"use client"

import { useCallback, useState } from "react"
import { isEmpty } from "lodash"

import { cn } from "@/lib/utils"

import type { LocaleType } from "@/i18n"
import { getRoutes } from "@/config/routes"

import { NewsItemFeatured, NewsItemRow } from "@/features/news/components/item"
import type { NewsItem } from "@/features/news/news.models"
import dynamic from "next/dynamic"

import type {
  default as CarouselInfinityComponent,
  CarouselInfinityApi,
} from "@/components/ui/carousel/carousel-infinity"

const CarouselInfinity = dynamic(
  () => import("@/components/ui/carousel/carousel-infinity"),
  { ssr: false }
) as typeof CarouselInfinityComponent

import { NewsSectionHeader } from "./news-section-header"

interface NewsSectionCardProps {
  title: string
  viewAllHref: string
  viewAllLabel: string
  items: NewsItem[]
  categoryLabel: string
  locale: LocaleType
}

export function NewsSectionCard({
  title,
  viewAllHref,
  viewAllLabel,
  items,
  categoryLabel,
  locale,
}: NewsSectionCardProps) {
  const routes = getRoutes(locale)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleApiReady = useCallback((api: CarouselInfinityApi) => {
    api?.on("select", () => setActiveIndex(api.selectedScrollSnap()))
  }, [])

  if (isEmpty(items)) return null

  const [featuredItem, ...rowItems] = items

  return (
    <div className="card-glow rounded-12 flex flex-col gap-3 p-4 max-sm:gap-2 max-sm:p-3">
      <NewsSectionHeader title={title} href={viewAllHref} viewAllLabel={viewAllLabel} />

      {/* Desktop: 1 featured lớn + rows nhỏ */}
      <div className="hidden flex-col gap-2 divide-y divide-white/[0.06] lg:flex">
        <NewsItemFeatured
          item={featuredItem}
          categoryLabel={categoryLabel}
          href={routes.news.article(String(featuredItem.newsId))}
        />
        {rowItems.map((item) => (
          <NewsItemRow
            key={String(item.newsId)}
            item={item}
            categoryLabel={categoryLabel}
            href={routes.news.article(String(item.newsId))}
          />
        ))}
      </div>

      {/* Mobile: carousel responsive */}
      <div className="lg:hidden">
        <CarouselInfinity
          items={items}
          slideClassName="basis-full sm:basis-1/2 md:basis-1/3"
          gapClassName="gap-3"
          keyExtractor={(item) => String(item.newsId)}
          onApiReady={handleApiReady}
          renderItem={(item) => (
            <NewsItemFeatured
              item={item}
              categoryLabel={categoryLabel}
              href={routes.news.article(String(item.newsId))}
            />
          )}
        />
        {items.length > 1 && (
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {items.slice(0, 7).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-full transition-all duration-200",
                  i === activeIndex ? "bg-gold h-1.5 w-4" : "bg-gold/30 size-1.5"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

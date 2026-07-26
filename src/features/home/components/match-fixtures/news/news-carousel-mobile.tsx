"use client"

import { useCallback, useState } from "react"

import { cn } from "@/lib/utils"

import { useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"

import type { NewsItem } from "@/features/home/home.api"
import CarouselInfinity, {
  type CarouselInfinityApi,
} from "@/components/ui/carousel/carousel-infinity"

import { NewsCard } from "./news-card"

interface NewsCarouselMobileProps {
  items: NewsItem[]
  categoryLabel: string
}

export function NewsCarouselMobile({ items, categoryLabel }: NewsCarouselMobileProps) {
  const { locale } = useTranslation()
  const routes = getRoutes(locale)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleApiReady = useCallback((api: CarouselInfinityApi) => {
    api?.on("select", () => setActiveIndex(api.selectedScrollSnap()))
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <CarouselInfinity
        items={items}
        slideClassName="basis-full"
        gapClassName="gap-3"
        keyExtractor={(item) => String(item.newsId)}
        onApiReady={handleApiReady}
        renderItem={(item) => (
          <NewsCard
            item={item}
            categoryLabel={categoryLabel}
            href={routes.news.article(String(item.newsId))}
          />
        )}
      />
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
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
  )
}

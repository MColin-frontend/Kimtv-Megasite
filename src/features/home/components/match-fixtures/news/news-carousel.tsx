"use client"

import Link from "next/link"
import { ArrowRight, Heart, MessageCircle } from "lucide-react"

import type { LocaleType } from "@/i18n"
import { localePath, useTranslation } from "@/i18n"

import type { NewsItem } from "@/features/home/home.api"
import CarouselInfinity from "@/components/ui/carousel/carousel-infinity"
import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

import { NewsSectionHeader } from "./news-section-header"

interface NewsCarouselProps {
  featured: NewsItem[]
  latest: NewsItem[]
  locale: LocaleType
}

function NewsCarouselCard({ item, href }: { item: NewsItem; href: string }) {
  return (
    <Link
      href={href}
      className="group rounded-12 border-foreground/8 flex h-full flex-col overflow-hidden border bg-white transition-shadow hover:shadow-md"
    >
      <div className="overflow-hidden">
        <Img
          src={item.coverUrl}
          alt={item.title}
          width={280}
          height={150}
          rounded="0"
          className="h-[150px] w-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Typography variant="body" className="group-hover:text-blue line-clamp-2 transition-colors">
          {item.title}
        </Typography>
        <div className="mt-auto flex items-center gap-3">
          {item.userName && (
            <Typography variant="caption" className="truncate">
              {item.userName}
            </Typography>
          )}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {item.likeCount != null && (
              <span className="flex items-center gap-0.5">
                <Heart className="text-foreground/30 size-3.5" />
                <Typography variant="caption" color="foreground/40">
                  {item.likeCount}
                </Typography>
              </span>
            )}
            {item.commentCount != null && (
              <span className="flex items-center gap-0.5">
                <MessageCircle className="text-foreground/30 size-3.5" />
                <Typography variant="caption" color="foreground/40">
                  {item.commentCount}
                </Typography>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function NewsSection({
  title,
  viewAllHref,
  viewAllLabel,
  items,
  locale,
}: {
  title: string
  viewAllHref: string
  viewAllLabel: string
  items: NewsItem[]
  locale: LocaleType
}) {
  if (!items.length) return null
  return (
    <div className="flex flex-col gap-2">
      <NewsSectionHeader title={title} href={viewAllHref} viewAllLabel={viewAllLabel} />
      <CarouselInfinity
        items={items}
        renderItem={(item) => (
          <NewsCarouselCard item={item} href={localePath(locale, "tin-tuc", String(item.newsId))} />
        )}
        keyExtractor={(item) => String(item.newsId)}
        slideClassName="basis-[280px]"
        autoPlayDelay={5000}
        stopAutoPlayOnInteraction={false}
      />
    </div>
  )
}

export default function NewsMobileCarousel({ featured, latest, locale }: NewsCarouselProps) {
  const { t } = useTranslation()
  const newsIndexPath = localePath(locale, "tin-tuc")

  return (
    <div className="flex flex-col gap-6">
      <NewsSection
        title={t("news.title")}
        viewAllHref={newsIndexPath}
        viewAllLabel={t("news.view-all")}
        items={featured}
        locale={locale}
      />
      <NewsSection
        title={t("news.latest")}
        viewAllHref={newsIndexPath}
        viewAllLabel={t("news.view-all")}
        items={latest}
        locale={locale}
      />
    </div>
  )
}

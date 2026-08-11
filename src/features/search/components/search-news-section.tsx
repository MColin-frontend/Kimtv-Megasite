"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { useRouter } from "@/hooks/use-router"

import { useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"

import { NewsItemFeatured, NewsItemRow } from "@/features/news/components/item"
import { NewsItemFeaturedSkeleton, NewsItemRowSkeleton } from "@/features/news/components/skeleton"
import type { NewsItem } from "@/features/news/news.models"
import CarouselInfinity from "@/components/ui/carousel/carousel-infinity"
import { Empty } from "@/components/ui/empty"
import { ScheduleHeader } from "@/components/ui/match/parts/schedule-header"
import { Pagination } from "@/components/ui/pagination"

import imgSearchNews from "@assets/images/common/img-search-news.png"

import {
  SEARCH_NEWS_PAGE_SIZE,
  searchNewsInfiniteQueryOptions,
  searchNewsQueryOptions,
} from "../search.api"
import {
  SEARCH_FILTER_KEY,
  SEARCH_NEWS_PAGE_KEY,
  SEARCH_QUERY_KEY,
  SearchFilterEnum,
} from "../search.constants"

const NEWS_SLIDE_CLASS = "basis-1/4 max-lg:basis-1/3 max-md:basis-1/2 max-sm:basis-full min-w-0"
const NEWS_CAROUSEL_SHARED = {
  gapClassName: "gap-4 max-sm:gap-3",
  viewportClassName: "py-4 max-sm:py-2",
  className: "-my-4 max-sm:-my-2",
} as const

export function SearchNewsSection() {
  const { t, locale } = useTranslation()
  const { getParam, setParams } = useRouter()
  const query = getParam(SEARCH_QUERY_KEY) ?? ""
  const activeFilter = (getParam(SEARCH_FILTER_KEY) ?? SearchFilterEnum.ALL) as SearchFilterEnum
  const isAll = activeFilter === SearchFilterEnum.ALL
  const routes = getRoutes(locale)
  const page = Number(getParam(SEARCH_NEWS_PAGE_KEY) ?? 1)
  const categoryLabel = t("search.news.category")

  const { data, isLoading } = useQuery({
    ...searchNewsQueryOptions(query, page),
    enabled: activeFilter === SearchFilterEnum.NEWS,
    refetchOnMount: "always",
  })

  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    ...searchNewsInfiniteQueryOptions(query),
    enabled: isAll,
    refetchOnMount: "always",
  })

  const infiniteItems = infiniteData?.pages.flatMap((p) => p?.records ?? []) ?? []

  const items = data?.records ?? []
  const total = data?.total ?? 0
  const isEmpty = !isLoading && !items.length

  const featured = items[0]
  const sideItems = items.slice(1, 5)
  const gridItems = items.slice(5)

  function renderCarouselItem(item: NewsItem) {
    return (
      <NewsItemFeatured
        item={item}
        href={routes.news.article(String(item.newsId))}
        categoryLabel={categoryLabel}
        imageWrapperClassName="relative overflow-hidden rounded-12 w-full aspect-[16/9]"
        className="card-elevated rounded-12 mx-0 h-[320px] gap-2 p-2 max-sm:h-[280px]"
      />
    )
  }

  const pagination =
    total > SEARCH_NEWS_PAGE_SIZE ? (
      <Pagination
        className="max-sm:hidden"
        page={page}
        pageSize={SEARCH_NEWS_PAGE_SIZE}
        total={total}
        loading={isLoading}
        onPageChange={(p) => setParams({ [SEARCH_NEWS_PAGE_KEY]: p })}
      />
    ) : null

  return (
    <section className="card-glow rounded-12 flex min-w-0 flex-col gap-5 overflow-x-clip p-5 max-md:gap-4 max-md:p-4 max-sm:gap-3 max-sm:p-3">
      <ScheduleHeader
        image={imgSearchNews}
        title={t("search.news.title")}
        subtitle={t("search.news.subtitle")}
      />

      {isAll ? (
        isInfiniteLoading ? (
          <CarouselInfinity
            items={Array.from({ length: 8 })}
            renderItem={(_, i) => (
              <NewsItemFeaturedSkeleton
                key={i}
                className="card-elevated rounded-12 mx-0 h-[320px] p-2 max-sm:h-[280px]"
              />
            )}
            slideClassName={NEWS_SLIDE_CLASS}
            {...NEWS_CAROUSEL_SHARED}
          />
        ) : !infiniteItems.length ? (
          <Empty
            tip={t("search.news.empty")}
            imageSize={100}
            className="h-[300px] max-sm:h-[220px]"
          />
        ) : (
          <CarouselInfinity
            items={infiniteItems}
            renderItem={renderCarouselItem}
            slideClassName={NEWS_SLIDE_CLASS}
            keyExtractor={(item) => String(item.newsId)}
            onReachEnd={hasNextPage ? fetchNextPage : undefined}
            {...NEWS_CAROUSEL_SHARED}
          />
        )
      ) : isEmpty ? (
        <Empty
          tip={t("search.news.empty")}
          imageSize={100}
          className="h-[300px] max-sm:h-[220px]"
        />
      ) : (
        <div className="flex flex-col gap-8 max-md:gap-5 max-sm:gap-4">
          {/* Mobile — carousel */}
          <div className="sm:hidden">
            <CarouselInfinity<NewsItem | undefined>
              items={isLoading ? Array.from<NewsItem | undefined>({ length: 4 }) : items}
              renderItem={(item, i) =>
                !item ? (
                  <NewsItemFeaturedSkeleton
                    key={i}
                    className="card-elevated rounded-12 mx-0 h-[320px] p-2 max-sm:h-[280px]"
                  />
                ) : (
                  renderCarouselItem(item)
                )
              }
              slideClassName="basis-full"
              keyExtractor={(item, i) => (item ? String(item.newsId) : `sk-${i}`)}
              {...NEWS_CAROUSEL_SHARED}
            />
          </div>

          {/* Desktop — editorial grid */}
          <div className="hidden flex-col gap-8 max-md:gap-5 sm:flex">
            <div className="grid grid-cols-10 items-stretch gap-5 max-md:grid-cols-1 max-md:gap-3">
              <div className="col-span-6">
                {isLoading ? (
                  <NewsItemFeaturedSkeleton className="card-elevated rounded-12 h-full p-2" />
                ) : (
                  featured && (
                    <div className="card-elevated rounded-12 h-full p-2">
                      <NewsItemFeatured
                        item={featured}
                        href={routes.news.article(String(featured.newsId))}
                        categoryLabel={categoryLabel}
                        imageWrapperClassName="relative overflow-hidden rounded-12 w-full aspect-[16/9] mb-3"
                        className="h-full"
                        showSummary
                      />
                    </div>
                  )
                )}
              </div>
              <div className="col-span-4 flex flex-col gap-3 max-md:gap-2.5">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <NewsItemRowSkeleton
                        key={i}
                        className="card-elevated rounded-12 px-3 py-2.5"
                      />
                    ))
                  : sideItems.map((item) => (
                      <NewsItemRow
                        key={item.newsId}
                        item={item}
                        href={routes.news.article(String(item.newsId))}
                        categoryLabel={categoryLabel}
                        fillImage
                        className="card-elevated rounded-12 px-3 py-2.5"
                        imageWrapperClassName="relative h-[120px] w-[180px] shrink-0 overflow-hidden rounded-8"
                        metaAvatarSize={22}
                        metaTextSize="12"
                        headerTextSize="12"
                      />
                    ))}
              </div>
            </div>

            {(isLoading || gridItems.length > 0) && (
              <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2 max-md:gap-3">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <NewsItemFeaturedSkeleton
                        key={i}
                        className="card-elevated rounded-12 h-[340px] p-2"
                      />
                    ))
                  : gridItems.map((item) => (
                      <NewsItemFeatured
                        key={item.newsId}
                        item={item}
                        href={routes.news.article(String(item.newsId))}
                        categoryLabel={categoryLabel}
                        imageWrapperClassName="relative overflow-hidden rounded-8 w-full h-[200px] mb-2"
                        className="card-elevated rounded-12 h-[340px] p-2"
                      />
                    ))}
              </div>
            )}
          </div>

          {pagination}
        </div>
      )}
    </section>
  )
}

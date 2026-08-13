"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { useRouter } from "@/hooks/use-router"

import { useTranslation } from "@/i18n"

import type { UserInfoModel } from "@/features/user-info/user-info.models"
import CarouselInfinity from "@/components/ui/carousel/carousel-infinity"
import { Empty } from "@/components/ui/empty"
import { ScheduleHeader } from "@/components/ui/match/parts/schedule-header"
import { Pagination } from "@/components/ui/pagination"

import imgSearchUsers from "@assets/images/common/img-search-users.png"

import {
  SEARCH_PAGE_SIZE,
  searchUsersInfiniteQueryOptions,
  searchUsersQueryOptions,
} from "../search.api"
import {
  SEARCH_FILTER_KEY,
  SEARCH_QUERY_KEY,
  SEARCH_USERS_PAGE_KEY,
  SearchFilterEnum,
} from "../search.constants"
import { UserCard, UserCardSkeleton } from "./user-card"

export const SLIDE_CLASS = "basis-1/4 max-lg:basis-1/3 max-md:basis-full min-w-0"
export const GRID_CLASS =
  "grid w-full grid-cols-4 gap-3 max-lg:grid-cols-3 max-md:grid-cols-1 max-md:gap-2.5"

interface SearchPageResult<T> {
  records: T[]
  total: number
  pages?: number
  current?: number
  size?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQueryFn = (keyword: string, page?: number) => any

interface SearchPersonSectionProps<T> {
  filter: SearchFilterEnum
  pageKey: string
  infiniteQueryFn: AnyQueryFn
  pageQueryFn: AnyQueryFn
  image: Parameters<typeof ScheduleHeader>[0]["image"]
  titleKey: Parameters<ReturnType<typeof useTranslation>["t"]>[0]
  subtitleKey: Parameters<ReturnType<typeof useTranslation>["t"]>[0]
  emptyKey: Parameters<ReturnType<typeof useTranslation>["t"]>[0]
  renderCard: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
}

export function SearchPersonSection<T>({
  filter,
  pageKey,
  infiniteQueryFn,
  pageQueryFn,
  image,
  titleKey,
  subtitleKey,
  emptyKey,
  renderCard,
  keyExtractor,
}: SearchPersonSectionProps<T>) {
  const { t } = useTranslation()
  const { getParam, setParams } = useRouter()
  const keyword = getParam(SEARCH_QUERY_KEY) ?? ""
  const activeFilter = (getParam(SEARCH_FILTER_KEY) ?? SearchFilterEnum.ALL) as SearchFilterEnum
  const isAll = activeFilter === SearchFilterEnum.ALL
  const page = Number(getParam(pageKey) ?? 1)

  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    ...infiniteQueryFn(keyword),
    enabled: isAll,
    staleTime: 0,
    refetchOnMount: "always",
  })

  const { data: pageData, isLoading } = useQuery({
    ...pageQueryFn(keyword, page),
    enabled: activeFilter === filter,
    staleTime: 0,
    refetchOnMount: "always",
  })

  const infiniteItems: T[] =
    infiniteData?.pages.flatMap((p) => (p as SearchPageResult<T>)?.records ?? []) ?? []
  const pd = pageData as SearchPageResult<T> | null | undefined
  const gridItems: T[] = pd?.records ?? []
  const total: number = pd?.total ?? 0
  const isEmpty = !isLoading && !gridItems.length

  function handlePageChange(p: number) {
    setParams({ [pageKey]: p }, { scroll: false })
  }

  return (
    <section className="card-glow rounded-12 flex min-w-0 flex-col gap-5 overflow-x-clip p-5 max-md:gap-4 max-md:p-4 max-sm:gap-3 max-sm:p-3">
      <ScheduleHeader image={image} title={t(titleKey)} subtitle={t(subtitleKey)} />

      {isAll ? (
        isInfiniteLoading ? (
          <CarouselInfinity
            items={Array.from({ length: 8 })}
            renderItem={(_, i) => <UserCardSkeleton key={i} />}
            slideClassName={SLIDE_CLASS}
            gapClassName="gap-4 max-sm:gap-3"
          />
        ) : !infiniteItems.length ? (
          <Empty tip={t(emptyKey)} imageSize={100} className="h-[300px] max-sm:h-[220px]" />
        ) : (
          <CarouselInfinity
            items={infiniteItems}
            renderItem={renderCard}
            keyExtractor={keyExtractor}
            slideClassName={SLIDE_CLASS}
            gapClassName="gap-4 max-sm:gap-3"
            onReachEnd={hasNextPage ? fetchNextPage : undefined}
          />
        )
      ) : isLoading ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: 12 }).map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      ) : isEmpty ? (
        <Empty tip={t(emptyKey)} imageSize={100} className="h-[300px] max-sm:h-[220px]" />
      ) : (
        <div className="flex flex-col gap-8 max-md:gap-5 max-sm:gap-4">
          <div className={GRID_CLASS}>{gridItems.map(renderCard)}</div>
          {total > SEARCH_PAGE_SIZE && (
            <Pagination
              className="max-sm:hidden"
              page={page}
              pageSize={SEARCH_PAGE_SIZE}
              total={total}
              loading={isLoading}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </section>
  )
}

export function SearchUsersSection() {
  return (
    <SearchPersonSection<UserInfoModel>
      filter={SearchFilterEnum.USER}
      pageKey={SEARCH_USERS_PAGE_KEY}
      infiniteQueryFn={searchUsersInfiniteQueryOptions}
      pageQueryFn={searchUsersQueryOptions}
      image={imgSearchUsers}
      titleKey="search.users.title"
      subtitleKey="search.users.subtitle"
      emptyKey="search.users.empty"
      renderCard={(user, i) => <UserCard key={user.userId ?? user.uid ?? i} user={user} />}
      keyExtractor={(user, i) => (user.userId ?? user.uid ?? i).toString()}
    />
  )
}

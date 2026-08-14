"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { fetchAllAction, fetchSlideAction } from "@/server/actions/slide.action"

import CarouselInfinity from "./carousel-infinity"

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_SKELETON_COUNT = 5

interface CarouselInfinityApiProps<T> {
  endpoint: string
  method?: "GET" | "POST"
  params?: Record<string, unknown>
  pageSize?: number
  skeletonCount?: number
  /** Fetch toàn bộ mà không gửi params phân trang (vd: LIVE_SEARCH). */
  fetchAll?: boolean
  /** Cap số lượng items hiển thị — dùng khi API trả về toàn bộ data mà không hỗ trợ pagination. */
  limit?: number
  renderItem: (item: T, index: number, isLoading: boolean) => React.ReactNode
  renderEmpty?: () => React.ReactNode
  slideClassName?: string
  gapClassName?: string
  autoPlayDelay?: number
  keyExtractor?: (item: T, index: number) => string | number
  className?: string
}

const SKELETON_SENTINEL = Symbol("skeleton")

export default function CarouselInfinityApi<T>({
  endpoint,
  method = "POST",
  params,
  pageSize = DEFAULT_PAGE_SIZE,
  skeletonCount = DEFAULT_SKELETON_COUNT,
  fetchAll = false,
  limit,
  renderItem,
  renderEmpty,
  slideClassName,
  gapClassName,
  autoPlayDelay,
  keyExtractor,
  className,
}: CarouselInfinityApiProps<T>) {
  const [items, setItems] = useState<T[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const pageRef = useRef(1)
  const hasMoreRef = useRef(true)
  const loadingRef = useRef(false)

  const loadPage = useCallback(
    async (p: number) => {
      if (p === 1) {
        hasMoreRef.current = true
        loadingRef.current = false
      }
      if (loadingRef.current || !hasMoreRef.current) return
      loadingRef.current = true

      try {
        if (fetchAll) {
          const data = await fetchAllAction<T>(endpoint, method, params ?? {})
          setItems(limit ? data.slice(0, limit) : data)
          hasMoreRef.current = false
          pageRef.current = 1
        } else {
          const data = await fetchSlideAction<T>(endpoint, method, params ?? {}, p, pageSize)
          setItems((prev) => {
            const next = p === 1 ? data : [...prev, ...data]
            return limit ? next.slice(0, limit) : next
          })
          hasMoreRef.current =
            data.length === pageSize && (!limit || pageRef.current * pageSize < limit)
          pageRef.current = p
        }
      } finally {
        loadingRef.current = false
        setIsInitialLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint, method, pageSize, fetchAll]
  )

  useEffect(() => {
    loadPage(1)
  }, [loadPage])

  const handleReachEnd = useCallback(() => {
    if (fetchAll) return
    loadPage(pageRef.current + 1)
  }, [loadPage, fetchAll])

  const skeletonItems = Array.from(
    { length: skeletonCount },
    () => SKELETON_SENTINEL as unknown as T
  )

  const isEmpty = !isInitialLoading && items.length === 0

  if (isEmpty) return <>{renderEmpty?.()}</>

  return (
    <CarouselInfinity<T>
      items={isInitialLoading ? skeletonItems : items}
      renderItem={(item, index) => renderItem(item, index, isInitialLoading)}
      slideClassName={slideClassName}
      gapClassName={gapClassName}
      autoPlayDelay={autoPlayDelay}
      keyExtractor={isInitialLoading ? (_, i) => `skeleton-${i}` : keyExtractor}
      onReachEnd={fetchAll ? undefined : handleReachEnd}
      className={className}
    />
  )
}

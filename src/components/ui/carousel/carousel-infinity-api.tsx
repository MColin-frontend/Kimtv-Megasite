"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { fetchSlideAction } from "@/server/actions/slide.action"

import CarouselInfinity from "./carousel-infinity"

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_SKELETON_COUNT = 5

interface CarouselInfinityApiProps<T> {
  endpoint: string
  method?: "GET" | "POST"
  params?: Record<string, unknown>
  pageSize?: number
  skeletonCount?: number
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
        const data = await fetchSlideAction<T>(endpoint, method, params ?? {}, p, pageSize)
        setItems((prev) => (p === 1 ? data : [...prev, ...data]))
        hasMoreRef.current = data.length === pageSize
        pageRef.current = p
      } finally {
        loadingRef.current = false
        setIsInitialLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint, method, pageSize]
  )

  useEffect(() => {
    loadPage(1)
  }, [loadPage])

  const handleReachEnd = useCallback(() => {
    loadPage(pageRef.current + 1)
  }, [loadPage])

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
      onReachEnd={handleReachEnd}
      className={className}
    />
  )
}

"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"

import { SlideNavNext, SlideNavPrev } from "@/components/ui/slide-nav"

export type CarouselInfinityApi = UseEmblaCarouselType[1]

interface CarouselInfinityProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  /** CSS class cho mỗi slide — dùng để kiểm soát width. vd: "basis-1/2 md:basis-1/3" */
  slideClassName?: string
  /** Gap giữa các slide — vd: "gap-3". Mặc định không có gap */
  gapClassName?: string
  autoPlayDelay?: number
  stopAutoPlayOnMouseEnter?: boolean
  stopAutoPlayOnInteraction?: boolean
  keyExtractor?: (item: T, index: number) => string | number
  onApiReady?: (api: CarouselInfinityApi) => void
  /** Callback khi đang đi tới gần cuối danh sách — dùng cho infinite scroll */
  onReachEnd?: () => void
  reachEndThreshold?: number
  className?: string
  viewportClassName?: string
}

/**
 * CarouselInfinity — horizontal carousel tái sử dụng, dùng Embla Carousel.
 *
 * @example
 * <CarouselInfinity
 *   items={matches}
 *   renderItem={(m) => <MatchCard match={m} />}
 *   slideClassName="basis-1/5"
 *   onReachEnd={loadMore}
 * />
 */
export default function CarouselInfinity<T>({
  items,
  renderItem,
  slideClassName = "basis-44",
  gapClassName,
  autoPlayDelay,
  stopAutoPlayOnMouseEnter = true,
  stopAutoPlayOnInteraction = true,
  keyExtractor,
  onApiReady,
  onReachEnd,
  reachEndThreshold = 2,
  className,
  viewportClassName,
}: CarouselInfinityProps<T>) {
  const latestOnReachEndRef = useRef(onReachEnd)
  const lastReachedIndexRef = useRef<number | null>(null)
  const prevSelectedIndexRef = useRef<number | null>(null)

  useEffect(() => {
    latestOnReachEndRef.current = onReachEnd
  }, [onReachEnd])

  const carouselOptions = useMemo(
    () => ({
      align: "start" as const,
      loop: true,
      dragFree: false,
      slidesToScroll: 1 as const,
      duration: 20,
    }),
    []
  )

  const plugins = useMemo(
    () =>
      autoPlayDelay
        ? [
            Autoplay({
              delay: autoPlayDelay,
              stopOnInteraction: stopAutoPlayOnInteraction,
              stopOnMouseEnter: stopAutoPlayOnMouseEnter,
            }),
          ]
        : [],
    [autoPlayDelay, stopAutoPlayOnInteraction, stopAutoPlayOnMouseEnter]
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(carouselOptions, plugins)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const prevCanScrollPrevRef = useRef(false)
  const prevCanScrollNextRef = useRef(false)

  const updateScrollability = useCallback(() => {
    if (!emblaApi) return
    const prev = emblaApi.canScrollPrev()
    const next = emblaApi.canScrollNext()
    if (prev !== prevCanScrollPrevRef.current) {
      prevCanScrollPrevRef.current = prev
      setCanScrollPrev(prev)
    }
    if (next !== prevCanScrollNextRef.current) {
      prevCanScrollNextRef.current = next
      setCanScrollNext(next)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    updateScrollability()
    emblaApi.on("select", updateScrollability)
    emblaApi.on("reInit", updateScrollability)
    return () => {
      emblaApi.off("select", updateScrollability)
      emblaApi.off("reInit", updateScrollability)
    }
  }, [emblaApi, updateScrollability])

  useEffect(() => {
    if (emblaApi) onApiReady?.(emblaApi)
  }, [emblaApi, onApiReady])

  const maybeTriggerReachEnd = useCallback(() => {
    if (!emblaApi) return
    if (!latestOnReachEndRef.current) return

    const slideCount = emblaApi.slideNodes().length
    const slidesInView = emblaApi.slidesInView()
    const selectedIndex = emblaApi.selectedScrollSnap()
    const prevSelectedIndex = prevSelectedIndexRef.current
    const edgeIndexInView = slidesInView.length ? Math.max(...slidesInView) : selectedIndex
    const slidesLeft = slideCount - edgeIndexInView - 1
    const isForwardMove =
      prevSelectedIndex === null ||
      (selectedIndex > prevSelectedIndex &&
        !(prevSelectedIndex === 0 && selectedIndex === slideCount - 1)) ||
      (prevSelectedIndex === slideCount - 1 && selectedIndex === 0)

    prevSelectedIndexRef.current = selectedIndex

    if (slidesLeft > reachEndThreshold) return
    if (!isForwardMove) return
    if (lastReachedIndexRef.current === edgeIndexInView) return

    lastReachedIndexRef.current = edgeIndexInView
    latestOnReachEndRef.current?.()
  }, [emblaApi, reachEndThreshold])

  const maybeTriggerReachEndFromNextClick = useCallback(() => {
    if (!emblaApi || !latestOnReachEndRef.current) return

    const slideCount = emblaApi.slideNodes().length
    const slidesInView = emblaApi.slidesInView()
    const selectedIndex = emblaApi.selectedScrollSnap()
    const edgeIndexInView = slidesInView.length ? Math.max(...slidesInView) : selectedIndex
    const slidesLeft = slideCount - edgeIndexInView - 1

    if (slidesLeft > reachEndThreshold) return
    if (lastReachedIndexRef.current === edgeIndexInView) return

    lastReachedIndexRef.current = edgeIndexInView
    latestOnReachEndRef.current?.()
  }, [emblaApi, reachEndThreshold])

  useEffect(() => {
    if (!emblaApi || !latestOnReachEndRef.current) return

    prevSelectedIndexRef.current = emblaApi.selectedScrollSnap()
    emblaApi.on("select", maybeTriggerReachEnd)
    emblaApi.on("reInit", maybeTriggerReachEnd)

    return () => {
      emblaApi.off("select", maybeTriggerReachEnd)
      emblaApi.off("reInit", maybeTriggerReachEnd)
    }
  }, [emblaApi, maybeTriggerReachEnd])

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
    requestAnimationFrame(maybeTriggerReachEndFromNextClick)
  }, [emblaApi, maybeTriggerReachEndFromNextClick])

  return (
    <div className={`group/carousel relative w-full ${className ?? ""}`}>
      <div
        className={`overflow-hidden${viewportClassName ? ` ${viewportClassName}` : ""}`}
        ref={emblaRef}
      >
        <div
          className={`flex items-stretch will-change-transform${gapClassName ? ` ${gapClassName}` : ""}`}
        >
          {(Array.isArray(items) ? items : []).map((item, index) => (
            <div
              key={keyExtractor ? keyExtractor(item, index) : index}
              className={`shrink-0 ${slideClassName}`}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      <SlideNavPrev
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        variant="gold"
        className="absolute top-1/2 left-0 z-10 -translate-x-3 -translate-y-1/2 opacity-35 transition-[opacity,transform] duration-200 group-hover/carousel:-translate-x-4 group-hover/carousel:scale-110 group-hover/carousel:opacity-100"
      />

      <SlideNavNext
        onClick={scrollNext}
        disabled={!canScrollNext}
        variant="gold"
        className="absolute top-1/2 right-0 z-10 translate-x-3 -translate-y-1/2 opacity-35 transition-[opacity,transform] duration-200 group-hover/carousel:translate-x-4 group-hover/carousel:scale-110 group-hover/carousel:opacity-100"
      />
    </div>
  )
}

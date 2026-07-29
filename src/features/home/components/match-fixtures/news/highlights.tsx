"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"

import type { NewsItem } from "@/features/home/home.api"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import CarouselInfinity, {
  type CarouselInfinityApi,
} from "@/components/ui/carousel/carousel-infinity"
import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

interface HighlightsCarouselProps {
  items: NewsItem[]
}

function PlayIcon() {
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-black/50 ring-2 ring-white/30 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
      <svg viewBox="0 0 24 24" fill="white" className="size-5 translate-x-0.5">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  )
}

function HighlightSlide({ item, isActive }: { item: NewsItem; href: string; isActive: boolean }) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!isActive) {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.muted = true
      }
    }
  }, [isActive])

  return (
    <div className="group block">
      <div
        className="rounded-10 relative w-full overflow-hidden bg-black"
        style={{ aspectRatio: "16/14" }}
      >
        {playing && item.videoUrl ? (
          <div
            className="absolute inset-0"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={item.videoUrl}
              autoPlay
              controls
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <>
            <Img
              src={item.coverUrl}
              alt={item.title}
              fill
              objectFit="contain"
              wrapperClassName="absolute inset-0"
              className="transition-transform duration-300 group-hover:scale-105"
            />
            {/* Play button */}
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/15 transition-colors hover:bg-black/25"
            >
              <PlayIcon />
            </button>
          </>
        )}
        {/* Bottom text overlay — ẩn khi đang play */}
        {!playing && (
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pt-5 pb-3 backdrop-blur-[1px]">
            <Typography
              variant="body-sm"
              weight="600"
              className="line-clamp-2 text-white transition-colors group-hover:text-white/80"
            >
              {item.title}
            </Typography>
            {item.userName && (
              <div className="flex items-center gap-1.5">
                {item.userAvatar && (
                  <Avatar size={16}>
                    <AvatarImage src={item.userAvatar} alt={item.userName} />
                  </Avatar>
                )}
                <Typography variant="caption" className="text-muted truncate">
                  {item.userName}
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function HighlightsCarousel({ items }: HighlightsCarouselProps) {
  const { t, locale } = useTranslation()
  const routes = getRoutes(locale)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleApiReady = useCallback((emblaApi: CarouselInfinityApi) => {
    emblaApi?.on("select", () => setActiveIndex(emblaApi.selectedScrollSnap()))
  }, [])

  if (!items.length) return null

  return (
    <div className="card-glow rounded-12 flex flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Typography variant="h2">Highlights</Typography>
        <Link
          href={routes.video.index}
          className="group/btn text-13 font-500 text-muted flex items-center gap-1 overflow-hidden pr-1 transition-colors hover:text-white"
        >
          <span className="transition-all duration-200 group-hover/btn:italic">
            {t("news.view-all")}
          </span>
          <ArrowRight className="size-4 -translate-x-4 opacity-0 transition-all duration-200 group-hover/btn:translate-x-0 group-hover/btn:opacity-100" />
        </Link>
      </div>

      {/* Carousel */}
      <CarouselInfinity
        items={items}
        slideClassName="basis-full"
        autoPlayDelay={3000}
        onApiReady={handleApiReady}
        renderItem={(item, index) => (
          <HighlightSlide
            item={item}
            href={routes.video.article(String(item.newsId))}
            isActive={index === activeIndex}
          />
        )}
        keyExtractor={(item) => String(item.newsId)}
      />

      {/* Dots */}
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

"use client"

import { startTransition, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Heart, MessageCircle, Play } from "lucide-react"

import { getLoginUserIdFromUser } from "@/lib/auth-cookie"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "@/hooks/use-router"

import { useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"
import { CAROUSEL_ROUND_NAV_BUTTON_CLASS } from "@/constants/ui/ui-carousel.constants"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import CarouselInfinity, {
  type CarouselInfinityApi,
} from "@/components/ui/carousel/carousel-infinity"
import { Empty } from "@/components/ui/empty"
import { Img } from "@/components/ui/image"
import { Pagination } from "@/components/ui/pagination"
import { ScrollReveal, StaggerReveal } from "@/components/ui/scroll-reveal"
import { Typography } from "@/components/ui/typography"

import { useUserContent } from "../hooks/use-user-content"
import { tabToApiType, UserInfoTabEnum, type UserInfoTabType } from "../user-info.constants"
import type { UserContentItem } from "../user-info.models"
import { AllTabSkeleton, VideoSkeleton } from "./skeleton"

const HERO_GRADIENT =
  "linear-gradient(90deg, rgba(10,17,40,0.85) 0%, rgba(10,17,40,0.45) 50%, rgba(10,17,40,0.08) 100%)"
const GRID_GRADIENT =
  "linear-gradient(0deg, rgba(10,17,40,0.92) 0%, rgba(10,17,40,0.38) 55%, transparent 100%)"

function isVideo(item: UserContentItem) {
  return item.newsType === 3 || !!item.videoUrl
}

type RoutesType = ReturnType<typeof getRoutes>

function getItemHref(item: UserContentItem, routes: RoutesType) {
  const id = String(item.newsId)
  return isVideo(item) ? routes.video.article(id) : routes.news.article(id)
}

function CategoryBadge() {
  const { t } = useTranslation()
  return (
    <Typography variant="caption" weight="600" className="tracking-4 text-gold uppercase">
      {t("common.user-info.category")}
    </Typography>
  )
}

function NavBtn({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous" : "Next"}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      className={cn(
        CAROUSEL_ROUND_NAV_BUTTON_CLASS,
        "absolute top-1/2 z-20 -translate-y-1/2 opacity-35",
        "transition-[opacity,transform]",
        dir === "prev"
          ? "left-0 -translate-x-3 group-hover/hero:-translate-x-4 group-hover/hero:scale-110 group-hover/hero:opacity-100"
          : "right-0 translate-x-3 group-hover/hero:translate-x-4 group-hover/hero:scale-110 group-hover/hero:opacity-100"
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-none stroke-current stroke-2 max-sm:h-3.5 max-sm:w-3.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={dir === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        />
      </svg>
    </button>
  )
}

function HeroCard({
  item,
  href,
  onPrev,
  onNext,
  showNav,
}: {
  item: UserContentItem
  href: string
  onPrev: () => void
  onNext: () => void
  showNav: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="group/hero relative aspect-[992/560] w-full rounded-lg bg-[#0a1128] max-md:aspect-[4/3]">
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <Img
          src={item.coverUrl}
          alt={item.title ?? ""}
          fill
          objectFit="cover"
          wrapperClassName="size-full"
          sizes="(max-width: 768px) 100vw, 1440px"
        />
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ background: HERO_GRADIENT }} />
      <Link href={href} className="absolute inset-0 z-10 flex items-center">
        <div className="flex max-w-[860px] flex-col gap-4 p-10 max-md:p-5">
          <CategoryBadge />
          <Typography
            as="h2"
            weight="700"
            className="tracking-n1 text-48 max-lg:text-36 max-md:text-30 line-clamp-3 leading-125 text-white"
          >
            {item.title}
          </Typography>
          {item.summary && (
            <Typography
              variant="body-lg"
              weight="600"
              className="line-clamp-2 hidden text-white md:block"
            >
              {item.summary}
            </Typography>
          )}
          <Button variant="gradient" tabIndex={-1} className="w-fit">
            {t("common.user-info.read-more")}
          </Button>
        </div>
      </Link>
      {showNav && (
        <>
          <NavBtn dir="prev" onClick={onPrev} />
          <NavBtn dir="next" onClick={onNext} />
        </>
      )}
    </div>
  )
}

function GridCard({ item, onClick }: { item: UserContentItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-glow group rounded-10 hover:ring-gold/40 relative aspect-[284/200] overflow-hidden bg-[#0a1128] text-left transition-all hover:ring-1"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Img
          src={item.coverUrl}
          alt={item.title ?? ""}
          fill
          objectFit="cover"
          wrapperClassName="size-full"
          className="transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 360px"
        />
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ background: GRID_GRADIENT }} />
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-0.5 p-3 max-md:p-2.5">
        <CategoryBadge />
        <Typography
          variant="body-lg"
          weight="700"
          className="group-hover:text-gold line-clamp-2 text-white transition-colors"
        >
          {item.title}
        </Typography>
      </div>
    </button>
  )
}

function ArticleSection({
  items,
  routes,
  page,
  total,
  onPageChange,
}: {
  items: UserContentItem[]
  routes: RoutesType
  page: number
  total: number
  onPageChange: (p: number) => void
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const pool = items.slice(0, 5)
  const safeIdx = Math.min(activeIdx, pool.length - 1)
  const featured = pool[safeIdx]
  const gridItems = pool.filter((_, i) => i !== safeIdx)
  const compactItems = items.slice(5, 10)

  if (!featured) return null

  return (
    <div className="card-glow rounded-12 flex flex-col gap-4 p-4">
      <ScrollReveal variant="fade-up" duration={600} distance={20}>
        <HeroCard
          item={featured}
          href={getItemHref(featured, routes)}
          onPrev={() => setActiveIdx((i) => (i - 1 + pool.length) % pool.length)}
          onNext={() => setActiveIdx((i) => (i + 1) % pool.length)}
          showNav={pool.length > 1}
        />
      </ScrollReveal>
      {gridItems.length > 0 && (
        <StaggerReveal
          variant="scale"
          stagger={60}
          duration={400}
          className="grid grid-cols-4 gap-4 max-md:hidden"
        >
          {gridItems.map((item) => (
            <GridCard
              key={String(item.newsId)}
              item={item}
              onClick={() => setActiveIdx(pool.findIndex((p) => p.newsId === item.newsId))}
            />
          ))}
        </StaggerReveal>
      )}
      {compactItems.length > 0 && (
        <StaggerReveal
          variant="fade-up"
          stagger={50}
          duration={400}
          className="flex flex-col gap-3 max-sm:gap-2"
        >
          {compactItems.map((item) => (
            <CompactCard key={String(item.newsId)} item={item} href={getItemHref(item, routes)} />
          ))}
        </StaggerReveal>
      )}
      {total > 10 && (
        <Pagination page={page} pageSize={10} total={total} onPageChange={onPageChange} />
      )}
    </div>
  )
}

function CompactCard({ item, href }: { item: UserContentItem; href: string }) {
  const video = isVideo(item)
  return (
    <Link
      href={href}
      className="group flex gap-4 border-b border-white/6 pb-4 last:border-0 last:pb-0 max-sm:flex-col max-sm:gap-2 max-sm:pb-2"
    >
      <div className="rounded-8 relative aspect-video w-[320px] shrink-0 overflow-hidden bg-white/5 max-sm:w-full">
        <Img
          src={item.coverUrl}
          alt={item.title ?? ""}
          fill
          objectFit="cover"
          wrapperClassName="size-full"
          className="transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 320px"
        />
        {video && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="size-5 fill-white text-white" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        <Typography
          variant="body-lg"
          weight="600"
          className="line-clamp-2 text-white/85 transition-colors group-hover:text-white"
        >
          {item.title}
        </Typography>
        <div className="mt-auto flex items-center gap-3">
          {item.likeCount != null && item.likeCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Heart className="size-4 text-white/50" />
              <Typography variant="body-lg" className="text-white/60">
                {item.likeCount}
              </Typography>
            </span>
          )}
          {item.commentCount != null && item.commentCount > 0 && (
            <span className="flex items-center gap-1.5">
              <MessageCircle className="size-4 text-white/50" />
              <Typography variant="body-lg" className="text-white/60">
                {item.commentCount}
              </Typography>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function VideoSlide({
  item,
  href,
  isActive,
}: {
  item: UserContentItem
  href: string
  isActive: boolean
}) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!isActive) {
      startTransition(() => setPlaying(false))
      videoRef.current?.pause()
    }
  }, [isActive])

  return (
    <Link href={href} className="group block" onClick={(e) => playing && e.preventDefault()}>
      <div
        className="rounded-10 relative w-full overflow-hidden bg-black"
        style={{ aspectRatio: "16/20" }}
      >
        {playing && item.videoUrl ? (
          <div
            className="absolute inset-0"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
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
              alt={item.title ?? ""}
              fill
              objectFit="contain"
              wrapperClassName="absolute inset-0"
              className="transition-transform duration-300 group-hover:scale-105"
              sizes="100vw"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setPlaying(true)
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/15 transition-colors hover:bg-black/25"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-black/50 ring-2 ring-white/30 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
                <svg viewBox="0 0 24 24" fill="white" className="size-5 translate-x-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          </>
        )}
        {!playing && (
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pt-5 pb-3 backdrop-blur-[1px]">
            <Typography
              variant="body-lg"
              weight="600"
              className="line-clamp-2 text-white transition-colors group-hover:text-white/80"
            >
              {item.title}
            </Typography>
            {item.userName && (
              <div className="flex items-center gap-1.5">
                {item.userAvatar && (
                  <Avatar size={22}>
                    <AvatarImage src={item.userAvatar} alt={item.userName} />
                  </Avatar>
                )}
                <Typography variant="body-lg" className="text-muted truncate">
                  {item.userName}
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

function VideoPanel({ items, routes }: { items: UserContentItem[]; routes: RoutesType }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const { t } = useTranslation()
  const handleApiReady = useCallback((api: CarouselInfinityApi) => {
    api?.on("select", () => setActiveIndex(api.selectedScrollSnap()))
  }, [])

  if (!items.length) return null

  return (
    <div className="card-glow rounded-12 flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <Typography variant="h6" className="text-white/90">
          {t("common.user-info.video")}
        </Typography>
      </div>
      <CarouselInfinity
        items={items}
        slideClassName="basis-full"
        autoPlayDelay={4000}
        onApiReady={handleApiReady}
        renderItem={(item, index) => (
          <VideoSlide
            item={item}
            href={routes.video.article(String(item.newsId))}
            isActive={index === activeIndex}
          />
        )}
        keyExtractor={(item) => String(item.newsId)}
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

function VideoCard({ item, feedHref }: { item: UserContentItem; feedHref: string }) {
  return (
    <Link href={feedHref} className="group flex flex-col gap-2.5">
      <div className="rounded-10 relative aspect-[2/3] overflow-hidden bg-white/[0.06]">
        <Img
          src={item.coverUrl}
          alt={item.title ?? ""}
          fill
          objectFit="cover"
          wrapperClassName="size-full"
          className="transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 360px"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/45">
          <div className="scale-50 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
            <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-2xl ring-4 ring-white/20">
              <Play className="size-5 translate-x-0.5 fill-gray-900 text-gray-900" />
            </div>
          </div>
        </div>
      </div>
      <Typography
        variant="body-lg"
        weight="600"
        className="line-clamp-2 leading-138 text-white/75 transition-colors group-hover:text-white"
      >
        {item.title}
      </Typography>
    </Link>
  )
}

interface AllTabViewProps {
  items: UserContentItem[]
  videoItems: UserContentItem[]
  routes: RoutesType
  page: number
  total: number
  onPageChange: (p: number) => void
}

function AllTabView({ items, videoItems, routes, page, total, onPageChange }: AllTabViewProps) {
  const { t } = useTranslation()
  const videos = videoItems.slice(0, 10)
  const hasVideo = videos.length > 0
  if (items.length === 0 && !hasVideo)
    return <Empty tip={t("common.user-info.empty")} imageSize={180} className="py-16" />
  return (
    <div
      className={
        hasVideo
          ? "mt-8 grid grid-cols-10 gap-7 max-lg:grid-cols-1 max-md:mt-4 max-md:gap-4"
          : "mt-8 max-md:mt-4"
      }
    >
      {items.length > 0 && (
        <div className={hasVideo ? "col-span-7 max-lg:col-span-full" : undefined}>
          <ArticleSection
            items={items}
            routes={routes}
            page={page}
            total={total}
            onPageChange={onPageChange}
          />
        </div>
      )}
      {hasVideo && (
        <ScrollReveal
          variant="fade-left"
          duration={500}
          distance={20}
          className="col-span-3 max-lg:order-first max-lg:col-span-full lg:sticky lg:top-20 lg:self-start"
        >
          <VideoPanel items={videos} routes={routes} />
        </ScrollReveal>
      )}
    </div>
  )
}

export function ContentList() {
  const { id } = useParams<{ id: string }>()
  const { locale, t } = useTranslation()
  const { user } = useAuth()
  const { getParam, setParams } = useRouter()
  const loginUserId = getLoginUserIdFromUser(user) ?? ""
  const userId = id

  const rawTab = getParam("tab")
  const tab: UserInfoTabType =
    rawTab === UserInfoTabEnum.NEWS || rawTab === UserInfoTabEnum.VIDEO
      ? rawTab
      : UserInfoTabEnum.ALL

  const page = Math.max(1, parseInt(getParam("page") ?? "1") || 1)

  const apiType = tabToApiType(tab)
  const { data: content, isLoading } = useUserContent(userId, apiType, page, loginUserId)
  const { data: videoData } = useUserContent(userId, "video", 1, loginUserId)

  const total = content?.total ?? 0

  const goToPage = (p: number) =>
    setParams({ page: p === 1 ? null : p }, { replace: true, scroll: false })

  const items = content?.records ?? []
  const videoItems = videoData?.records ?? []
  const routes = getRoutes(locale)

  switch (tab) {
    case UserInfoTabEnum.VIDEO: {
      const videoPageSize = videoData?.records?.length || 12
      if (isLoading)
        return (
          <div className="mt-8 grid grid-cols-4 gap-4 max-md:mt-4 max-md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <VideoSkeleton key={i} />
            ))}
          </div>
        )
      if (items.length === 0)
        return <Empty tip={t("common.user-info.empty")} imageSize={180} className="py-16" />
      return (
        <div className="mt-8 flex flex-col gap-6 max-md:mt-4">
          <StaggerReveal
            variant="scale"
            stagger={40}
            duration={400}
            className="grid grid-cols-4 gap-4 max-md:grid-cols-2"
          >
            {items.map((item) => (
              <VideoCard
                key={String(item.newsId)}
                item={item}
                feedHref={`${routes.video.index}?vid=${item.newsId}`}
              />
            ))}
          </StaggerReveal>
          {total > videoPageSize && (
            <Pagination
              page={page}
              pageSize={videoPageSize}
              total={total}
              onPageChange={goToPage}
            />
          )}
        </div>
      )
    }

    case UserInfoTabEnum.NEWS:
      if (isLoading) return <AllTabSkeleton showVideo={false} />
      return (
        <AllTabView
          items={items}
          videoItems={[]}
          routes={routes}
          page={page}
          total={total}
          onPageChange={goToPage}
        />
      )

    case UserInfoTabEnum.ALL:
    default:
      if (isLoading) return <AllTabSkeleton />
      return (
        <AllTabView
          items={items}
          videoItems={videoItems}
          routes={routes}
          page={page}
          total={total}
          onPageChange={goToPage}
        />
      )
  }
}

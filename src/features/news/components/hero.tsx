"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"

import type { NewsItem } from "@/features/news/news.models"
import { buttonVariants } from "@/components/ui/button"
import { Img } from "@/components/ui/image"
import { SlideNavButtons } from "@/components/ui/slide-nav"
import { Typography } from "@/components/ui/typography"

export function NewsHeroCarousel({ items }: { items: NewsItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { t, locale } = useTranslation()
  const routes = getRoutes(locale)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (items.length <= 1) return
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length)
    }, 5000)
  }, [items.length])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTimer])

  if (!items.length) return null

  const activeItem = items[activeIndex]
  const otherItems = items.filter((_, i) => i !== activeIndex)

  const goPrev = () => {
    setActiveIndex((i) => (i - 1 + items.length) % items.length)
    startTimer()
  }

  const goNext = () => {
    setActiveIndex((i) => (i + 1) % items.length)
    startTimer()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#0a1128] md:aspect-[992/440]">
        <Img
          src={activeItem.coverUrl}
          alt={activeItem.title}
          fill
          priority
          objectFit="fill"
          sizes="(max-width: 768px) 100vw, 1440px"
          wrapperClassName="absolute inset-0"
          className="transition-opacity duration-500"
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg,rgba(10,17,40,.85) 0%,rgba(10,17,40,.45) 50%,rgba(10,17,40,.08) 100%)",
          }}
        />

        <Link
          href={routes.news.article(String(activeItem.newsId))}
          className="absolute inset-0 z-10 flex items-center"
        >
          <div className="flex max-w-[860px] flex-col gap-2 p-4 md:gap-4 md:p-10">
            <Typography variant="overline" className="text-gold max-sm:text-[10px]">
              {t("news.category")}
            </Typography>
            <Typography
              as="h1"
              variant="h1"
              className="max-sm:!text-18 line-clamp-3 text-white max-sm:leading-138"
            >
              {activeItem.title}
            </Typography>
            {activeItem.summary && (
              <Typography
                variant="body-sm"
                weight="600"
                className="line-clamp-2 hidden text-white md:block"
              >
                {activeItem.summary}
              </Typography>
            )}
            <span
              className={cn(
                buttonVariants({ variant: "gradient" }),
                "max-sm:text-12 pointer-events-none w-fit max-sm:h-7 max-sm:px-3"
              )}
            >
              {t("news.read-more")}
            </span>
          </div>
        </Link>

        {items.length > 1 && <SlideNavButtons onPrev={goPrev} onNext={goNext} variant="gold" />}
      </div>

      {otherItems.length > 0 && (
        <div
          className={cn(
            "grid gap-3",
            otherItems.length === 1 && "grid-cols-1",
            otherItems.length === 2 && "grid-cols-2",
            otherItems.length === 3 && "grid-cols-3",
            otherItems.length >= 4 && "grid-cols-2 md:grid-cols-4"
          )}
        >
          {otherItems.map((item) => {
            const origIndex = items.findIndex((x) => x.newsId === item.newsId)
            return (
              <button
                key={String(item.newsId)}
                type="button"
                onClick={() => {
                  setActiveIndex(origIndex)
                  startTimer()
                }}
                className="card-glow group rounded-10 hover:ring-gold/40 relative aspect-[284/160] overflow-hidden bg-[#0a1128] text-left transition-all hover:ring-1"
              >
                <Img
                  src={item.coverUrl}
                  alt={item.title}
                  fill
                  objectFit="fill"
                  sizes="(max-width: 768px) 50vw, 360px"
                  wrapperClassName="absolute inset-0"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(0deg,rgba(10,17,40,.92) 0%,rgba(10,17,40,.38) 55%,transparent 100%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-0.5 p-2.5 md:p-3">
                  <Typography variant="overline" className="text-gold max-sm:!text-10">
                    {t("news.category")}
                  </Typography>
                  <Typography
                    variant="body"
                    weight="700"
                    className="group-hover:text-gold max-sm:!text-12 line-clamp-2 text-white transition-colors max-sm:leading-150"
                  >
                    {item.title}
                  </Typography>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

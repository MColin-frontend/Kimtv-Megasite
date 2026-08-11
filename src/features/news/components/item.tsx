import Link from "next/link"

import { formatPublishTime } from "@/lib/date"
import { cn } from "@/lib/utils"

import type { NewsItem } from "@/features/news/news.models"
import { Img } from "@/components/ui/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import { NewsMetaRow } from "./shared"

interface NewsItemRowProps {
  item: NewsItem
  href: string
  categoryLabel: string
  className?: string
  imageWrapperClassName?: string
  imageObjectFit?: "cover" | "contain"
  fillImage?: boolean
  metaAvatarSize?: number
  metaTextSize?: "12" | "14"
  headerTextSize?: "12" | "14"
  showSummary?: boolean
}

export function NewsItemFeatured({
  item,
  href,
  categoryLabel,
  className,
  imageWrapperClassName,
  imageObjectFit = "cover",
  metaAvatarSize = 28,
  metaTextSize = "14",
  showSummary = false,
}: NewsItemRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-8 flex h-[320px] flex-col pb-2.5 transition-colors outline-none focus-visible:outline-none",
        className
      )}
    >
      <Img
        src={item.coverUrl}
        alt={item.title}
        fill
        rounded="8"
        sizes="(max-width: 1280px) 400px, 300px"
        wrapperClassName={
          imageWrapperClassName ?? "relative overflow-hidden rounded-8 w-full aspect-video mb-2"
        }
        objectFit={imageObjectFit}
        className="transition-transform duration-300 group-hover:scale-105"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Typography variant="overline" className="text-gold shrink-0">
              {categoryLabel}
            </Typography>
            {item.publishTime && (
              <>
                <span className="text-muted shrink-0">·</span>
                <Typography variant="caption" className="text-muted truncate">
                  {formatPublishTime(item.publishTime)}
                </Typography>
              </>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Typography
                    size="16"
                    weight="600"
                    className="group-hover:text-gold mt-1 line-clamp-2 text-left leading-150 text-white transition-colors outline-none focus-visible:outline-none"
                  >
                    {item.title}
                  </Typography>
                }
              />
              <TooltipContent className="max-w-xs">{item.title}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {showSummary && item.summary && (
            <Typography size="14" className="mt-1.5 line-clamp-2 leading-150 text-white/55">
              {item.summary}
            </Typography>
          )}
        </div>

        <NewsMetaRow
          item={item}
          className="mt-1 pt-1"
          avatarSize={metaAvatarSize}
          textSize={metaTextSize}
        />
      </div>
    </Link>
  )
}

export function NewsItemRow({
  item,
  href,
  categoryLabel,
  className,
  imageWrapperClassName,
  fillImage,
  metaAvatarSize,
  metaTextSize,
  headerTextSize = "12",
}: NewsItemRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-8 flex gap-3 py-2.5 transition-colors outline-none focus-visible:outline-none",
        className
      )}
    >
      {fillImage ? (
        <Img
          src={item.coverUrl}
          alt={item.title}
          fill
          rounded="8"
          sizes="168px"
          wrapperClassName={
            imageWrapperClassName ?? "relative h-full w-[168px] shrink-0 overflow-hidden rounded-8"
          }
          className="transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <Img
          src={item.coverUrl}
          alt={item.title}
          width={168}
          height={112}
          rounded="8"
          objectFit="cover"
          sizes="168px"
          wrapperClassName={imageWrapperClassName ?? "shrink-0 overflow-hidden rounded-8"}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <Typography
            size={headerTextSize}
            weight="600"
            className="text-gold tracking-4 shrink-0 leading-150 uppercase"
          >
            {categoryLabel}
          </Typography>
          {item.publishTime && (
            <>
              <span className="text-muted shrink-0">·</span>
              <Typography
                size={headerTextSize}
                className="text-muted tracking-1 truncate leading-150"
              >
                {formatPublishTime(item.publishTime)}
              </Typography>
            </>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Typography
                  size="14"
                  weight="600"
                  className="group-hover:text-gold max-sm:!text-12 mt-1 line-clamp-2 text-left leading-150 text-white transition-colors outline-none focus-visible:outline-none"
                >
                  {item.title}
                </Typography>
              }
            />
            <TooltipContent className="max-w-xs">{item.title}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <NewsMetaRow
          item={item}
          className="mt-auto pt-2"
          avatarSize={metaAvatarSize}
          textSize={metaTextSize}
        />
      </div>
    </Link>
  )
}

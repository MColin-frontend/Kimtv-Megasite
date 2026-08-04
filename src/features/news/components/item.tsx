import Link from "next/link"

import { formatPublishTime } from "@/lib/date"
import { cn } from "@/lib/utils"

import type { NewsItem } from "@/features/news/news.models"
import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

import { NewsMetaRow } from "./shared"

interface NewsItemRowProps {
  item: NewsItem
  href: string
  categoryLabel: string
  className?: string
}

export function NewsItemFeatured({ item, href, categoryLabel, className }: NewsItemRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-8 -mx-2 flex flex-col px-2 py-2 transition-all",
        "hover:bg-blue/[0.07] hover:ring-1 hover:ring-white/[0.06]",
        className
      )}
    >
      <Img
        src={item.coverUrl}
        alt={item.title}
        fill
        quality={65}
        rounded="8"
        objectFit="cover"
        sizes="(max-width: 1280px) 400px, 300px"
        wrapperClassName="relative overflow-hidden rounded-8 w-full aspect-video mb-2"
        className="transition-transform duration-300 group-hover:scale-105"
      />
      <div className="flex min-w-0 flex-1 flex-col">
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
        <Typography
          size="16"
          weight="600"
          className="group-hover:text-gold mt-1 line-clamp-2 leading-150 text-white transition-colors"
        >
          {item.title}
        </Typography>
        <NewsMetaRow item={item} className="mt-1 pt-1" />
      </div>
    </Link>
  )
}

export function NewsItemRow({ item, href, categoryLabel, className }: NewsItemRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-8 -mx-2 flex gap-3 px-2 py-2 transition-all",
        "hover:bg-blue/[0.07] hover:ring-1 hover:ring-white/[0.06]",
        className
      )}
    >
      <Img
        src={item.coverUrl}
        alt={item.title}
        width={168}
        height={112}
        quality={65}
        rounded="8"
        objectFit="cover"
        sizes="168px"
        wrapperClassName="shrink-0 overflow-hidden rounded-8"
        className="transition-transform duration-300 group-hover:scale-105"
      />
      <div className="flex min-w-0 flex-1 flex-col">
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
        <Typography
          size="14"
          weight="600"
          className="group-hover:text-gold max-sm:!text-12 mt-1 line-clamp-2 leading-150 text-white transition-colors"
        >
          {item.title}
        </Typography>
        <NewsMetaRow item={item} className="mt-auto pt-2" />
      </div>
    </Link>
  )
}

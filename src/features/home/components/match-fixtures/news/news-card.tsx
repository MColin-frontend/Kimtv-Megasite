import Link from "next/link"
import { Heart, MessageCircle } from "lucide-react"

import type { NewsItem } from "@/features/home/home.api"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Img } from "@/components/ui/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

export interface NewsCardProps {
  item: NewsItem
  categoryLabel: string
  href: string
}

export function NewsCard({ item, href, categoryLabel }: NewsCardProps) {
  return (
    <Link
      href={href}
      className="group hover:bg-blue/[0.05] -mx-2 flex cursor-pointer flex-col gap-2 rounded-lg border-b border-white/6 px-2 py-2.5 transition-colors last:border-0 lg:flex-row lg:gap-3"
    >
      <Img
        src={item.coverUrl}
        alt={item.title}
        fill
        objectFit="cover"
        rounded="8"
        sizes="(max-width: 1024px) 100vw, 160px"
        wrapperClassName="aspect-[16/9] w-full shrink-0 lg:aspect-auto lg:h-[110px] lg:w-[160px]"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography variant="overline">{categoryLabel}</Typography>
        <Tooltip>
          <TooltipTrigger>
            <Typography
              variant="body-sm"
              weight="600"
              className="group-hover:text-gold line-clamp-2 text-left transition-colors"
            >
              {item.title}
            </Typography>
          </TooltipTrigger>
          <TooltipContent>{item.title}</TooltipContent>
        </Tooltip>
        <div className="mt-auto flex items-center gap-3">
          {item.userName && (
            <div className="flex min-w-0 items-center gap-1.5">
              {item.userAvatar && (
                <Avatar size={24}>
                  <AvatarImage src={item.userAvatar} alt={item.userName} />
                </Avatar>
              )}
              <Typography variant="caption" weight="600" className="truncate">
                {item.userName}
              </Typography>
            </div>
          )}
          {item.likeCount != null && (
            <>
              <span className="bg-foreground/20 h-3 w-px shrink-0" />
              <span className="flex items-center gap-0.5">
                <Heart className="size-4" />
                <Typography variant="caption">{item.likeCount}</Typography>
              </span>
            </>
          )}
          {item.commentCount != null && (
            <>
              <span className="bg-foreground/20 h-3 w-px shrink-0" />
              <span className="flex items-center gap-0.5">
                <MessageCircle className="size-4" />
                <Typography variant="caption">{item.commentCount}</Typography>
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

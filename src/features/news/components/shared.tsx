import Link from "next/link"
import { ArrowRight, Heart, MessageCircle } from "lucide-react"

import type { NewsItem } from "@/features/news/news.models"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Typography } from "@/components/ui/typography"

interface NewsPanelHeaderProps {
  title: string
  viewAllHref: string
  viewAllLabel: string
}

/** Header dùng chung cho tất cả news panel: tiêu đề + link "Xem tất cả". */
export function NewsPanelHeader({ title, viewAllHref, viewAllLabel }: NewsPanelHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Typography
        variant="h2"
        weight="700"
        className="max-sm:!text-14 text-gradient-white uppercase"
      >
        {title}
      </Typography>
      <Link
        href={viewAllHref}
        className="group/btn hover:text-gold flex items-center gap-1 overflow-hidden pr-1 transition-colors"
      >
        <Typography
          as="span"
          variant="caption"
          weight="500"
          color="muted"
          className="group-hover/btn:text-gold transition-all duration-200 group-hover/btn:italic"
        >
          {viewAllLabel}
        </Typography>
        <ArrowRight className="size-4 -translate-x-4 opacity-0 transition-all duration-200 group-hover/btn:translate-x-0 group-hover/btn:opacity-100" />
      </Link>
    </div>
  )
}

interface NewsMetaRowProps {
  item: Pick<NewsItem, "userName" | "userAvatar" | "likeCount" | "commentCount">
  className?: string
}

/** Meta row dùng chung: avatar + tên tác giả + lượt thích + bình luận. */
export function NewsMetaRow({ item, className }: NewsMetaRowProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      {item.userName && (
        <div className="flex min-w-0 items-center gap-1.5">
          {item.userAvatar && (
            <Avatar size={24}>
              <AvatarImage src={item.userAvatar} alt={item.userName} />
            </Avatar>
          )}
          <Typography variant="caption" weight="500" className="truncate">
            {item.userName}
          </Typography>
        </div>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {item.likeCount != null && (
          <span className="flex items-center gap-1">
            <Heart className="size-3.5" aria-hidden="true" />
            <Typography variant="caption">{item.likeCount}</Typography>
          </span>
        )}
        {item.commentCount != null && (
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3.5" aria-hidden="true" />
            <Typography variant="caption">{item.commentCount}</Typography>
          </span>
        )}
      </div>
    </div>
  )
}

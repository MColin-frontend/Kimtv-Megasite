import Link from "next/link"
import { Heart } from "lucide-react"

import { formatTimestamp } from "@/lib/date"
import { cn } from "@/lib/utils"

import type { CommentRecordInterface } from "@/features/highlights/highlight.models"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Typography } from "@/components/ui/typography"

export interface CommentCardProps {
  item: CommentRecordInterface
  isReply?: boolean
  userInfoHref: string | null
  onNavigate: () => void
  likeBusy: boolean
  onLike: () => void
  isLoggedIn: boolean
  isOwn: boolean
  onReply?: () => void
  onDelete?: () => void
  replyLabel: string
  deleteLabel: string
}

export function CommentCard({
  item,
  isReply = false,
  userInfoHref,
  onNavigate,
  likeBusy,
  onLike,
  isLoggedIn,
  isOwn,
  onReply,
  onDelete,
  replyLabel,
  deleteLabel,
}: CommentCardProps) {
  const size = isReply ? 32 : 40

  const avatar = (
    <Avatar size={size}>
      <AvatarImage src={item.avatar} />
    </Avatar>
  )

  return (
    <div className="flex gap-3">
      {userInfoHref ? (
        <Link href={userInfoHref} className="shrink-0" onClick={onNavigate}>
          {avatar}
        </Link>
      ) : (
        avatar
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <Typography as="span" variant="body-sm" weight="600" className="text-gold">
            {item.userName || "User"}
          </Typography>
          {item.replyUserName && (
            <Typography as="span" variant="body-sm" weight="500" className="text-gold/60">
              @{item.replyUserName}
            </Typography>
          )}
          <Typography as="span" variant="body-sm" className="text-white/35">
            {formatTimestamp(item.publishTime)}
          </Typography>
        </div>

        <Typography variant="body" className="mt-1 break-words text-white/85">
          {item.content}
        </Typography>

        <div className="mt-2 flex items-center gap-4">
          <button
            disabled={likeBusy}
            onClick={onLike}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              item.isLike ? "text-gold" : "text-white/35 hover:text-white/60"
            )}
          >
            <Heart size={15} className={cn("transition-all", item.isLike && "fill-gold")} />
            <Typography as="span" variant="body-sm">
              {Number(item.likeCount) || 0}
            </Typography>
          </button>

          {isLoggedIn && (
            <button
              onClick={onReply}
              className="text-white/35 transition-colors hover:text-white/60"
            >
              <Typography as="span" variant="body-sm">
                {replyLabel}
              </Typography>
            </button>
          )}

          {isOwn && (
            <button
              onClick={onDelete}
              className="text-white/25 transition-colors hover:text-red-400"
            >
              <Typography as="span" variant="body-sm">
                {deleteLabel}
              </Typography>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

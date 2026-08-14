import Link from "next/link"
import { MoreHorizontal } from "lucide-react"

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
  deleteLabel?: string
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
        <div className="flex items-center gap-x-1.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <Typography as="span" variant="body-sm" weight="600" className="text-gold">
              {item.userName || "User"}
            </Typography>
            {item.replyUserName && (
              <Typography as="span" variant="body-sm" weight="500" className="text-gold/60">
                @{item.replyUserName}
              </Typography>
            )}
            <Typography as="span" variant="body-sm" className="text-white/70">
              {formatTimestamp(item.publishTime)}
            </Typography>
          </div>
          <button
            onClick={isOwn ? onDelete : undefined}
            className="shrink-0 text-white/25 transition-colors hover:text-white/60"
            aria-label="More options"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>

        <Typography variant="body" className="mt-1 break-words text-white/85">
          {item.content}
        </Typography>

        <div className="mt-1 flex items-center gap-4">
          <button
            disabled={likeBusy}
            onClick={onLike}
            className={cn(
              "flex items-center gap-1 transition-colors",
              item.isLike ? "text-rose-400" : "text-white/35 hover:text-white/60"
            )}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              className={cn(
                "shrink-0 transition-all",
                item.isLike ? "fill-rose-400" : "fill-none stroke-current"
              )}
              strokeWidth={item.isLike ? 0 : 1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
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
        </div>
      </div>
    </div>
  )
}

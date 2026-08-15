"use client"

import { formatMatchTime } from "@/lib/date"
import { cn } from "@/lib/utils"

import type { useTranslation } from "@/i18n"
import { CHAT_CLASSES, CHAT_MESSAGE_TYPE, CHAT_MSG_PADDING } from "@/constants/ui/ui-chat.constants"

import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

import imgCrown from "@assets/images/chat/img-crown.webp"

import type { ChatMessage } from "../types"
import { ChatAvatar } from "./chat-avatar"
import { RoleBadge } from "./role-badge"
import { WelcomeMessageItem } from "./welcome-message-item"

type TFunc = (key: Parameters<ReturnType<typeof useTranslation>["t"]>[0]) => string

export function MessageItem({
  message,
  onDoubleClick,
  t,
}: {
  message: ChatMessage
  onDoubleClick: (msg: ChatMessage) => void
  t: TFunc
}) {
  if (message.type === CHAT_MESSAGE_TYPE.GIFT) {
    return (
      <div
        onDoubleClick={() => onDoubleClick(message)}
        className={cn(
          "text-14 bg-chat-gift/5 flex items-center gap-1 py-2.5 text-white max-sm:!px-2",
          CHAT_MSG_PADDING
        )}
      >
        {message?.vip99Icon && (
          <Img
            src={message?.vip99Icon || ""}
            alt="vip99 icon"
            width={32}
            height={32}
            unoptimized
            objectFit="contain"
            className="h-auto max-sm:!size-5"
          />
        )}
        <span dangerouslySetInnerHTML={{ __html: message.content }} />
      </div>
    )
  }

  if (message.type === CHAT_MESSAGE_TYPE.WELCOME) {
    return <WelcomeMessageItem message={message} onDoubleClick={onDoubleClick} t={t} />
  }

  return (
    <div
      onDoubleClick={() => onDoubleClick(message)}
      className={cn(
        "flex gap-2 py-1.5 max-sm:gap-1.5 max-sm:!px-2 max-sm:py-0.5",
        CHAT_MSG_PADDING
      )}
    >
      <div className="relative shrink-0">
        {message.hasAnchorMe && (
          <div className="border-gold-hover absolute -top-2 -right-1 z-10 flex size-6 items-center justify-center rounded-full border-[0.5px] bg-black/70 p-[2px] max-sm:-top-1 max-sm:-right-0.5 max-sm:size-4 max-sm:p-px">
            <Img
              src={imgCrown}
              alt="crown"
              width={14}
              height={14}
              objectFit="contain"
              className="max-sm:!size-2.5"
            />
          </div>
        )}
        <ChatAvatar message={message} size={48} className="max-sm:!h-8 max-sm:!w-8" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <Typography
              as="span"
              variant="body-sm"
              weight="600"
              className={cn("max-sm:!text-10 cursor-pointer truncate", CHAT_CLASSES.username)}
            >
              {message.userName}
            </Typography>
            <RoleBadge message={message} t={t} />
            {message?.vip99Icon && (
              <Img
                src={message?.vip99Icon || ""}
                alt="vip99 icon"
                width={32}
                height={32}
                unoptimized
                objectFit="contain"
                className="h-auto max-sm:!size-4"
              />
            )}
          </div>
          {formatMatchTime(message?.sendTime ?? 0) && (
            <Typography
              variant="overline"
              className="text-muted max-sm:text-10 shrink-0 tabular-nums"
            >
              {formatMatchTime(message?.sendTime ?? 0)}
            </Typography>
          )}
        </div>
        <Typography
          variant="body-sm"
          className={cn(
            "max-sm:text-12 break-words text-white",
            `[&_a]:${CHAT_CLASSES.link} [&_a]:cursor-pointer [&_a]:break-all [&_a]:underline [&_a]:underline-offset-2`
          )}
          onClick={(e) => {
            // Ngăn click vào link lan lên onDoubleClick của message
            const target = e.target as HTMLElement
            if (target.closest("a")) e.stopPropagation()
          }}
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
      </div>
    </div>
  )
}

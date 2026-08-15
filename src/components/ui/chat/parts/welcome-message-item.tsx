"use client"

import { formatMatchTime } from "@/lib/date"
import { cn } from "@/lib/utils"

import type { useTranslation } from "@/i18n"
import { CHAT_CLASSES, CHAT_MSG_PADDING } from "@/constants/ui/ui-chat.constants"

import { Img } from "@/components/ui/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import imgCrown from "@assets/images/chat/img-crown.webp"

import type { ChatMessage } from "../types"
import { ChatAvatar } from "./chat-avatar"
import { RoleBadge } from "./role-badge"

type TFunc = (key: Parameters<ReturnType<typeof useTranslation>["t"]>[0]) => string

export function WelcomeMessageItem({
  message,
  onDoubleClick,
  t,
}: {
  message: ChatMessage
  onDoubleClick: (msg: ChatMessage) => void
  t: TFunc
}) {
  return (
    <div
      onDoubleClick={() => onDoubleClick(message)}
      className={cn(
        "flex flex-col gap-2 py-1.5 max-sm:gap-0.5 max-sm:!px-2 max-sm:py-0.5",
        CHAT_MSG_PADDING,
        (message.isSVip || message.isVip) && "bg-gold/5"
      )}
    >
      <div className="flex items-center gap-2 max-sm:gap-1.5">
        <div className="relative shrink-0">
          {message.hasAnchorMe && (
            <div className="border-gold-hover absolute -top-2 -right-1 z-11 flex size-6 items-center justify-center rounded-full border-[0.5px] bg-black/70 p-[2px] max-sm:-top-1 max-sm:-right-0.5 max-sm:size-4 max-sm:p-px">
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
        <div className="flex w-full min-w-0 flex-col flex-wrap gap-1 max-sm:gap-0.5">
          <div className="flex items-center justify-between gap-1">
            <div className="flex w-full items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <Typography
                    as="span"
                    variant="body-sm"
                    weight="600"
                    className={cn(
                      "max-sm:text-10 block max-w-48 cursor-pointer truncate",
                      CHAT_CLASSES.username
                    )}
                  >
                    {message.userName}
                  </Typography>
                </TooltipTrigger>
                <TooltipContent>{message.userName}</TooltipContent>
              </Tooltip>
              <RoleBadge message={message} t={t} />

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
            </div>
            {message.sendTime && (
              <Typography
                variant="overline"
                className="text-muted max-sm:text-10 ml-auto shrink-0 tabular-nums"
              >
                {formatMatchTime(message.sendTime)}
              </Typography>
            )}
          </div>
          <Typography as="span" variant="body-sm" className="text-muted max-sm:text-10">
            {t("chat.welcome")}
          </Typography>
        </div>
      </div>
    </div>
  )
}

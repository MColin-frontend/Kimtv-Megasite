"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { CHAT_CLASSES } from "@/constants/ui/ui-chat.constants"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"
import type { ChatMessage } from "../types"

export function PinItemRow({
  msg,
  isExpanded,
  canUnpin,
  onToggle,
  onUnpin,
  pinLabel,
  tooltipUnpin,
  tooltipCollapse,
  tooltipExpand,
  parseLinks,
}: {
  msg: ChatMessage
  isExpanded: boolean
  canUnpin: boolean
  onToggle: () => void
  onUnpin: () => void
  pinLabel: string
  tooltipUnpin: string
  tooltipCollapse: string
  tooltipExpand: string
  parseLinks: (text: string) => string
}) {
  return (
    <div
      className={cn(
        "rounded-4 relative flex flex-col gap-1 border-l-[3px] bg-[#241c00] py-1.5 pr-2 pl-2 text-[12px] text-white select-none",
        "border-chat-pin"
      )}
    >
      {/* Unpin button — chỉ hiện khi current user có quyền unpin */}
      {canUnpin && (
        <Tooltip>
          <TooltipTrigger>
            <span
              className="absolute -top-1.5 -right-1.5 z-30 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-red-500/90 text-white shadow-[0_0_6px_rgba(239,68,68,0.5)] transition-colors hover:bg-red-400"
              onClick={(e) => {
                e.stopPropagation()
                onUnpin()
              }}
            >
              <X className="size-2.5" strokeWidth={3} />
            </span>
          </TooltipTrigger>
          <TooltipContent>{tooltipUnpin}</TooltipContent>
        </Tooltip>
      )}

      {/* Content — collapsed = 1 dòng, expanded = wrap đầy đủ */}
      <div className="flex cursor-pointer items-start gap-1" onClick={onToggle}>
        <span
          className={cn(
            "min-w-0 flex-1 leading-relaxed break-words",
            !isExpanded && "overflow-hidden text-ellipsis whitespace-nowrap"
          )}
        >
          <Typography as="span" size="12" className="mr-1 leading-none">
            📌
          </Typography>
          <Typography
            as="span"
            size="12"
            weight="700"
            className={cn("mr-1.5 leading-none", CHAT_CLASSES.pin)}
          >
            {pinLabel}:
          </Typography>
          <span
            className="[&_a]:text-chat-link [&_a]:break-all [&_a]:underline [&_a]:underline-offset-2"
            dangerouslySetInnerHTML={{ __html: parseLinks(msg.content) }}
          />
        </span>
        <span
          className={cn(
            "mt-0.5 shrink-0 leading-none transition-transform duration-200",
            CHAT_CLASSES.pin
          )}
        >
          {isExpanded ? "▲" : "▼"}
        </span>
      </div>
    </div>
  )
}

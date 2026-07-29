"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import type { ChatMessage } from "../types"

export function ChatAvatar({ message, size = 48 }: { message: ChatMessage; size?: number }) {
  const wrapperCls = message.hasAnchorMe
    ? "bg-gradient-to-br from-[#ffd75a] to-[#f6c343] shadow-[0_0_8px_2px_rgba(246,195,67,0.45)]"
    : message.hasFictitious
      ? ""
      : "bg-white"

  return (
    <div
      className={cn("shrink-0 rounded-full p-px", wrapperCls)}
      style={{ width: size + 2, height: size + 2 }}
    >
      <Avatar size={size}>
        <AvatarImage src={message.userAvatar} />
      </Avatar>
    </div>
  )
}

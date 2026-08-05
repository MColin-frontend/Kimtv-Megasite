"use client"

import dynamic from "next/dynamic"

import { cn } from "@/lib/utils"

import { siteConfig } from "@/config/site"
import { CHAT_SOCIAL_NAMES } from "@/constants/ui/ui-chat.constants"

import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

import imgChat from "@assets/images/common/img-chat.png"
import imgFacebook from "@assets/images/layout/img-facebook.png"
import imgTele from "@assets/images/layout/img-tele.png"
import imgZalo from "@assets/images/layout/img-zalo.png"

import type { ChatMessage, ChatProps, ChatSocials, ConnectionStatus, UserRole } from "./types"

export type { ChatMessage, ChatSocials, ChatProps, UserRole, ConnectionStatus }
export type { ChatMessageType } from "./types"

const DEFAULT_SOCIALS = siteConfig.socials

// ChatBody contains all WebSocket/auth logic — kept client-only to avoid hydration mismatches
const ChatBody = dynamic(() => import("./chat-body").then((m) => m.ChatBody), { ssr: false })

export function Chat({ socials, className, ...bodyProps }: ChatProps) {
  const mergedSocials = { ...DEFAULT_SOCIALS, ...socials }

  return (
    <div
      className={cn(
        "card-glow rounded-12 relative flex h-full min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden p-4 backdrop-blur-2xl max-sm:gap-2 max-sm:p-2",
        className
      )}
    >
      {/* Social links */}
      <div className="flex shrink-0 items-center gap-1.5 max-sm:gap-1">
        {mergedSocials.telegram && (
          <a
            href={mergedSocials.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#2aabee] py-1.5 no-underline shadow-[0_2px_8px_rgba(42,171,238,0.3)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(42,171,238,0.45)] hover:brightness-110 active:scale-95 max-sm:gap-1 max-sm:px-2 max-sm:py-1"
          >
            <Img
              src={imgTele.src}
              alt=""
              width={14}
              height={14}
              className="size-3.5 shrink-0 object-contain max-sm:size-3"
            />
            <Typography
              as="span"
              variant="caption"
              weight="600"
              className="max-sm:text-10 leading-none text-white"
            >
              {CHAT_SOCIAL_NAMES.TELEGRAM}
            </Typography>
          </a>
        )}
        {mergedSocials.facebook && (
          <a
            href={mergedSocials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#1462d8] py-1.5 no-underline shadow-[0_2px_8px_rgba(24,119,242,0.3)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(24,119,242,0.45)] hover:brightness-110 active:scale-95 max-sm:gap-1 max-sm:px-2 max-sm:py-1"
          >
            <Img
              src={imgFacebook.src}
              alt=""
              width={14}
              height={14}
              className="size-3.5 shrink-0 object-contain max-sm:size-3"
            />
            <Typography
              as="span"
              variant="caption"
              weight="600"
              className="max-sm:text-10 leading-none text-white"
            >
              {CHAT_SOCIAL_NAMES.FACEBOOK}
            </Typography>
          </a>
        )}
        {mergedSocials.zalo && (
          <a
            href={mergedSocials.zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#0068ff] py-1.5 no-underline shadow-[0_2px_8px_rgba(0,104,255,0.3)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,104,255,0.45)] hover:brightness-110 active:scale-95 max-sm:gap-1 max-sm:px-2 max-sm:py-1"
          >
            <Img
              src={imgZalo.src}
              alt=""
              width={14}
              height={14}
              className="size-3.5 shrink-0 object-contain max-sm:size-3"
            />
            <Typography
              as="span"
              variant="caption"
              weight="600"
              className="max-sm:text-10 leading-none text-white"
            >
              {CHAT_SOCIAL_NAMES.ZALO}
            </Typography>
          </a>
        )}
      </div>

      {/* Messages panel — header is SSR'd so browser can paint the LCP element early */}
      <div className="rounded-6 relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white/[0.03] backdrop-blur-xl">
        {/* LCP element: server-rendered, painted with the initial HTML stream */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-3 pt-2.5 pb-1.5 max-sm:px-2 max-sm:py-1.5">
          <div className="flex items-center gap-2 max-sm:gap-1.5">
            <div className="border-gold/30 rounded-full border p-1 max-sm:p-0.5">
              <div className="border-gold/60 bg-gold rounded-full border p-1 max-sm:p-0.5">
                <Img
                  src={imgChat}
                  alt="chat"
                  objectFit="contain"
                  className="size-4 max-sm:size-3"
                />
              </div>
            </div>
            <Typography
              as="span"
              variant="h4"
              weight="800"
              className="max-sm:text-14 tracking-widest uppercase italic"
            >
              <span className="text-gold drop-shadow-gold">Live</span>
              <span className="text-white"> Chat</span>
            </Typography>
          </div>
          {/* Live badge */}
          <div className="bg-live-green-bg border-live-green/30 shadow-live-green-sm flex items-center gap-1.5 rounded-full border px-2.5 py-1 max-sm:gap-1 max-sm:px-2 max-sm:py-0.5">
            <span className="relative flex size-2 shrink-0">
              <span className="bg-live-green absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-live-green relative inline-flex size-2 rounded-full" />
            </span>
            <Typography
              as="span"
              size="10"
              weight="600"
              className="text-live-green leading-none tabular-nums"
            >
              LIVE
            </Typography>
          </div>
        </div>

        {/* Dynamic body — WebSocket, messages, input (client-only) */}
        <ChatBody {...bodyProps} />
      </div>
    </div>
  )
}

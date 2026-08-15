"use client"

import { useRouter } from "@/hooks/use-router"

import { POLL_HIDDEN, POLL_PARAM_KEY, POLL_VISIBLE } from "@/constants/ui/ui-chat.constants"

import { Button } from "@/components/ui/button"
import { Img } from "@/components/ui/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import imgPollFloat from "@assets/images/common/img-poll-float.webp"

export function PollFloatButton() {
  const { getParam, setParams } = useRouter()

  if (getParam(POLL_PARAM_KEY) !== POLL_HIDDEN) return null

  function handleRestore() {
    setParams({ [POLL_PARAM_KEY]: POLL_VISIBLE }, { replace: true, scroll: false })
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          onClick={handleRestore}
          aria-label="Xem bình chọn"
          className="animate-poll-btn-enter fixed top-1/2 right-5 z-50 size-14 -translate-y-1/2 rounded-full border-none bg-transparent p-0 shadow-none hover:scale-110 hover:bg-transparent active:scale-95 max-sm:right-2 max-sm:size-10"
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(246,195,67,0.5) 0%, rgba(246,195,67,0) 70%)",
              animation: "poll-glow-ring 1.6s ease-out infinite",
            }}
          />
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,215,90,0.4) 0%, rgba(246,195,67,0) 70%)",
              animation: "poll-glow-ring 1.6s ease-out infinite 0.5s",
            }}
          />
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(246,195,67,0.3) 0%, rgba(246,195,67,0) 70%)",
              animation: "poll-glow-ring 1.6s ease-out infinite 1s",
            }}
          />
          <Img
            src={imgPollFloat}
            alt="poll"
            objectFit="contain"
            className="animate-poll-breathe relative z-10 size-14 max-sm:size-10"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">Xem bình chọn</TooltipContent>
    </Tooltip>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Check, Users, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { getPollHistoryApi } from "@/features/live/api/poll.api"
import { POLL_TYPE_BADGE_CONFIG } from "@/features/live/poll.constants"
import type { PollInterface } from "@/features/live/poll.models"
import { Empty } from "@/components/ui/empty"
import { Img } from "@/components/ui/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import icPoll from "@assets/icons/common/ic-poll.svg"

/* ── Option ──────────────────────────────────────────────── */

function HistoryOption({
  opt,
  poll,
}: {
  opt: PollInterface["options"][number]
  poll: PollInterface
}) {
  const voted = (poll.userVotedOptionKeys ?? []).includes(opt.optionKey)
  const correct = (poll.correctOptionKeys ?? []).includes(opt.optionKey)
  const highlight = voted || correct
  const pct = Math.round(opt.percent)

  return (
    <div
      className={cn(
        "rounded-8 overflow-hidden transition-all duration-150",
        highlight
          ? "border-gold/35 bg-gold/[0.09] border shadow-[0_6px_24px_rgba(0,0,0,0.55),0_3px_20px_rgba(246,195,67,0.25),inset_0_1px_0_rgba(255,255,255,0.13)]"
          : "border border-white/8 bg-white/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]"
      )}
    >
      <div className="flex items-center gap-2.5 px-3 py-2">
        {/* Radio — read-only */}
        <div
          className={cn(
            "relative size-4 shrink-0 rounded-full border-2 transition-all",
            highlight ? "border-gold" : "border-white/30"
          )}
        >
          {highlight && (
            <div className="bg-gold absolute inset-0 m-auto size-1.5 rounded-full shadow-[0_0_4px_rgba(246,195,67,0.8)]" />
          )}
        </div>

        {/* Group: key badge + content */}
        <div
          className={cn(
            "rounded-6 flex min-w-0 flex-1 overflow-hidden transition-all",
            highlight
              ? "shadow-[0_3px_16px_rgba(246,195,67,0.22),inset_0_1px_0_rgba(255,255,255,0.12)]"
              : "shadow-[0_2px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]"
          )}
        >
          {/* Key badge — parallelogram */}
          <div
            className="relative flex w-10 shrink-0 items-center justify-center self-stretch transition-all"
            style={{
              background: highlight
                ? "linear-gradient(160deg, #ffd75a 0%, #f6c343 45%, #c8872a 100%)"
                : "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
              clipPath: "polygon(0 0, 100% 0, 78% 100%, 0 100%)",
              boxShadow: highlight
                ? "inset 0 1px 0 rgba(255,255,255,0.35), 2px 0 8px rgba(246,195,67,0.25)"
                : "inset 0 1px 0 rgba(255,255,255,0.08), 2px 0 6px rgba(0,0,0,0.3)",
            }}
          >
            <Typography
              as="span"
              size="14"
              weight="800"
              className={cn(
                "leading-none select-none",
                highlight ? "text-black/70" : "text-white/60"
              )}
            >
              {opt.optionKey}
            </Typography>
          </div>

          {/* Content: label + stats + progress */}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <Tooltip>
                <TooltipTrigger className="w-fit cursor-default text-left">
                  <Typography
                    as="span"
                    variant="body-sm"
                    weight={highlight ? "600" : "400"}
                    className={cn(
                      "block w-fit truncate leading-none transition-colors",
                      highlight ? "text-white" : "text-white/70"
                    )}
                  >
                    {opt.label}
                  </Typography>
                </TooltipTrigger>
                <TooltipContent>{opt.label}</TooltipContent>
              </Tooltip>

              <div className="flex shrink-0 items-center gap-1.5">
                <div className="flex items-center gap-1 text-white/40">
                  <Users className="mb-0.5 size-3 shrink-0" />
                  <span className="text-12 font-400 leading-none tabular-nums">
                    {opt.voteCount}
                  </span>
                </div>
                <div className="h-3 w-px bg-white/5" />
                <span
                  className={cn(
                    "text-12 font-700 leading-none tabular-nums",
                    highlight ? "text-gold" : "text-white/50"
                  )}
                >
                  {pct}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className={cn(
                  "relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out",
                  highlight ? "bg-gold" : "bg-gold/40"
                )}
                style={{ width: `${pct}%` }}
              >
                {pct > 0 && (
                  <div className="absolute inset-y-0 w-1/2 animate-[shimmer_1.8s_linear_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Card ────────────────────────────────────────────────── */

function PollCard({ poll, index }: { poll: PollInterface; index: number }) {
  const typeConfig = POLL_TYPE_BADGE_CONFIG[poll.type] ?? {
    label: poll.type,
    cls: "text-white/50 bg-white/[0.06] border border-white/10",
  }
  const votedKeys = poll.userVotedOptionKeys ?? []

  return (
    <div className="rounded-16 bg-chat-bg relative flex flex-col px-4 pt-3.5 pb-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.3)]">
      {/* Number badge */}
      <div className="bg-gradient-gold rounded-tl-16 rounded-br-12 text-16 font-800 tracking-0 absolute -top-px -left-px flex size-9 items-center justify-center rounded-tr-none rounded-bl-none text-black">
        {index + 1}
      </div>

      {/* Topbar */}
      <div className="mb-2.5 flex items-center justify-end gap-1">
        <span className="text-14 flex items-center gap-1 text-white/70">
          <Users className="mb-0.5 size-3 shrink-0" />
          {poll.totalVotes} phiếu
        </span>
        <span
          className={cn(
            "text-12 rounded-4 font-700 tracking-1 flex items-center gap-1 px-2 py-0.5",
            typeConfig.cls
          )}
        >
          <Check className="size-2.5 shrink-0" strokeWidth={3} />
          {typeConfig.label}
        </span>
      </div>

      {/* Question */}
      <Tooltip>
        <TooltipTrigger className="mb-2.5 w-fit max-w-full text-left">
          <Typography
            as="p"
            variant="body-sm"
            weight="500"
            className="line-clamp-2 leading-snug text-white/85"
          >
            {poll.question}
          </Typography>
        </TooltipTrigger>
        <TooltipContent>{poll.question}</TooltipContent>
      </Tooltip>

      {/* Options */}
      <div className="mb-2 flex flex-col gap-1.5">
        {(poll.options ?? []).map((opt) => (
          <HistoryOption key={opt.optionKey} opt={opt} poll={poll} />
        ))}
      </div>

      {/* Voted tags */}
      {votedKeys.length > 0 && (
        <div className="mt-1 flex flex-col gap-1.5 border-t border-white/[0.06] pt-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Typography as="span" variant="caption" className="shrink-0 text-white/40">
              Bạn đã chọn:
            </Typography>
            <div className="flex flex-wrap gap-1">
              {votedKeys.map((k) => {
                const opt = poll.options?.find((o) => o.optionKey === k)
                return (
                  <span
                    key={k}
                    className="rounded-4 border-gold/25 bg-gold/12 text-gold text-12 font-600 inline-flex items-center border px-2 py-0.75 leading-100 whitespace-nowrap"
                  >
                    {k}. {opt?.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Modal ───────────────────────────────────────────────── */

interface PollHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chatroomId: string | number | null | undefined
}

export function PollHistoryModal({ open, onOpenChange, chatroomId }: PollHistoryModalProps) {
  const [list, setList] = useState<PollInterface[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!open || !chatroomId) return
    getPollHistoryApi(chatroomId as string | number, setLoading)
      .then((res) => setList(Array.isArray(res) ? res : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [open, chatroomId])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="rounded-16 bg-poll-modal relative flex h-[65vh] w-full max-w-7xl flex-col overflow-hidden shadow-[0_32px_100px_rgba(0,0,0,0.85)]">
            {/* Close */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/8 text-white/60 transition-all hover:bg-white/15 hover:text-white"
            >
              <X className="size-4" />
            </button>

            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.07] px-5 py-4">
              <Img
                src={icPoll}
                alt=""
                width={32}
                height={32}
                objectFit="contain"
                className="shrink-0"
              />
              <div className="flex flex-col gap-1">
                <Typography
                  as="span"
                  variant="h4"
                  weight="800"
                  className="text-gold drop-shadow-gold"
                >
                  Lịch sử bình chọn
                </Typography>
                <Typography as="span" variant="caption" className="text-white/35">
                  Bình chọn để nhận thưởng & xem kết quả trực tiếp
                </Typography>
              </div>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1 flex-col p-3.5">
              <div className="flex min-h-0 flex-1 scrollbar-none flex-col overflow-y-auto">
                {loading ? (
                  <div className="grid grid-cols-3 gap-3 max-md:grid-cols-2 max-sm:grid-cols-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-16 bg-chat-bg relative flex flex-col gap-3 overflow-hidden border border-white/[0.06] px-4 pt-3.5 pb-3"
                      >
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
                        <div className="rounded-tl-16 absolute -top-px -left-px size-9 bg-white/8" />
                        <div className="mb-1 flex items-center justify-end gap-2">
                          <div className="rounded-4 h-4 w-16 bg-white/8" />
                          <div className="rounded-4 h-4 w-24 bg-white/8" />
                        </div>
                        <div className="mb-1 flex flex-col gap-1.5">
                          <div className="rounded-4 h-3.5 w-full bg-white/8" />
                          <div className="rounded-4 h-3.5 w-3/4 bg-white/8" />
                        </div>
                        {[1, 2].map((o) => (
                          <div key={o} className="rounded-8 h-10 w-full bg-white/[0.05]" />
                        ))}
                        <div className="mt-auto flex items-center justify-between">
                          <div className="rounded-4 h-3 w-16 bg-white/8" />
                          <div className="rounded-4 h-3 w-12 bg-white/8" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : list.length === 0 ? (
                  <Empty tip="Chưa có lịch sử bình chọn" className="flex-1 py-0" />
                ) : (
                  <div className="grid grid-cols-3 gap-3 max-md:grid-cols-2 max-sm:grid-cols-1">
                    {list.map((poll, i) => (
                      <PollCard key={poll.pollId} poll={poll} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

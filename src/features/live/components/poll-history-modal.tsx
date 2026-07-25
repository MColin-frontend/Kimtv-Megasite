"use client"

import { useEffect, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Check, Users, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { getPollHistoryApi } from "@/features/live/api/poll.api"
import type { PollInterface } from "@/features/live/poll.models"
import { Empty } from "@/components/ui/empty"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

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
                  <Users className="mb-[2px] size-3 shrink-0" />
                  <span className="text-12 font-400 leading-[1] tabular-nums">{opt.voteCount}</span>
                </div>
                <div className="h-3 w-px bg-white/5" />
                <span
                  className={cn(
                    "text-12 font-700 leading-[1] tabular-nums",
                    highlight ? "text-gold" : "text-white/50"
                  )}
                >
                  {pct}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-[4px] overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className={cn(
                  "relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out",
                  highlight ? "bg-gold" : "bg-gold/40"
                )}
                style={{ width: `${pct}%` }}
              >
                {pct > 0 && (
                  <div
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    style={{ animation: "shimmer 1.8s linear infinite" }}
                  />
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
  const typeConfig = {
    SINGLE_CHOICE: {
      label: "SINGLE CHOICE",
      color: "rgba(74,222,128,1)",
      bg: "rgba(74,222,128,0.1)",
      border: "rgba(74,222,128,0.25)",
    },
    MULTIPLE_CHOICE: {
      label: "MULTIPLE CHOICE",
      color: "rgba(139,92,246,1)",
      bg: "rgba(139,92,246,0.1)",
      border: "rgba(139,92,246,0.25)",
    },
    RATING: {
      label: "RATING",
      color: "var(--gold)",
      bg: "rgba(246,195,67,0.1)",
      border: "rgba(246,195,67,0.25)",
    },
  }[poll.type] ?? {
    label: poll.type,
    color: "rgba(255,255,255,0.5)",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.1)",
  }

  const votedKeys = poll.userVotedOptionKeys ?? []

  return (
    <div
      className="relative flex flex-col"
      style={{
        background: "#181920",
        borderRadius: 14,
        padding: "14px 16px 10px",
        boxShadow:
          "0 4px 20px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)",
      }}
    >
      {/* Number badge */}
      <div
        className="absolute -top-px -left-px flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          background: "var(--gradient-gold)",
          borderRadius: "14px 0 12px 0",
          color: "#111",
          fontSize: 16,
          fontWeight: 900,
          letterSpacing: -0.5,
        }}
      >
        {index + 1}
      </div>

      {/* Topbar — justify-end như kimtvpc */}
      <div className="mb-2.5 flex items-center justify-end gap-1">
        <span
          className="flex items-center gap-1"
          style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}
        >
          <Users className="mb-[2px] size-3 shrink-0" />
          {poll.totalVotes} phiếu
        </span>
        <span
          className="flex items-center gap-1"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            padding: "2px 7px",
            borderRadius: 4,
            color: typeConfig.color,
            background: typeConfig.bg,
            border: `1px solid ${typeConfig.border}`,
          }}
        >
          <Check className="size-2.5 shrink-0" strokeWidth={3} />
          {typeConfig.label}
        </span>
      </div>

      {/* Question */}
      <Tooltip>
        <TooltipTrigger className="mb-2.5 w-fit max-w-full text-left">
          <p
            className="line-clamp-2"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            {poll.question}
          </p>
        </TooltipTrigger>
        <TooltipContent>{poll.question}</TooltipContent>
      </Tooltip>

      {/* Options */}
      <div className="mb-2 flex flex-col gap-1.5">
        {(poll.options ?? []).map((opt) => (
          <HistoryOption key={opt.optionKey} opt={opt} poll={poll} />
        ))}
      </div>

      {/* Footer */}
      {votedKeys.length > 0 && (
        <div
          className="mt-1 flex flex-col gap-1.5"
          style={{ paddingTop: 10, marginTop: 4, borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Voted tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
              Bạn đã chọn:
            </span>
            <div className="flex flex-wrap gap-1">
              {votedKeys.map((k) => {
                const opt = poll.options?.find((o) => o.optionKey === k)
                return (
                  <span
                    key={k}
                    className="inline-flex items-center whitespace-nowrap"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: 1,
                      padding: "3px 9px",
                      borderRadius: 4,
                      color: "var(--gold)",
                      background: "rgba(246,195,67,0.12)",
                      border: "1px solid rgba(246,195,67,0.25)",
                    }}
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !chatroomId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    setList([])
    getPollHistoryApi(chatroomId)
      .then((res) => setList(Array.isArray(res) ? res : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [open, chatroomId])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="relative flex w-full max-w-7xl flex-col overflow-hidden"
            style={{
              background: "#0f1219",
              borderRadius: 16,
              height: "65vh",
              boxShadow: "0 32px 100px rgba(0,0,0,0.85)",
            }}
          >
            {/* Close */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/8 text-white/60 transition-all hover:bg-white/15 hover:text-white"
            >
              <X className="size-4" />
            </button>

            {/* Header */}
            <div
              className="flex shrink-0 items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <img src="/icons/ic-poll.svg" alt="" className="drop-shadow-gold size-8 shrink-0" />
              <div className="flex flex-col gap-1">
                <span
                  className="tracking-widest uppercase"
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "var(--gold)",
                    textShadow: "0 0 8px rgba(246,195,67,0.4)",
                  }}
                >
                  Lịch sử bình chọn
                </span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
                  Bình chọn để nhận thưởng & xem kết quả trực tiếp
                </span>
              </div>
            </div>

            {/* Body */}
            <div
              className="flex-1 overflow-y-auto"
              style={{
                padding: 14,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.12) transparent",
              }}
            >
              {loading ? (
                <div className="grid grid-cols-3 gap-3 max-md:grid-cols-2 max-sm:grid-cols-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="relative flex flex-col gap-3 overflow-hidden"
                      style={{
                        background: "#181920",
                        borderRadius: 14,
                        padding: "14px 16px 12px",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {/* Shimmer overlay */}
                      <div
                        className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
                        }}
                      />
                      {/* Number badge */}
                      <div className="absolute -top-px -left-px size-9 rounded-tl-[14px] bg-white/8" />
                      {/* Top row */}
                      <div className="mb-1 flex items-center justify-end gap-2">
                        <div className="rounded-4 h-4 w-16 bg-white/8" />
                        <div className="rounded-4 h-4 w-24 bg-white/8" />
                      </div>
                      {/* Question */}
                      <div className="mb-1 flex flex-col gap-1.5">
                        <div className="rounded-4 h-3.5 w-full bg-white/8" />
                        <div className="rounded-4 h-3.5 w-3/4 bg-white/8" />
                      </div>
                      {/* Options */}
                      {[1, 2].map((o) => (
                        <div key={o} className="rounded-8 h-10 w-full bg-white/[0.05]" />
                      ))}
                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="rounded-4 h-3 w-16 bg-white/8" />
                        <div className="rounded-4 h-3 w-12 bg-white/8" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : list.length === 0 ? (
                <Empty tip="Chưa có lịch sử bình chọn" />
              ) : (
                <div className="grid grid-cols-3 gap-3 max-md:grid-cols-2 max-sm:grid-cols-1">
                  {list.map((poll, i) => (
                    <PollCard key={poll.pollId} poll={poll} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

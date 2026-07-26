"use client"

import { useState } from "react"
import { ChartBarStacked, Check, ChevronDown, Users, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { useTranslation } from "@/i18n"

import { PollTypeEnum, pollTypeFromApi } from "@/features/live/poll.constants"
import type { PollInterface } from "@/features/live/poll.models"
import { isPollActive, isPollVoted } from "@/features/live/poll.models"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/modal/confirm"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

/* ── Option row ──────────────────────────────────────────── */

function OptionRow({
  optionKey,
  label,
  selected,
  voted,
  showData,
  voteCount,
  percent,
  isMultiple,
  onSelect,
}: {
  optionKey: string
  label: string
  selected: boolean
  voted: boolean
  showData: boolean
  voteCount: number
  percent: number
  isMultiple: boolean
  onSelect: () => void
}) {
  const pct = Math.round(percent)

  return (
    <div
      onClick={() => !voted && onSelect()}
      className={cn(
        "rounded-8 overflow-hidden border border-transparent transition-all duration-150",
        !voted && "cursor-pointer",
        selected
          ? "bg-gold/[0.09] -translate-y-[2px] shadow-[0_6px_24px_rgba(0,0,0,0.55),0_3px_20px_rgba(246,195,67,0.25),inset_0_1px_0_rgba(255,255,255,0.13)]"
          : "bg-white/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]",
        !voted && !selected && "hover:bg-white/[0.06]"
      )}
    >
      <div className="flex items-center gap-2.5 px-3 py-2">
        {/* Radio / checkbox */}
        <div
          className={cn(
            "relative shrink-0 border-2 transition-all duration-150",
            isMultiple ? "rounded-4 size-4" : "size-4 rounded-full",
            selected ? "border-gold" : "border-white/30"
          )}
        >
          {!isMultiple && selected && (
            <div className="bg-gold absolute inset-0 m-auto size-1.5 rounded-full shadow-[0_0_4px_rgba(246,195,67,0.8)]" />
          )}
          {isMultiple && selected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="text-gold size-2.5" strokeWidth={3.5} />
            </div>
          )}
        </div>

        {/* Group: key + label + stats + progress */}
        <div
          className={cn(
            "rounded-6 flex min-w-0 flex-1 overflow-hidden transition-all",
            selected
              ? "shadow-[0_3px_16px_rgba(246,195,67,0.22),inset_0_1px_0_rgba(255,255,255,0.12)]"
              : "shadow-[0_2px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]"
          )}
        >
          {/* Key badge — card shape với clip + gradient */}
          <div
            className="relative flex w-12 shrink-0 items-center justify-center self-stretch transition-all"
            style={{
              background: selected
                ? "linear-gradient(160deg, #ffd75a 0%, #f6c343 45%, #c8872a 100%)"
                : "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
              clipPath: "polygon(0 0, 100% 0, 78% 100%, 0 100%)",
              boxShadow: selected
                ? "inset 0 1px 0 rgba(255,255,255,0.35), 2px 0 8px rgba(246,195,67,0.25)"
                : "inset 0 1px 0 rgba(255,255,255,0.08), 2px 0 6px rgba(0,0,0,0.3)",
            }}
          >
            <Typography
              as="span"
              variant="h6"
              weight="800"
              className={cn(
                "leading-none select-none",
                selected ? "text-black/70" : "text-white/60"
              )}
            >
              {optionKey}
            </Typography>
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <Tooltip>
                <TooltipTrigger className="min-w-0 flex-1 cursor-default text-left">
                  <Typography
                    as="span"
                    variant="body-sm"
                    weight={selected ? "600" : "400"}
                    className={cn(
                      "block w-fit truncate leading-none transition-colors",
                      selected ? "text-white" : "text-white/70"
                    )}
                  >
                    {label}
                  </Typography>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>

              {showData && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <div className="flex items-center gap-1 text-white/40">
                    <Users className="size-3 shrink-0" />
                    <Typography
                      as="span"
                      size="12"
                      weight={voteCount > 0 ? "700" : "400"}
                      className={cn("leading-none tabular-nums", voteCount > 0 && "text-gold")}
                    >
                      {voteCount}
                    </Typography>
                  </div>
                  <div className="h-3 w-px bg-white/5" />
                  <Typography
                    as="span"
                    size="12"
                    weight="700"
                    className={cn(
                      "leading-none tabular-nums",
                      selected || pct > 0 ? "text-gold" : "text-white/50"
                    )}
                  >
                    {pct}%
                  </Typography>
                </div>
              )}
            </div>

            <div className="h-[4px] overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className={cn(
                  "relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out",
                  selected ? "bg-gold" : "bg-gold/40"
                )}
                style={{ width: showData ? `${pct}%` : "0%" }}
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

/* ── Props ───────────────────────────────────────────────── */

interface PollVoteViewProps {
  poll: PollInterface
  onVote?: (optionKeys: string[]) => Promise<PollInterface | null | void>
  onClose?: () => void
  className?: string
}

/* ── Main ────────────────────────────────────────────────── */

export function PollVoteView({ poll, onVote, onClose, className }: PollVoteViewProps) {
  const { t } = useTranslation()

  const [selectedKeys, setSelectedKeys] = useState<string[]>(poll.userVotedOptionKeys ?? [])
  const [loading, setLoading] = useState<boolean>(false)

  // Đọc thẳng từ prop — socket POLL_ACTIVE/UPDATE/START cập nhật qua parent
  const remainingSec = poll.remainingSec
  const isUrgent = remainingSec > 0 && remainingSec <= 10
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, "0")
  const ss = String(remainingSec % 60).padStart(2, "0")

  const pollType = pollTypeFromApi(poll.type)
  const isMultiple = pollType === PollTypeEnum.MULTIPLE
  const active = isPollActive(poll)
  const voted = isPollVoted(poll) || !active
  const showData = voted || poll.showRealtime
  const canVote = active && !voted && selectedKeys.length > 0 && !loading

  function handleSelect(key: string) {
    if (voted) return
    const max = poll.maxSelect ?? 6
    setSelectedKeys((prev) => {
      if (!isMultiple) return [key]
      if (prev.includes(key)) return prev.filter((k) => k !== key)
      if (prev.length >= max) return [...prev.slice(1), key] // bỏ cái đầu, thêm cái mới
      return [...prev, key]
    })
  }

  const [confirmClose, setConfirmClose] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  async function handleVote() {
    if (!selectedKeys.length || loading) return
    setLoading(true)
    try {
      const updated = await onVote?.(selectedKeys)
      if (updated && typeof updated === "object" && "pollId" in updated) {
        setSelectedKeys((updated as PollInterface).userVotedOptionKeys ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {onClose && (
        <button
          type="button"
          onClick={() => setConfirmClose(true)}
          className="absolute -top-3.5 -right-2.5 z-10 flex size-7 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.4)] transition-all duration-150 hover:border-red-500/70 hover:bg-red-500/30 hover:text-red-300"
        >
          <X className="size-4" />
        </button>
      )}
      <div
        className={cn(
          "rounded-12 panel-poll flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(246,195,67,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]",
          className
        )}
      >
        <div className="flex flex-col gap-3 p-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ChartBarStacked className="text-gold size-5 shrink-0" />
              <Typography
                as="span"
                variant="overline"
                weight="800"
                className="text-gold drop-shadow-gold leading-none"
              >
                {t("live.poll.view-title")}
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              {active ? (
                <Typography
                  as="span"
                  variant="label"
                  weight="800"
                  className={cn(
                    "leading-none tabular-nums",
                    isUrgent
                      ? "animate-blink text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]"
                      : "text-gold drop-shadow-gold"
                  )}
                >
                  {mm}:{ss}
                </Typography>
              ) : (
                <div className="rounded-4 flex shrink-0 items-center gap-1 border border-white/15 bg-white/[0.06] px-2 py-1">
                  <div className="size-1.5 rounded-full bg-white/30" />
                  <Typography as="span" variant="overline" className="leading-none text-white/50">
                    {t("live.poll.status.ended")}
                  </Typography>
                </div>
              )}
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="border-gold/40 bg-gold/10 text-gold/70 hover:border-gold/60 hover:bg-gold/20 hover:text-gold flex size-6 items-center justify-center rounded-full border transition-all duration-200"
              >
                <ChevronDown
                  className={cn(
                    "size-4 stroke-[2.5] transition-transform duration-200",
                    collapsed && "rotate-180"
                  )}
                />
              </button>
            </div>
          </div>

          {!collapsed && (
            <>
              {/* Question */}
              <Tooltip>
                <TooltipTrigger className="w-fit max-w-full text-left">
                  <Typography
                    variant="body-sm"
                    weight="600"
                    className="line-clamp-3 leading-snug text-white/85"
                  >
                    {poll.question}
                  </Typography>
                </TooltipTrigger>
                <TooltipContent>{poll.question}</TooltipContent>
              </Tooltip>

              {/* Options */}
              <div
                style={{
                  maxHeight: "220px",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.08) transparent",
                }}
              >
                <div className="flex flex-col gap-2 px-0.5 py-0.5">
                  {poll.options.map((opt) => (
                    <OptionRow
                      key={opt.optionKey}
                      optionKey={opt.optionKey}
                      label={opt.label}
                      selected={selectedKeys.includes(opt.optionKey)}
                      voted={voted}
                      showData={showData}
                      voteCount={opt.voteCount}
                      percent={opt.percent}
                      isMultiple={isMultiple}
                      onSelect={() => handleSelect(opt.optionKey)}
                    />
                  ))}
                </div>
              </div>

              {/* Voted tags */}
              {voted && selectedKeys.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Typography as="span" variant="caption" className="shrink-0 text-white/40">
                    {t("live.poll.labels.you-voted")}
                  </Typography>
                  {selectedKeys.map((key) => {
                    const opt = poll.options.find((o) => o.optionKey === key)
                    return (
                      <Typography
                        key={key}
                        as="span"
                        size="10"
                        weight="600"
                        className="rounded-4 border-gold/30 bg-gold/10 text-gold px-2 py-0.5 leading-none"
                      >
                        {key}. {opt?.label ?? key}
                      </Typography>
                    )
                  })}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="text-gold size-5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <Typography
                      as="span"
                      variant="label"
                      weight="700"
                      className="text-gold leading-none tabular-nums"
                    >
                      {poll.totalVotes}
                    </Typography>
                    <Typography as="span" variant="caption" className="leading-none text-white/40">
                      {t("live.poll.labels.votes")}
                    </Typography>
                  </div>
                </div>

                {active && !voted && (
                  <Button
                    variant="gradient"
                    size="sm"
                    disabled={!canVote}
                    onClick={handleVote}
                    className="text-12 font-600 h-7 shrink-0 px-4"
                  >
                    {loading ? "..." : t("live.poll.actions.vote")}
                    {!loading && selectedKeys.length > 0 && ` (${selectedKeys.length})`}
                  </Button>
                )}

                {voted && (
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                    <Typography as="span" variant="caption" weight="600" className="text-green-400">
                      {active ? t("live.poll.actions.voted") : t("live.poll.status.ended")}
                    </Typography>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmClose}
        onOpenChange={setConfirmClose}
        type="destructive"
        title={t("live.poll.confirm.close-title")}
        content={t("live.poll.confirm.close")}
        confirmLabel={t("live.poll.confirm.confirm")}
        cancelLabel={t("live.poll.confirm.cancel")}
        onConfirm={() => onClose?.()}
      />
    </div>
  )
}

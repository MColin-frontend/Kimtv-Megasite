"use client"

import { useEffect, useState } from "react"
import { Calendar, Trophy } from "lucide-react"

import { formatFootballGameTime, formatMatchDate, formatMatchTime } from "@/lib/date"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useLiveNavigate } from "@/hooks/use-live-navigate"
import { useFakeGameMinute } from "@/hooks/useFakeGameMinute"

import { useTranslation } from "@/i18n"
import { MATCH_HALF_LABEL } from "@/constants/common.constants"
import {
  MATCH_CARD_I18N_KEYS,
  MATCH_HALF_LABEL_I18N_KEY,
  MATCH_STAT_CONFIG,
} from "@/constants/component/match-card.constants"
import { MatchFootballStateEnum, MatchStatusEnum } from "@/enums/match.enum"
import type { MatchInterface } from "@/models/match.models"

import { closePollApi, createPollApi, getActivePollApi } from "@/features/live/api/poll.api"
import { PollHistoryModal } from "@/features/live/components/poll-history-modal"
import { PollModal } from "@/features/live/components/poll-modal"
import { POLL_TYPE_MAP, PollTypeEnum } from "@/features/live/poll.constants"
import type { CreatePollPayloadInterface, PollInterface } from "@/features/live/poll.models"
import type { PollFormType } from "@/features/live/poll.schema"
import { AvatarWithTooltip } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

import icPoll from "@assets/icons/common/ic-poll.svg"
import icShare from "@assets/icons/common/ic-share.svg"
import imgStadiumBg from "@assets/images/common/img-no-source.png"
import imgVs from "@assets/images/common/img-vs.png"

import { MatchLiveIndicator } from "./parts/match-live-indicator"
import { MatchStatusBadge } from "./parts/match-status-badge"

/* ── Types ───────────────────────────────────────────────── */

export interface MatchLiveInfoBarProps {
  match: MatchInterface
  className?: string
}

/* ── Share button ────────────────────────────────────────── */

interface ShareButtonState {
  open: boolean
  copied: boolean
  toggle: () => void
  copy: () => void
}

function useShareButton(): ShareButtonState {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const el = document.getElementById("match-share-btn")
      if (el && !el.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function copy() {
    const url = window.location.href
    navigator.clipboard?.writeText(url).catch(() => {
      const input = document.createElement("input")
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand("Copy")
      document.body.removeChild(input)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return { open, copied, toggle: () => setOpen((v) => !v), copy }
}

function ShareButton() {
  const { open, copied, toggle, copy } = useShareButton()

  return (
    <div id="match-share-btn" className="relative">
      <Button
        onClick={toggle}
        className="group flex h-[30px] items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-white/80 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/[0.18] hover:text-white max-sm:h-6 max-sm:px-2"
      >
        <Img
          src={icShare}
          alt="share"
          width={14}
          height={14}
          objectFit="contain"
          className="shrink-0 opacity-70 brightness-0 invert transition-opacity group-hover:opacity-100"
        />
        <span className="text-12 font-600 leading-none">Chia sẻ</span>
      </Button>
      {open && (
        <div className="rounded-8 absolute top-full right-0 z-50 mt-1.5 w-[280px] border border-white/10 bg-[#0c1526] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-sm:w-[calc(100vw-3rem)]">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={typeof window !== "undefined" ? window.location.href : ""}
              className="rounded-6 text-12 text-muted min-w-0 flex-1 border border-white/10 bg-white/5 px-2 py-1.5 outline-none"
            />
            <Button
              onClick={copy}
              className="rounded-6 text-12 font-500 shrink-0 bg-white/10 px-3 py-1.5 text-white transition-colors hover:bg-white/20"
            >
              {copied ? "Đã sao chép!" : "Sao chép"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main component ──────────────────────────────────────── */

export function MatchLiveInfoBar({ match, className }: MatchLiveInfoBarProps) {
  const { t } = useTranslation()
  const navigateToLive = useLiveNavigate()
  const { user } = useAuth()
  const [pollOpen, setPollOpen] = useState(true) // TODO: revert — tạm mở để CSS
  const [historyOpen, setHistoryOpen] = useState(false)
  const [activePoll, setActivePoll] = useState<PollInterface | null>(null)

  const isRoomOwner =
    !!user &&
    !!match.anchorRoomVos?.some(
      (a) => a.anchorId != null && String(a.anchorId) === String(user.userId ?? user.uid)
    )

  function handleClick() {
    if (!match.matchId || !match.gameId) return
    const roomId = match.anchorRoomVos?.[0]?.roomId ?? undefined
    navigateToLive(match.matchId, match.gameId, roomId)
  }

  async function handlePoll(e: React.MouseEvent) {
    e.stopPropagation()
    const firstAnchor = match.anchorRoomVos?.[0]
    const chatroomId = firstAnchor?.roomId ?? match.matchId
    if (chatroomId) {
      const poll = await getActivePollApi(chatroomId)
      setActivePoll(poll)
    }
    setPollOpen(true)
  }

  async function handleEndPoll() {
    if (!activePoll?.pollId) return
    await closePollApi(activePoll.pollId)
    setActivePoll(null)
  }

  async function handlePollSubmit(data: PollFormType) {
    const firstAnchor = match.anchorRoomVos?.[0]
    // kimtvpc: isAnchor → roomId + gameId=0, else → matchId + gameId
    const isAnchor = !!firstAnchor
    const chatroomId = isAnchor ? (firstAnchor?.roomId ?? match.matchId) : match.matchId
    const gameId = isAnchor ? 0 : (match.gameId ?? 0)
    const durationSec =
      data.duration === "custom" ? Number(data.customDuration ?? 60) : Number(data.duration)
    const type = POLL_TYPE_MAP[data.pollType]

    const payload: CreatePollPayloadInterface = {
      chatroomId,
      gameId,
      type,
      question: data.question.trim(),
      durationSec,
      requireLogin: true,
      showRealtime: true,
    }

    if (data.pollType === PollTypeEnum.RATING) {
      payload.scaleMax = data.maxSelect ?? 5
    } else {
      payload.options = data.options.map((o) => o.value.trim()).filter(Boolean)
      if (data.pollType === PollTypeEnum.MULTIPLE) {
        payload.minSelect = data.minSelect
        payload.maxSelect = data.maxSelect
      }
    }

    await createPollApi(payload)
  }

  const {
    leagueName,
    leagueLogo,
    homeName,
    homeLogo,
    awayName,
    awayLogo,
    homeScore,
    awayScore,
    gameId,
    anchorRoomVos,
  } = match

  const anchors =
    anchorRoomVos?.map((a) => ({ userAvatar: a.userAvatar ?? "", userName: a.userName ?? "" })) ??
    []
  const firstAnchor = anchorRoomVos?.[0] ?? null
  const thumbnail = firstAnchor?.cover ?? match.animationUrl ?? null

  const isUpcoming =
    match.status === MatchStatusEnum.UPCOMING || match.status === MatchStatusEnum.UNKNOWN
  const isFinished = match.status === MatchStatusEnum.FINISHED
  const isMatchLive = match.status === MatchStatusEnum.LIVE
  // BLV đang stream → "Stream"
  const isStream = !!firstAnchor
  // Trận live không có BLV → "LIVE"
  const isLive = isMatchLive && !isStream

  const halfLabel = MATCH_HALF_LABEL[match.state as MatchFootballStateEnum] ?? "LIVE"
  const periodI18nKey = MATCH_HALF_LABEL_I18N_KEY[halfLabel]
  const periodLabel = periodI18nKey ? t(periodI18nKey as Parameters<typeof t>[0]) : halfLabel

  const displayMinute = useFakeGameMinute(match.gameTime, isStream || isLive)
  const isSoccer = gameId === 202
  const showStats = isSoccer || (gameId != null && gameId > 200)

  const statValues = [
    0,
    (match.homeYellowCard ?? 0) + (match.awayYellowCard ?? 0),
    (match.homeRedCard ?? 0) + (match.awayRedCard ?? 0),
    (match.homeCornerKick ?? 0) + (match.awayCornerKick ?? 0),
  ]
  const stats = MATCH_STAT_CONFIG.map((cfg, i) => ({
    ...cfg,
    label: t(cfg.labelKey as Parameters<typeof t>[0]),
    value: statValues[i],
  }))

  return (
    <div
      onClick={handleClick}
      className={cn(
        "rounded-b-12 relative flex w-full shrink-0 cursor-pointer flex-col gap-3 overflow-hidden p-2 transition-opacity hover:opacity-95 max-lg:gap-2 max-sm:gap-1.5 max-sm:p-1.5",
        className
      )}
    >
      {thumbnail ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${thumbnail})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          />
          <div className="card-thumbnail-overlay pointer-events-none absolute inset-0 z-[1]" />
          <div className="pointer-events-none absolute inset-0 z-[1]" />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-50"
            style={{
              backgroundImage: `url(${imgStadiumBg.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {match.homeLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${match.homeLogo})`,
                backgroundSize: "160px",
                backgroundPosition: "-10px center",
                backgroundRepeat: "no-repeat",
                filter: "blur(55px) saturate(2)",
                opacity: 0.13,
                transform: "scale(1.6)",
              }}
            />
          )}
          {match.awayLogo && (
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${match.awayLogo})`,
                backgroundSize: "160px",
                backgroundPosition: "calc(100% + 10px) center",
                backgroundRepeat: "no-repeat",
                filter: "blur(55px) saturate(2)",
                opacity: 0.1,
                transform: "scale(1.6)",
              }}
            />
          )}
          <div className="card-stadium-overlay pointer-events-none absolute inset-0 z-[1]" />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" />
        </>
      )}

      {/* Content above bg */}
      <div className="relative z-[2] flex flex-col gap-2 max-lg:gap-3">
        {/* Row 1: live + time + share — ẩn trên mobile */}
        <div className="flex w-full items-center justify-between max-sm:-my-1 max-sm:origin-left">
          <div className="flex items-center gap-2 max-md:scale-90 max-sm:scale-75">
            {isStream && <MatchLiveIndicator label="Stream" />}
            {isLive && <MatchLiveIndicator label="LIVE" />}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <MatchStatusBadge type="live" label={periodLabel} className="hidden max-sm:flex" />
              {displayMinute != null && displayMinute !== 0 && (
                <div className="rounded-4 border-gold/30 bg-gold/10 border px-1.5 py-0.5 max-sm:px-1 max-sm:py-0">
                  <Typography
                    as="span"
                    variant="label"
                    weight="700"
                    className="text-gold drop-shadow-gold"
                  >
                    {formatFootballGameTime(displayMinute)}
                    <span className="animate-blink">&apos;</span>
                  </Typography>
                </div>
              )}
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                setHistoryOpen(true)
              }}
              className="group flex h-[30px] items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-white/80 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/[0.18] hover:text-white max-sm:h-6 max-sm:px-2"
            >
              <Img
                src={icPoll}
                alt="poll"
                width={14}
                height={14}
                objectFit="contain"
                className="shrink-0 opacity-70 brightness-0 invert transition-opacity group-hover:opacity-100"
              />
              <span className="text-12 font-600 leading-none">Lịch sử</span>
            </Button>
            {isRoomOwner && (
              <Button
                onClick={handlePoll}
                className="bg-gradient-button font-700 flex h-[30px] items-center gap-1.5 rounded-full px-3 text-black shadow-[0_0_0_1px_rgba(246,195,67,0.6),0_0_18px_rgba(246,195,67,0.45),0_2px_8px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_0_0_1px_rgba(246,195,67,0.9),0_0_28px_rgba(246,195,67,0.65)] active:scale-95 max-sm:h-6 max-sm:px-2"
              >
                <Img
                  src={icPoll}
                  alt="poll"
                  width={14}
                  height={14}
                  objectFit="contain"
                  className="shrink-0 brightness-0"
                />
                <span className="text-12 font-700 leading-none">
                  {t("live.poll.title" as Parameters<typeof t>[0])}
                </span>
              </Button>
            )}
            <ShareButton />
          </div>
        </div>

        {/* Row 2: teams + score */}
        <div className="flex items-center justify-between gap-4 max-md:gap-2 max-sm:gap-2">
          {/* Home */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 max-md:gap-2 max-sm:gap-1.5">
            <Typography
              as="span"
              variant="body"
              weight="700"
              className="max-md:text-14 max-sm:!text-10 min-w-0 truncate text-right text-white"
            >
              {homeName}
            </Typography>
            <div className="flex size-[64px] shrink-0 items-center justify-center max-lg:size-12 max-md:size-10 max-sm:size-10">
              <Img src={homeLogo} alt={homeName ?? ""} width={64} height={64} objectFit="contain" />
            </div>
          </div>

          {/* Score */}
          <div className="flex shrink-0 flex-col items-center gap-1">
            {isUpcoming ? (
              <Img
                src={imgVs}
                alt="VS"
                width={48}
                height={48}
                objectFit="contain"
                className="max-md:size-9 max-sm:size-9"
              />
            ) : (
              <>
                <div className="flex items-center gap-0.5">
                  <Typography
                    as="span"
                    size="48"
                    weight="700"
                    className="text-gold drop-shadow-gold-score max-md:!text-36 max-sm:!text-30 leading-none tabular-nums"
                  >
                    {homeScore ?? 0}
                  </Typography>
                  <Typography
                    as="span"
                    size="24"
                    weight="500"
                    className="text-gold/60 max-md:!text-16 max-sm:!text-16 px-0.5 leading-100"
                  >
                    :
                  </Typography>
                  <Typography
                    as="span"
                    size="48"
                    weight="700"
                    className="text-gold drop-shadow-gold-score max-md:!text-36 max-sm:!text-30 leading-none tabular-nums"
                  >
                    {awayScore ?? 0}
                  </Typography>
                </div>
                {isLive && <MatchStatusBadge type="live" label={periodLabel} />}
                {isFinished && (
                  <MatchStatusBadge type="finished" label={t(MATCH_CARD_I18N_KEYS.finished)} />
                )}
              </>
            )}
          </div>

          {/* Away */}
          <div className="flex min-w-0 flex-1 items-center gap-3 max-md:gap-2 max-sm:gap-1.5">
            <div className="flex size-[64px] shrink-0 items-center justify-center max-lg:size-12 max-md:size-10 max-sm:size-10">
              <Img src={awayLogo} alt={awayName ?? ""} width={64} height={64} objectFit="contain" />
            </div>
            <Typography
              as="span"
              variant="body"
              weight="700"
              className="max-md:text-14 max-sm:!text-10 min-w-0 truncate text-white"
            >
              {awayName}
            </Typography>
          </div>
        </div>

        {/* Row 3: stats + anchors */}
        {showStats && (
          <div className="flex items-center justify-center gap-3 max-sm:gap-1">
            <div className="rounded-8 flex items-center justify-between bg-white/10 px-2 py-1.5 backdrop-blur-[80px] [will-change:transform] max-sm:px-1 max-sm:py-0.5">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-1 items-center">
                  {i > 0 && <div className="h-4 w-px shrink-0 bg-white/20 max-sm:h-2.5" />}
                  <div className="flex flex-1 flex-col items-center gap-0.5 px-5 max-sm:px-1">
                    <div className="flex items-center gap-1 max-sm:gap-0.5">
                      <Img
                        src={s.icon}
                        alt={s.alt}
                        width={16}
                        height={16}
                        objectFit="contain"
                        className="max-sm:!size-[10px]"
                      />
                      <Typography
                        as="span"
                        variant="caption"
                        size="14"
                        weight="700"
                        className="max-sm:!text-10 text-white tabular-nums"
                      >
                        {s.value}
                      </Typography>
                    </div>
                    <Typography
                      as="span"
                      variant="caption"
                      weight="500"
                      className="whitespace-nowrap text-white/80 max-sm:!text-[9px]"
                    >
                      {s.label}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>

            {anchors && anchors.length > 0 && (
              <div className="flex items-center">
                {anchors.slice(0, 3).map((anchor, i) => (
                  <AvatarWithTooltip
                    key={i}
                    src={anchor.userAvatar}
                    name={anchor.userName}
                    size={44}
                    index={i}
                    overlap={8}
                    className="max-md:!size-9 max-sm:!size-7"
                  />
                ))}
                {anchors.length > 3 && (
                  <Typography
                    as="div"
                    size="10"
                    weight="600"
                    className="text-muted relative -ml-2 flex size-[36px] items-center justify-center rounded-full bg-white/10 max-md:!size-8 max-sm:!size-6"
                  >
                    +{anchors.length - 3}
                  </Typography>
                )}
              </div>
            )}
          </div>
        )}

        {/* Row 4: league + time */}
        <div className="flex items-center justify-between px-0.5 py-1">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
            {leagueLogo ? (
              <Img
                src={leagueLogo}
                alt=""
                width={20}
                height={20}
                objectFit="contain"
                className="shrink-0"
              />
            ) : (
              <Trophy className="text-gold size-3.5 shrink-0" />
            )}
            <Typography
              as="span"
              variant="caption"
              weight="500"
              className="max-sm:!text-10 min-w-0 truncate text-white/90"
            >
              {leagueName}
            </Typography>
          </div>
          {match.startTime && (
            <div className="flex shrink-0 items-center gap-1 max-sm:origin-right max-sm:scale-75">
              <Calendar className="size-3 shrink-0 text-white/50" />
              <Typography
                as="span"
                variant="caption"
                weight="500"
                className="text-white/70 tabular-nums"
              >
                {formatMatchTime(match.startTime)}
                <span className="mx-1 inline-block h-2.5 w-px bg-white/30 align-middle" />
                {formatMatchDate(match.startTime)}
              </Typography>
            </div>
          )}
        </div>
      </div>
      {pollOpen && (
        <PollModal
          open={pollOpen}
          onOpenChange={setPollOpen}
          onSubmit={handlePollSubmit}
          activePoll={activePoll}
          onEndPoll={handleEndPoll}
        />
      )}
      <PollHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        chatroomId={match.anchorRoomVos?.[0]?.roomId ?? match.matchId}
      />
    </div>
  )
}

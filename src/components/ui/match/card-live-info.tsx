"use client"

import { useEffect, useState } from "react"
import { deriveMatchStatusFlags } from "@/lib/match.utils"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useBoolean } from "@/hooks/use-boolean"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useLiveNavigate } from "@/hooks/use-live-navigate"
import { useDisclosure } from "@/hooks/use-disclosure"
import { useFakeGameMinute } from "@/hooks/use-fake-game-minute"

import { useTranslation } from "@/i18n"
import { buildMatchStats } from "@/constants/component/match-card.constants"
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

import { BadgeLive } from "./parts/badge-live"
import { CardBackground } from "./parts/card-background"
import { GameMinuteBadge } from "./parts/game-minute-badge"
import { LeagueTimeRow } from "./parts/league-time-row"
import { MatchStatBar } from "./parts/stat-bar"

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
  const { value: open, toggle, off } = useBoolean()
  const { copied, copy: copyText } = useCopyToClipboard()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const el = document.getElementById("match-share-btn")
      if (el && !el.contains(e.target as Node)) off()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [off])

  function copy() {
    copyText(window.location.href)
  }

  return { open, copied, toggle, copy }
}

function ShareButton() {
  const { open, copied, toggle, copy } = useShareButton()

  return (
    <div id="match-share-btn" className="relative">
      <Button
        onClick={toggle}
        className="group flex h-[30px] items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-white/80 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/[0.18] hover:text-white max-sm:h-5 max-sm:gap-1 max-sm:px-1.5"
      >
        <Img
          src={icShare}
          alt="share"
          objectFit="contain"
          className="icon-gold size-3.5 shrink-0 transition-opacity max-sm:size-2.5"
        />
        <Typography
          as="span"
          variant="caption"
          weight="600"
          className="tracking-0 text-gold max-sm:text-10! leading-none"
        >
          Chia sẻ
        </Typography>
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
  const { state, open, setOpen } = useDisclosure("poll", "history")
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
    open("poll")
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

  const { isStream, isLive, isUpcoming } = deriveMatchStatusFlags({
    status: match.status,
    anchor: match.anchor,
    hasAnchorRoom: !!firstAnchor,
  })

  const displayMinute = useFakeGameMinute(match.gameTime, isStream || isLive)
  const isSoccer = gameId === 202
  const showStats = isSoccer || (gameId != null && gameId > 200)

  const stats = buildMatchStats(match, (key) => t(key as Parameters<typeof t>[0]))

  return (
    <div
      onClick={handleClick}
      className={cn(
        "rounded-b-12 relative flex w-full shrink-0 cursor-pointer flex-col gap-3 overflow-hidden p-2 transition-opacity hover:opacity-95 max-lg:gap-2 max-sm:gap-1.5 max-sm:p-1.5",
        className
      )}
    >
      <CardBackground
        thumbnail={thumbnail}
        homeLogo={match.homeLogo}
        awayLogo={match.awayLogo}
        stadiumSrc={imgStadiumBg.src}
        stadiumClassName="opacity-50"
        stadiumExtras={<div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" />}
      />

      {/* Content above bg */}
      <div className="relative z-[2] flex flex-col gap-2 max-lg:gap-3">
        {/* Row 1: live + time + share — ẩn trên mobile */}
        <div className="flex w-full items-center justify-between max-sm:-my-1 max-sm:origin-left">
          <div className="flex items-center gap-2 max-md:scale-90 max-sm:scale-75">
            <BadgeLive label={isStream ? "Stream" : "LIVE"} />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              {displayMinute != null && displayMinute !== 0 && (
                <GameMinuteBadge minute={displayMinute} />
              )}
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                open("history")
              }}
              className="group flex h-[30px] items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-white/80 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/[0.18] hover:text-white max-sm:h-5 max-sm:gap-1 max-sm:px-1.5"
            >
              <Img
                src={icPoll}
                alt="poll"
                objectFit="contain"
                className="icon-gold size-3.5 shrink-0 transition-opacity max-sm:size-2.5"
              />
              <Typography
                as="span"
                variant="caption"
                weight="600"
                className="tracking-0 text-gold max-sm:text-10! leading-none"
              >
                Lịch sử
              </Typography>
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
        <div className="flex items-center justify-between gap-8 max-md:gap-4 max-sm:gap-2">
          {/* Home */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-6 max-md:gap-3 max-sm:gap-1.5">
            <div className="flex size-16 shrink-0 items-center justify-center max-lg:size-14 max-md:size-10 max-sm:size-8">
              <Img src={homeLogo} alt={homeName ?? ""} width={90} height={90} objectFit="contain" />
            </div>
            <Typography
              as="span"
              size="24"
              weight="600"
              className="max-lg:text-20 max-md:!text-14 max-sm:!text-10 min-w-0 truncate text-right text-white"
            >
              {homeName}
            </Typography>
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
                className="max-md:size-9 max-sm:size-7"
              />
            ) : (
              <>
                <div className="flex items-center gap-0.5">
                  <Typography
                    as="span"
                    size="60"
                    weight="700"
                    className="text-gold drop-shadow-gold-score max-lg:!text-48 max-md:!text-36 max-sm:!text-24 leading-none tabular-nums"
                  >
                    {homeScore ?? 0}
                  </Typography>
                  <Typography
                    as="span"
                    size="36"
                    weight="500"
                    className="text-gold/60 max-lg:!text-24 max-md:!text-16 max-sm:!text-14 px-0.5 leading-100"
                  >
                    :
                  </Typography>
                  <Typography
                    as="span"
                    size="60"
                    weight="700"
                    className="text-gold drop-shadow-gold-score max-lg:!text-48 max-md:!text-36 max-sm:!text-24 leading-none tabular-nums"
                  >
                    {awayScore ?? 0}
                  </Typography>
                </div>
              </>
            )}
          </div>

          {/* Away */}
          <div className="flex min-w-0 flex-1 items-center gap-6 max-md:gap-3 max-sm:gap-1.5">
            <Typography
              as="span"
              size="24"
              weight="600"
              className="max-lg:text-20 max-md:!text-14 max-sm:!text-10 min-w-0 truncate text-white"
            >
              {awayName}
            </Typography>
            <div className="flex size-16 shrink-0 items-center justify-center max-lg:size-14 max-md:size-10 max-sm:size-8">
              <Img src={awayLogo} alt={awayName ?? ""} width={90} height={90} objectFit="contain" />
            </div>
          </div>
        </div>

        {/* Row 3: stats + anchors */}
        {showStats && (
          <div className="flex items-center justify-center gap-3 max-sm:gap-1">
            <MatchStatBar stats={stats} />

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

        <LeagueTimeRow
          leagueLogo={leagueLogo}
          leagueName={leagueName}
          startTime={match.startTime}
          variant="info"
        />
      </div>
      {state.poll && (
        <PollModal
          open={state.poll}
          onOpenChange={(v) => setOpen("poll", v)}
          onSubmit={handlePollSubmit}
          activePoll={activePoll}
          onEndPoll={handleEndPoll}
        />
      )}
      <PollHistoryModal
        open={state.history}
        onOpenChange={(v) => setOpen("history", v)}
        chatroomId={match.anchorRoomVos?.[0]?.roomId ?? match.matchId}
      />
    </div>
  )
}

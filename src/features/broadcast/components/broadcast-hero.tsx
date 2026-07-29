"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Radio } from "lucide-react"

import { formatDuration } from "@/lib/date"
import { useAuth } from "@/hooks/use-auth"

import { useTranslation } from "@/i18n/use-translation"

import { fetchIsBroadcastWithTime } from "@/features/broadcast/broadcast.api"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { StreamLiveBadge } from "@/components/ui/match/parts/stream-live-badge"
import { Typography } from "@/components/ui/typography"

export function BroadcastHero() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [elapsed, setElapsed] = useState<number>(0)

  const { data } = useQuery({
    queryKey: ["is-broadcast"],
    queryFn: fetchIsBroadcastWithTime,
    staleTime: 0,
    refetchInterval: 30_000,
  })

  const streaming = data?.result?.hasLive ?? false
  const streamId = data?.result?.responseVo?.id ?? null
  // MongoDB ObjectID: 4 bytes đầu (8 hex) = Unix timestamp giây = lúc stream bắt đầu
  const streamStartMs = streamId ? parseInt(streamId.substring(0, 8), 16) * 1000 : null

  useEffect(() => {
    if (!streaming || !streamStartMs) {
      if (tickRef.current) clearInterval(tickRef.current)
      return
    }
    const update = () => setElapsed(Date.now() - streamStartMs)
    update()
    tickRef.current = setInterval(update, 1000)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [streaming, streamStartMs])

  const displayName = user?.name ?? t("broadcast.hero.fallback-name")

  return (
    <div className="card-glow rounded-16 relative overflow-hidden p-6">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-amber-400/5 blur-3xl" />

      <div className="relative flex items-center gap-5 max-sm:flex-col max-sm:text-center">
        <div className="border-gradient-gold-radiant flex h-fit w-fit shrink-0 items-center justify-center rounded-full !border-[4px] p-0.5">
          <Avatar size={90}>
            <AvatarImage src={user?.avatar} alt={displayName} />
          </Avatar>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2 max-sm:justify-center">
            <Typography variant="h3" className="text-white">
              {displayName}
            </Typography>
            <span className="rounded-4 flex items-center gap-1 bg-amber-400/15 px-2 py-0.5 text-amber-400">
              <Radio className="size-3" />
              <Typography as="span" variant="caption" weight="600" className="text-inherit">
                {t("broadcast.hero.role")}
              </Typography>
            </span>
          </div>

          <Typography variant="body-sm" className="text-muted">
            {t("broadcast.hero.subtitle")}
          </Typography>
        </div>

        {streaming ? (
          <div className="flex items-end gap-2 max-sm:mx-auto max-sm:items-center">
            <StreamLiveBadge label={t("broadcast.hero.channel")} />
            {elapsed > 0 && (
              <span className="rounded-6 bg-white/8 px-2 py-0.5">
                <Typography size="13" weight="600" className="font-mono text-amber-300">
                  {formatDuration(elapsed)}
                </Typography>
              </span>
            )}
          </div>
        ) : (
          <span className="rounded-4 flex items-center gap-1.5 bg-white/5 px-2.5 py-1 max-sm:mx-auto">
            <span className="size-1.5 rounded-full bg-white/30" />
            <Typography variant="caption" className="text-white/50">
              {t("broadcast.stream-settings.status.idle")}
            </Typography>
          </span>
        )}
      </div>
    </div>
  )
}

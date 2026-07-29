"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, Copy, Eye, EyeOff, RefreshCw } from "lucide-react"

import { cn } from "@/lib/utils"

import { useTranslation } from "@/i18n/use-translation"

import { downcastStream, type CreateAnchorLiveResult } from "@/features/broadcast/broadcast.api"
import { useStreamStatus } from "@/features/broadcast/hooks/use-stream-status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Typography } from "@/components/ui/typography"

import { BroadcastStreamPanelSkeleton } from "./skeleton"

export function StreamField({
  label,
  value,
  masked = false,
}: {
  label: string
  value: string
  masked?: boolean
}) {
  const [visible, setVisible] = useState(!masked)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Typography variant="caption" weight="500" className="text-muted">
        {label}
      </Typography>
      <Input
        readOnly
        value={value}
        placeholder="—"
        className={cn("font-mono", masked && !visible && "blur-sm select-none")}
        rightIcon={
          <div className="flex items-center gap-0.5">
            {masked && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setVisible((v) => !v)}
                className="text-white/40 hover:bg-white/8 hover:text-white"
              >
                {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              className="text-white/40 hover:bg-white/8 hover:text-white"
            >
              {copied ? (
                <Check className="size-3.5 text-green-400" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
          </div>
        }
      />
    </div>
  )
}

export function StreamPanel() {
  const { t } = useTranslation()
  const { streaming, liveUrlItem, isFetching, isLoading, invalidate } = useStreamStatus()

  const { data: liveResult = null } = useQuery<CreateAnchorLiveResult | null>({
    queryKey: ["live-result"],
    queryFn: () => null,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  async function handleRefresh() {
    await invalidate()
    toast.success(t("broadcast.stream-panel.refresh-success"))
  }

  if (isLoading) {
    return <BroadcastStreamPanelSkeleton />
  }

  if (!streaming) return null

  return (
    <div className="card-glow rounded-12 flex flex-col gap-5 p-5">
      <div className="flex items-center justify-between">
        <Typography variant="h5" className="text-white">
          {t("broadcast.stream-panel.title")}
        </Typography>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={!streaming}
          className="rounded-8 text-12 font-500 bg-white/5 px-3 py-1.5 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          {t("broadcast.stream-panel.refresh")}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <StreamField
          label={t("broadcast.stream-panel.fields.rtmp-url")}
          value={liveResult?.rtmpPushUrl ?? ""}
        />
        <StreamField
          label={t("broadcast.stream-panel.fields.stream-key")}
          value={liveResult?.streamingKey ?? ""}
          masked
        />
        {liveUrlItem && (
          <>
            <StreamField
              label={t("broadcast.stream-panel.fields.live-url-hls")}
              value={liveUrlItem.liveUrl ?? ""}
            />
            <StreamField
              label={t("broadcast.stream-panel.fields.live-url-flv")}
              value={liveUrlItem.liveUrlFlv ?? ""}
            />
          </>
        )}
      </div>

      {streaming && (
        <Button
          type="button"
          variant="gradient"
          className="w-full"
          onClick={async () => {
            if (!liveResult?.id) return
            await downcastStream(liveResult.id)
            invalidate()
          }}
        >
          {t("broadcast.stream-settings.actions.end-stream")}
        </Button>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n"
import { Img } from "@/components/ui/image"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/typography"
import type { ChatMessage, UserRole } from "../types"
import { ChatAvatar } from "./chat-avatar"
import { RoleBadge } from "./role-badge"

import imgBlacklist from "@assets/images/chat/img-blacklist.png"
import imgCrown from "@assets/images/chat/img-crown.png"
import imgPin from "@assets/images/chat/img-pin.png"
import imgRemove from "@assets/images/chat/img-remove.png"
import imgRestriction from "@assets/images/chat/img-restriction.png"

export function UserPopup({
  message,
  isPinned,
  onClose,
  onReport,
  onDelete,
  onPin,
  onUnpin,
  onBanRoom,
  onBanAll,
}: {
  message: ChatMessage
  userRole: UserRole
  isPinned: boolean
  onClose: () => void
  onReport?: (msg: ChatMessage, type: number) => void
  onDelete?: (msg: ChatMessage) => void
  onPin?: (msg: ChatMessage) => void
  onUnpin?: (msg: ChatMessage) => void
  onBanRoom?: (msg: ChatMessage, mute: boolean) => void
  onBanAll?: (msg: ChatMessage, mute: boolean) => void
  onSetManager?: (msg: ChatMessage, set: boolean) => void
}) {
  const { t } = useTranslation()
  const [reportType, setReportType] = useState(0)

  const REPORT_TYPES = [
    t("chat.report.types.speech"),
    t("chat.report.types.attack"),
    t("chat.report.types.nickname"),
    t("chat.report.types.ad"),
    t("chat.report.types.avatar"),
    t("chat.report.types.spam"),
  ]

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="panel-news sm:rounded-16 relative z-10 w-full max-w-[600px] overflow-hidden rounded-t-2xl"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="relative shrink-0">
            {message.hasAnchorMe && (
              <div className="border-gold/70 absolute -top-1 -right-0.5 z-10 flex size-6 items-center justify-center rounded-full border-[0.5px] bg-black/80">
                <Img src={imgCrown} alt="crown" width={13} height={13} objectFit="contain" />
              </div>
            )}
            <ChatAvatar message={message} size={64} />
          </div>
          <div className="min-w-0 flex-1">
            <Typography variant="body" weight="700" className="truncate text-white">
              {message.userName}
            </Typography>
            <RoleBadge message={message} t={t} />
          </div>
        </div>

        {/* Quote */}
        <div className="rounded-8 mx-5 mb-3 bg-white/[0.03] px-4 py-3">
          <Typography
            size="10"
            weight="500"
            className="mb-1.5 tracking-widest text-white/30 uppercase"
          >
            {t("chat.report.title")}
          </Typography>
          <div
            className="max-h-[120px] overflow-y-auto pr-1"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
          >
            <Typography variant="body-sm" className="leading-relaxed text-white/60">
              {message.content.replace(/<[^>]*>/g, "")}
            </Typography>
          </div>
        </div>

        {/* Message thường → report */}
        {!(message.hasAnchorMe || message.hasFictitious) && (
          <>
            <div className="flex flex-col p-2">
              {REPORT_TYPES.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setReportType(i)}
                  className={cn(
                    "font-500 rounded-4 mb-1 flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors",
                    reportType === i
                      ? "bg-danger/8 text-danger"
                      : "text-white/55 hover:bg-white/[0.03] hover:text-white/80"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                      reportType === i ? "border-danger bg-danger/20" : "border-white/20"
                    )}
                  >
                    {reportType === i && <span className="bg-danger block size-1 rounded-full" />}
                  </span>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex w-full gap-3 px-5 py-4">
              <Button variant="cancel" className="flex-1" onClick={onClose}>
                {t("chat.cancel")}
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={() => {
                  onReport?.(message, reportType)
                  onClose()
                }}
              >
                {t("chat.report.submit")}
              </Button>
            </div>
          </>
        )}

        {/* BLV/Admin message (hasAnchorMe || hasFictitious) → action buttons */}
        {(message.hasAnchorMe || message.hasFictitious) && (
          <div className="flex flex-col border-t border-white/[0.06] py-1">
            {[
              {
                icon: imgBlacklist,
                label: t("chat.actions.ban-all"),
                onClick: () => {
                  onBanAll?.(message, true)
                  onClose()
                },
                show: true,
                danger: true,
              },
              {
                icon: imgRestriction,
                label: t("chat.actions.ban-room"),
                onClick: () => {
                  onBanRoom?.(message, true)
                  onClose()
                },
                show: true,
                danger: true,
              },
              {
                icon: imgRemove,
                label: t("chat.actions.delete"),
                onClick: () => {
                  onDelete?.(message)
                  onClose()
                },
                show: true,
                danger: true,
              },
              {
                icon: imgPin,
                label: isPinned ? t("chat.actions.unpin") : t("chat.actions.pin"),
                onClick: () => {
                  if (isPinned) onUnpin?.(message)
                  else onPin?.(message)
                  onClose()
                },
                show: message.hasFictitious,
                pinned: isPinned,
              },
            ]
              .filter((a) => a.show)
              .map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
                >
                  <Img
                    src={action.icon}
                    alt=""
                    width={28}
                    height={28}
                    objectFit="contain"
                    className={action.pinned === false ? "opacity-40" : undefined}
                  />
                  <span
                    className={cn(
                      "text-14 font-500",
                      action.pinned
                        ? "text-gold"
                        : action.danger
                          ? "text-white/80"
                          : "text-white/80"
                    )}
                  >
                    {action.label}
                  </span>
                </button>
              ))}
          </div>
        )}

        {/* Safe area bottom — mobile */}
        <div className="h-safe-area-bottom sm:hidden" />
      </div>
    </div>,
    document.body
  )
}

"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Bookmark, Calendar, CalendarDays, Mail, Phone, Send, ShieldCheck } from "lucide-react"

import { formatCount } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

import { useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"

import { handleFollowUser } from "@/features/news/news.api"
import { UserRoleEnum } from "@/features/user-info/user-info.constants"
import type { UserInfoModel } from "@/features/user-info/user-info.models"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Img } from "@/components/ui/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import icMic from "@assets/icons/match/ic-mic.svg"
import imgUserCardBg from "@assets/images/common/img-user-card-bg.png"
import imgUserCardHeroBg from "@assets/images/common/img-user-card-hero-bg.png"

import { USER_CARD_STATS } from "../search.constants"

interface UserCardProps {
  user: UserInfoModel
}

function isFollowed(v: UserInfoModel["hasFollow"]): boolean {
  return v === true || v === 1 || v === "1" || v === "true"
}

function patchFollowInRecords<T extends { userId?: unknown; uid?: unknown; anchorId?: unknown }>(
  records: T[] | undefined,
  targetId: string,
  isFollow: boolean,
  field: "hasFollow" | "isAttention"
): T[] | undefined {
  if (!records) return records
  return records.map((item) => {
    const id = String(item.userId ?? item.uid ?? item.anchorId ?? "")
    if (id !== targetId) return item
    return { ...item, [field]: isFollow }
  })
}

/** Keep search list cache in sync so remounting tabs does not reset follow UI. */
function syncSearchFollowCache(
  queryClient: ReturnType<typeof useQueryClient>,
  targetId: string,
  isFollow: boolean
) {
  queryClient.setQueriesData({ queryKey: ["search-users"] }, (old: unknown) => {
    if (!old || typeof old !== "object") return old
    const page = old as { records?: UserInfoModel[] }
    if (!("records" in page)) return old
    return { ...page, records: patchFollowInRecords(page.records, targetId, isFollow, "hasFollow") }
  })

  queryClient.setQueriesData({ queryKey: ["search-users-infinite"] }, (old: unknown) => {
    if (!old || typeof old !== "object" || !("pages" in old)) return old
    const infinite = old as { pages: Array<{ records?: UserInfoModel[] }> }
    return {
      ...infinite,
      pages: infinite.pages.map((page) => ({
        ...page,
        records: patchFollowInRecords(page.records, targetId, isFollow, "hasFollow"),
      })),
    }
  })

  queryClient.setQueriesData({ queryKey: ["search-anchors"] }, (old: unknown) => {
    if (!old || typeof old !== "object") return old
    const page = old as { records?: Array<{ anchorId?: unknown; isAttention?: boolean }> }
    if (!("records" in page)) return old
    return {
      ...page,
      records: patchFollowInRecords(page.records, targetId, isFollow, "isAttention"),
    }
  })

  queryClient.setQueriesData({ queryKey: ["search-anchors-infinite"] }, (old: unknown) => {
    if (!old || typeof old !== "object" || !("pages" in old)) return old
    const infinite = old as {
      pages: Array<{ records?: Array<{ anchorId?: unknown; isAttention?: boolean }> }>
    }
    return {
      ...infinite,
      pages: infinite.pages.map((page) => ({
        ...page,
        records: patchFollowInRecords(page.records, targetId, isFollow, "isAttention"),
      })),
    }
  })
}

export function UserCard({ user }: UserCardProps) {
  const { t, locale } = useTranslation()
  const { isLoggedIn, login } = useAuth()
  const queryClient = useQueryClient()
  const routes = getRoutes(locale)
  const userId = user.userId ?? user.uid
  const userKey = userId != null ? String(userId) : null

  const serverFollowing = isFollowed(user.hasFollow)
  // Optimistic override keyed by user id so remount/refetch can fall back to props/cache.
  const [optimisticFollow, setOptimisticFollow] = useState<{
    id: string
    value: boolean
  } | null>(null)
  const following =
    optimisticFollow && userKey && optimisticFollow.id === userKey
      ? optimisticFollow.value
      : serverFollowing
  const [followLoading, setFollowLoading] = useState(false)

  function toggleFollow() {
    if (!isLoggedIn) {
      login()
      return
    }
    if (followLoading || userKey == null) return
    const next = !following
    handleFollowUser({
      userId: Number(userKey),
      isFollow: next,
      setFollowing: (value) => {
        setOptimisticFollow({ id: userKey, value })
        if (value === next) syncSearchFollowCache(queryClient, userKey, next)
      },
      setLoading: setFollowLoading,
    })
  }

  const isBlv = user.role === UserRoleEnum.BLV
  const isAdmin = user.role === UserRoleEnum.ADMIN
  const phone = user.mobile ? [user.areaCode, user.mobile].filter(Boolean).join(" ") : null
  const na = t("search.user-card.na")
  const stats = USER_CARD_STATS.map((cfg) => ({
    ...cfg,
    label: t(cfg.labelKey),
    value: user[cfg.key] ?? 0,
  }))
  const metaRows = [
    {
      icon: CalendarDays,
      label: t("search.user-card.registration-days"),
      value: user.registrationDays ?? na,
    },
    {
      icon: Calendar,
      label: t("search.user-card.join-date"),
      value: user.registerDate ?? user.expirationDate ?? na,
    },
  ]

  return (
    <div className="card-glow rounded-12 shadow-card hover:shadow-card-hover relative flex w-full flex-col overflow-hidden transition-shadow">
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-15"
        style={{ backgroundImage: `url(${imgUserCardBg.src})` }}
      />

      <div className="relative z-10 flex flex-col gap-3 p-3 pt-0 max-sm:gap-2.5 max-sm:p-2.5 max-sm:pt-0">
        <div
          className="relative -mx-3 flex items-center gap-3 px-3 py-10 pb-8 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-12 after:bg-gradient-to-b after:from-transparent after:to-black/70 max-sm:-mx-2.5 max-sm:gap-2.5 max-sm:px-2.5 max-sm:py-8 max-sm:pb-6"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%), url(${imgUserCardHeroBg.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {isBlv ? (
            <div className="relative shrink-0">
              <Avatar
                size={92}
                className="ring-live-green shrink-0 shadow-[0_0_16px_rgba(0,0,0,0.9),0_0_8px_rgba(0,200,100,0.3)] ring-2"
              >
                <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
              </Avatar>
              <div className="bg-live-green-bg shadow-live-green-glow absolute -right-1.5 -bottom-1.5 flex size-8 items-center justify-center rounded-full">
                <Img src={icMic} alt="mic" width={34} height={34} />
              </div>
            </div>
          ) : isAdmin ? (
            <div className="relative shrink-0">
              <Avatar
                size={92}
                className="shrink-0 shadow-[0_0_16px_rgba(0,0,0,0.9),0_0_8px_rgba(248,113,113,0.3)] ring-2 ring-red-400/80"
              >
                <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
              </Avatar>
              <div className="absolute -right-1.5 -bottom-1.5 flex size-8 items-center justify-center rounded-full bg-red-500/20 shadow-[0_0_8px_rgba(248,113,113,0.4)] backdrop-blur-sm">
                <ShieldCheck className="size-4 text-red-400" />
              </div>
            </div>
          ) : (
            <div className="border-gradient-gold-radiant flex items-center justify-center rounded-full p-[2px]">
              <Avatar size={92} className="shrink-0">
                <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
              </Avatar>
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {isBlv && (
              <div className="border-live-green/70 bg-live-green-bg shadow-live-green-glow flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 backdrop-blur-2xl">
                <Img src={icMic} alt="mic" width={14} height={14} />
                <span className="text-10 font-700 text-live-green drop-shadow-live-green leading-none uppercase">
                  {t("search.user-card.badge-stream")}
                </span>
              </div>
            )}
            {isAdmin && (
              <div className="flex w-fit items-center gap-1 rounded-full border border-red-400/70 bg-red-500/15 px-2 py-0.5 backdrop-blur-2xl">
                <ShieldCheck className="size-2.5 text-red-400" />
                <span className="text-10 font-700 leading-none text-red-400 uppercase">
                  {t("search.user-card.badge-admin")}
                </span>
              </div>
            )}
            <div className="flex min-w-0 items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="min-w-0">
                    <Typography variant="h4" className="truncate leading-none text-white">
                      {user.name}
                    </Typography>
                  </TooltipTrigger>
                  <TooltipContent>{user.name}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {user.email && (
              <div className="flex min-w-0 items-center gap-1">
                <Mail className="size-3 shrink-0 text-amber-400" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="min-w-0">
                      <Typography variant="caption" className="truncate text-white">
                        {user.email}
                      </Typography>
                    </TooltipTrigger>
                    <TooltipContent>{user.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {phone && (
              <div className="flex min-w-0 items-center gap-1">
                <Phone className="size-3 shrink-0 text-amber-400" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="min-w-0">
                      <Typography variant="caption" className="truncate text-white">
                        {phone}
                      </Typography>
                    </TooltipTrigger>
                    <TooltipContent>{phone}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>

        {/* Stats — 4 cols */}
        <div className="rounded-8 flex items-center bg-white/5 py-3 backdrop-blur-[5px] max-sm:py-2.5">
          {stats.map(({ label, value, icon: Icon, color }, i) => (
            <div key={label} className="flex flex-1 items-center">
              {i > 0 && <div className="h-8 w-px shrink-0 bg-white/5 max-sm:h-6" />}
              <div className="flex flex-1 flex-col items-center gap-1.5 py-0 max-sm:gap-1">
                <Icon className={`size-5 max-sm:size-4 ${color}`} />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Typography
                        size="14"
                        weight="700"
                        className="max-sm:text-12! leading-none text-white tabular-nums"
                      >
                        {formatCount(value)}
                      </Typography>
                    </TooltipTrigger>
                    <TooltipContent>
                      {label}: {value}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 max-sm:gap-1.5">
          <a href={userId != null ? routes.userInfo(userId) : undefined} className="contents">
            <Button variant="cancel" className="text-13 max-sm:text-12 w-full gap-1.5">
              <Send className="size-3.5 max-sm:size-3" />
              {t("search.user-card.get-in-touch")}
            </Button>
          </a>
          <Button
            variant={following ? "cancel" : "gradient"}
            className="text-13 max-sm:text-12 w-full gap-1.5"
            disabled={followLoading}
            onClick={toggleFollow}
          >
            <Bookmark className="size-3.5 max-sm:size-3" />
            {following ? t("search.user-card.following") : t("search.user-card.follow")}
          </Button>
        </div>

        {/* Registration info */}
        <div className="rounded-8 flex items-center bg-white/5 py-3 backdrop-blur-[5px] max-sm:py-2.5">
          {metaRows.map(({ icon: Icon, label, value }, i) => (
            <div key={label} className="flex flex-1 items-center">
              {i > 0 && <div className="h-8 w-px shrink-0 bg-white/5 max-sm:h-6" />}
              <div className="flex flex-1 flex-col items-center gap-2 max-sm:gap-1.5">
                <Icon className="size-5 text-amber-400 max-sm:size-4" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Typography
                        size="12"
                        weight="600"
                        className="max-sm:text-10! leading-none text-white"
                      >
                        {value}
                      </Typography>
                    </TooltipTrigger>
                    <TooltipContent>
                      {label}: {value}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function UserCardSkeleton() {
  return (
    <div className="card-glow rounded-12 shadow-card hover:shadow-card-hover relative flex w-full flex-col overflow-hidden transition-shadow">
      <div className="relative z-10 flex flex-col gap-3 p-3 pt-0 max-sm:gap-2.5 max-sm:p-2.5 max-sm:pt-0">
        <div className="-mx-3 flex items-center gap-3 px-3 py-10 pb-8 max-sm:-mx-2.5 max-sm:gap-2.5 max-sm:px-2.5 max-sm:py-8 max-sm:pb-6">
          <div className="shrink-0 rounded-full border border-white/20 p-[2px]">
            <Skeleton className="size-[92px] rounded-full max-sm:size-[72px]" />
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <Skeleton className="h-6 w-32 max-sm:h-5 max-sm:w-28" />
            <Skeleton className="mt-1 h-3 w-40 max-sm:w-32" />
            <Skeleton className="h-3 w-28 max-sm:w-24" />
          </div>
        </div>
        <div className="rounded-8 flex items-center bg-white/5 py-3 backdrop-blur-[5px] max-sm:py-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-1 items-center">
              {i > 0 && <div className="h-8 w-px shrink-0 bg-white/5 max-sm:h-6" />}
              <div className="flex flex-1 flex-col items-center gap-1.5 max-sm:gap-1">
                <Skeleton className="size-5 rounded max-sm:size-4" />
                <Skeleton className="h-4 w-6 max-sm:h-3" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 max-sm:gap-1.5">
          <Skeleton className="h-9 rounded-full max-sm:h-8" />
          <Skeleton className="h-9 rounded-full max-sm:h-8" />
        </div>
        <div className="rounded-8 flex items-center bg-white/5 py-3 backdrop-blur-[5px] max-sm:py-2.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex flex-1 items-center">
              {i > 0 && <div className="h-8 w-px shrink-0 bg-white/5 max-sm:h-6" />}
              <div className="flex flex-1 flex-col items-center gap-2 max-sm:gap-1.5">
                <Skeleton className="size-5 rounded max-sm:size-4" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

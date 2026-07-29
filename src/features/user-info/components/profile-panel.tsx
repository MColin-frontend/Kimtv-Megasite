"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

import { getLoginUserIdFromUser } from "@/lib/auth-cookie"
import { formatCount } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

import { useTranslation } from "@/i18n"

import { handleFollowUser } from "@/features/news/news.api"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Img } from "@/components/ui/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import { useUserContent } from "../hooks/use-user-content"
import { useUserInfo } from "../hooks/use-user-info"
import { useVipBadge } from "../hooks/use-vip-badge"
import { USER_INFO_STAT_ITEMS } from "../user-info.constants"
import type { UserInfoModel } from "../user-info.models"
import { ProfilePanelSkeleton } from "./skeleton"

function isFollowed(v: UserInfoModel["hasFollow"]): boolean {
  return v === true || v === 1 || v === "1" || v === "true"
}

export function UserInfoProfilePanel() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { user, isLoggedIn, login } = useAuth()
  const loginUserId = getLoginUserIdFromUser(user) ?? ""

  const { data: userInfo, isLoading } = useUserInfo(id, loginUserId)
  const { data: articleData } = useUserContent(id, "article", 1, loginUserId)
  const { data: videoData } = useUserContent(id, "video", 1, loginUserId)
  const { data: vipBadge } = useVipBadge(id)

  const [following, setFollowing] = useState(() => isFollowed(userInfo?.hasFollow))
  const [followLoading, setFollowLoading] = useState(false)

  const currentUserId =
    user?.userId != null ? String(user.userId) : user?.uid ? String(user.uid) : undefined

  const stats = {
    articleTotal: articleData?.total ?? null,
    videoTotal: videoData?.total ?? null,
    followerCount: userInfo?.followerCount ?? null,
    registrationDays: userInfo?.registrationDays ?? null,
  }

  const profileId = userInfo?.userId ?? userInfo?.uid
  const isSelf = currentUserId && profileId && String(currentUserId) === String(profileId)
  const showFollow = !isSelf && profileId != null

  function toggle() {
    if (!isLoggedIn) {
      login()
      return
    }
    if (followLoading) return
    handleFollowUser({
      userId: Number(profileId),
      isFollow: !following,
      setFollowing,
      setLoading: setFollowLoading,
    })
  }

  if (isLoading) return <ProfilePanelSkeleton />

  const statBar = (
    <div className="rounded-8 card-glow grid w-fit grid-cols-4 gap-0 px-2 py-2">
      {USER_INFO_STAT_ITEMS.map(({ statKey, icon: Icon, labelKey, suffixKey }, i) => {
        const value = stats[statKey]
        const suffix = suffixKey ? t(suffixKey) : ""
        return (
          <div key={statKey} className="flex items-center">
            {i > 0 && <div className="mr-1 h-10 w-px shrink-0 bg-white/30" />}
            <div className="flex flex-1 flex-col items-center gap-1 px-2">
              <div className="flex items-center gap-2">
                <Icon className="size-5 shrink-0 text-[#ffd220]/80" />
                <Typography variant="h5" as="span" className="text-white tabular-nums">
                  {value != null ? `${formatCount(value)}${suffix}` : "—"}
                </Typography>
              </div>
              <Typography variant="body-sm" weight="500" className="text-center text-white/60">
                {t(labelKey)}
              </Typography>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-10 max-md:flex-col max-md:items-center max-md:gap-4">
        <div className="border-gradient-gold-radiant flex h-fit w-fit items-center justify-center rounded-full transition-all">
          <Avatar size={140} className="shrink-0 max-md:size-[90px]">
            <AvatarImage src={userInfo?.avatar} alt={userInfo?.name ?? ""} />
          </Avatar>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div>
            <div className="flex items-center gap-3 max-md:flex-wrap max-md:justify-center">
              <Typography size="48" weight="700" className="max-md:text-30">
                {userInfo?.name ?? "—"}
              </Typography>
              {userInfo?.vip99Icon && (
                <Img
                  src={userInfo.vip99Icon}
                  alt="VIP"
                  width={80}
                  height={40}
                  objectFit="contain"
                  className="!h-10 !w-auto shrink-0"
                />
              )}
              {vipBadge?.badgeIcon && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="shrink-0">
                      <Img
                        src={vipBadge.badgeIcon}
                        alt={vipBadge.badgeName ?? "VIP"}
                        width={32}
                        height={32}
                        objectFit="contain"
                      />
                    </div>
                  </TooltipTrigger>
                  {vipBadge.badgeName && <TooltipContent>{vipBadge.badgeName}</TooltipContent>}
                </Tooltip>
              )}
              {showFollow && (
                <Button
                  variant={following ? "outline" : "gradient"}
                  onClick={toggle}
                  disabled={followLoading}
                >
                  {following ? t("common.user-info.following") : t("common.user-info.follow")}
                </Button>
              )}
            </div>

            <Typography variant="body-lg" className="max-md:text-14 mt-1 text-white/60">
              {userInfo?.description ? (
                userInfo?.description
              ) : userInfo?.adminId ? (
                <>
                  {t("common.user-info.fallback-bio1")}
                  <br />
                  {t("common.user-info.fallback-bio2")}
                </>
              ) : null}
            </Typography>
          </div>

          {/* Stats — desktop only inline */}
          <div className="mt-4 max-md:hidden">{statBar}</div>
        </div>
      </div>

      {/* Stats — mobile full width below */}
      <div className="hidden max-md:block">{statBar}</div>
    </div>
  )
}

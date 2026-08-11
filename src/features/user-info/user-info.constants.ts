import { CalendarDays, FileText, Heart, Video } from "lucide-react"

import type { TranslationKey } from "@/i18n/use-translation"

export enum UserRoleEnum {
  USER = "user",
  ADMIN = "admin",
  BLV = "blv",
}

export enum UserInfoTabEnum {
  ALL = "all",
  NEWS = "news",
  VIDEO = "video",
}

export const USER_INFO_TABS = [
  { key: UserInfoTabEnum.ALL, labelKey: "common.user-info.tabs.all" satisfies TranslationKey },
  { key: UserInfoTabEnum.NEWS, labelKey: "common.user-info.tabs.news" satisfies TranslationKey },
  { key: UserInfoTabEnum.VIDEO, labelKey: "common.user-info.tabs.video" satisfies TranslationKey },
] as const

export type UserInfoTabType = (typeof USER_INFO_TABS)[number]["key"]

export const USER_INFO_STAT_ITEMS = [
  {
    statKey: "articleTotal" as const,
    icon: FileText,
    labelKey: "common.user-info.stats.articles" satisfies TranslationKey,
    suffixKey: null,
  },
  {
    statKey: "videoTotal" as const,
    icon: Video,
    labelKey: "common.user-info.stats.videos" satisfies TranslationKey,
    suffixKey: null,
  },
  {
    statKey: "followerCount" as const,
    icon: Heart,
    labelKey: "common.user-info.stats.followers" satisfies TranslationKey,
    suffixKey: null,
  },
  {
    statKey: "registrationDays" as const,
    icon: CalendarDays,
    labelKey: "common.user-info.stats.joined" satisfies TranslationKey,
    suffixKey: "common.user-info.stats.joined-suffix" satisfies TranslationKey,
  },
] as const

export const USER_INFO_API = {
  PROFILE: "/user/info",
  VIP_BADGE: "/vip/badge",
  CONTENT: (userId: string | number, type: "article" | "video", page: number) =>
    `/user/${userId}/${type}/${page}`,
} as const

export function tabToApiType(tab: UserInfoTabType): "article" | "video" {
  return tab === UserInfoTabEnum.VIDEO ? "video" : "article"
}

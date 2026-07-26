import { BookOpen, CalendarClock, Mic2, Settings2 } from "lucide-react"
import { z } from "zod"

import type { TranslationKey } from "@/i18n/use-translation"

import type { SelectOption } from "@/components/ui/select/select"

import type { BroadcastMatchGroup } from "./broadcast.api"

export enum LiveModeEnum {
  MATCH = "match",
  FREE = "free",
}

export enum StreamTypeEnum {
  HOST = "host",
  ANCHOR = "anchor",
  BOT = "bot",
}

export enum LoginRequiredEnum {
  NO = "0",
  YES = "1",
  COIN = "2",
  LEVEL = "3",
}

export enum ExternalCommentEnum {
  NONE = "0",
  CONNECTED = "1",
}

export enum ScheduledEnum {
  NO = "no",
  YES = "yes",
}

export enum SportEnum {
  SOCCER = "202",
  BASKETBALL = "201",
  CRICKET = "210",
  TENNIS = "211",
  SNOOKER = "204",
  BASEBALL = "213",
  FOOTBALL = "217",
  VOLLEYBALL = "214",
  TABLE_TENNIS = "216",
  BADMINTON = "215",
  COMPREHENSIVE = "200",
}

export enum LeagueEnum {
  PREMIER = "premier",
  LALIGA = "laliga",
  UCL = "ucl",
}

export enum LiveStatusEnum {
  LIVE = "live",
}

export enum MatchStatusBroadcastEnum {
  UPCOMING = "1",
  LIVE = "2",
  FINISHED = "3",
  CANCELLED = "4",
  POSTPONED = "5",
}

export enum CustomBroadcastTypeEnum {
  CUSTOM_LIVE = "1",
}

export enum BroadcastStepEnum {
  CREATED = "created",
  RESERVATION = "reservation",
  STREAMING = "streaming",
}

type T = (key: TranslationKey) => string

export const LEAGUE_OPTIONS = [
  { value: LeagueEnum.PREMIER, label: "Premier League" },
  { value: LeagueEnum.LALIGA, label: "La Liga" },
  { value: LeagueEnum.UCL, label: "Champions League" },
]

export const getScheduledOptions = (t: T) => [
  { value: ScheduledEnum.NO, label: t("broadcast.stream-settings.options.no") },
  { value: ScheduledEnum.YES, label: t("broadcast.stream-settings.options.yes") },
]

export const getLiveModeOptions = (t: T) => [
  { value: LiveModeEnum.MATCH, label: t("broadcast.stream-settings.options.live-mode.match") },
  { value: LiveModeEnum.FREE, label: t("broadcast.stream-settings.options.live-mode.free") },
]

export const getSportOptions = (t: T) => [
  { value: SportEnum.SOCCER, label: t("broadcast.stream-settings.options.sport.soccer") },
]

export const getLiveStatusOptions = (t: T) => [
  { value: LiveStatusEnum.LIVE, label: t("broadcast.stream-settings.options.live-status.live") },
]

export const getStreamTypeOptions = (t: T) => [
  {
    value: StreamTypeEnum.ANCHOR,
    label: t("broadcast.stream-settings.options.stream-type.anchor"),
  },
  { value: StreamTypeEnum.BOT, label: t("broadcast.stream-settings.options.stream-type.bot") },
]

export const getLoginRequiredOptions = (t: T) => [
  { value: LoginRequiredEnum.NO, label: t("broadcast.stream-settings.options.login-required.no") },
  {
    value: LoginRequiredEnum.YES,
    label: t("broadcast.stream-settings.options.login-required.yes"),
  },
  {
    value: LoginRequiredEnum.COIN,
    label: t("broadcast.stream-settings.options.login-required.coin"),
  },
  {
    value: LoginRequiredEnum.LEVEL,
    label: t("broadcast.stream-settings.options.login-required.level"),
  },
]

export const getExternalCommentOptions = (t: T) => [
  {
    value: ExternalCommentEnum.NONE,
    label: t("broadcast.stream-settings.options.external-comment.none"),
  },
  {
    value: ExternalCommentEnum.CONNECTED,
    label: t("broadcast.stream-settings.options.external-comment.connected"),
  },
]

/* ── Match convert ────────────────────────────────────────── */

/**
 * Convert API response → flat SelectOption[]
 * @param leagueId - nếu truyền vào thì chỉ lấy matches của league đó
 */
export function convertMatchGroupsToOptions(
  groups: BroadcastMatchGroup[],
  leagueId?: string,
  statusFilter?: string
): SelectOption[] {
  const byLeague = leagueId ? groups.filter((g) => String(g.leagueId) === leagueId) : groups
  return byLeague.flatMap((group) =>
    group.list
      .filter((m) => !statusFilter || String(m.status) === statusFilter)
      .map((m) => ({
        value: String(m.matchId),
        label:
          (m.anchorName ?? [m.homeName, m.awayName].filter(Boolean).join(" vs ")) ||
          `#${m.matchId}`,
      }))
  )
}

/** Convert API response → league SelectOption[] (leagueId + leagueName) */
export function convertMatchGroupsToLeagueOptions(groups: BroadcastMatchGroup[]): SelectOption[] {
  return groups.map((group) => ({
    value: String(group.leagueId),
    label: group.leagueName,
  }))
}

export const getMatchStatusOptions = (t: T) => [
  {
    value: MatchStatusBroadcastEnum.UPCOMING,
    label: t("broadcast.stream-settings.options.match-status.upcoming"),
  },
  {
    value: MatchStatusBroadcastEnum.LIVE,
    label: t("broadcast.stream-settings.options.match-status.live"),
  },
]

export const getCustomBroadcastTypeOptions = (t: T) => [
  {
    value: CustomBroadcastTypeEnum.CUSTOM_LIVE,
    label: t("broadcast.stream-settings.options.custom-type.custom-live"),
  },
]

/* ── Stream settings form defaults ───────────────────────── */

export const STREAM_SETTINGS_DEFAULTS = {
  intro: "",
  introDetail: "",
  images: [] as string[],
  announcement: "",
  title: "",
  scheduled: false,
  scheduledAt: null,
  liveMode: LiveModeEnum.MATCH,
  sport: SportEnum.SOCCER,
  league: "",
  leagueName: "",
  match: "",
  matchName: "",
  matchStatus: MatchStatusBroadcastEnum.LIVE,
  customType: CustomBroadcastTypeEnum.CUSTOM_LIVE,
  streamType: StreamTypeEnum.ANCHOR,
  loginRequired: LoginRequiredEnum.COIN,
  externalComment: ExternalCommentEnum.NONE,
  rtmpPushUrl: "",
  streamingKey: "",
  m3u8Url: "",
  liveUrlList: [] as {
    liveUrl: string
    liveUrlFlv: string
    liveUrlRtmp: string
    language: string
  }[],
}

/* ── API value maps ───────────────────────────────────────── */

export function reverseEnum<T extends string>(
  map: Record<string, number>,
  val: number | null,
  fallback: T
): T {
  return (Object.entries(map).find(([, v]) => v === val)?.[0] as T) ?? fallback
}

// Reference API: ANCHOR→1, HOST→2, BOT→3
export const STREAM_TYPE_MAP: Record<string, number> = {
  [StreamTypeEnum.ANCHOR]: 1,
  [StreamTypeEnum.HOST]: 2,
  [StreamTypeEnum.BOT]: 3,
}

// Reference API: LIVE→1, UPCOMING→2, FINISHED→3, CANCELLED→4, POSTPONED→5
export const MATCH_STATUS_MAP: Record<string, number> = {
  [MatchStatusBroadcastEnum.LIVE]: 1,
  [MatchStatusBroadcastEnum.UPCOMING]: 2,
  [MatchStatusBroadcastEnum.FINISHED]: 3,
  [MatchStatusBroadcastEnum.CANCELLED]: 4,
  [MatchStatusBroadcastEnum.POSTPONED]: 5,
}

// Reference API: NO→0, COIN→1, YES→2, LEVEL→3
export const VIEWSTYLE_MAP: Record<string, number> = {
  [LoginRequiredEnum.NO]: 0,
  [LoginRequiredEnum.COIN]: 1,
  [LoginRequiredEnum.YES]: 2,
  [LoginRequiredEnum.LEVEL]: 3,
}

/* ── Broadcast guide ──────────────────────────────────────── */

const CDN = "https://kimtv-oss.99kimtvs.top/static"

const GUIDE_IMAGES = {
  step1: [`${CDN}/live001.png`],
  step2: [
    `${CDN}/live002.png`,
    "https://kimtv-oss.99kimtvs.top/advertise/banner1663813550000.jpg",
    `${CDN}/live003.png`,
  ],
  step3: [`${CDN}/live004.png`],
  step4: [`${CDN}/live005.png`],
}

export function getBroadcastGuideSteps(t: T): { title: string; images: string[] }[] {
  return [
    { title: t("broadcast.guide.steps.step1"), images: GUIDE_IMAGES.step1 },
    { title: t("broadcast.guide.steps.step2"), images: GUIDE_IMAGES.step2 },
    { title: t("broadcast.guide.steps.step3"), images: GUIDE_IMAGES.step3 },
    { title: t("broadcast.guide.steps.step4"), images: GUIDE_IMAGES.step4 },
  ]
}

export function getBroadcastRules(t: T): string[] {
  return [
    t("broadcast.rules.item0"),
    t("broadcast.rules.item1"),
    t("broadcast.rules.item2"),
    t("broadcast.rules.item3"),
    t("broadcast.rules.item4"),
    t("broadcast.rules.item5"),
    t("broadcast.rules.item6"),
    t("broadcast.rules.item7"),
    t("broadcast.rules.item8"),
  ]
}

/* ── Broadcast Center ─────────────────────────────────────── */

export enum BroadcastCenterTabEnum {
  REGISTRATION = "dang-ky",
  SETTINGS = "cai-dat",
  RESERVATION = "dat-cho-truoc",
  GUIDE = "huong-dan",
  FAQ = "cau-hoi",
  SUPPORT = "lien-he",
  SOCIAL = "mang-xa-hoi",
}

export interface BroadcastCenterMenuItemInterface {
  tab: BroadcastCenterTabEnum
  labelKey: string
  icon: React.ElementType
}

export const BROADCAST_CENTER_MAIN_MENU: BroadcastCenterMenuItemInterface[] = [
  {
    tab: BroadcastCenterTabEnum.SETTINGS,
    labelKey: "broadcast-center.menu.settings",
    icon: Settings2,
  },
  {
    tab: BroadcastCenterTabEnum.RESERVATION,
    labelKey: "broadcast-center.menu.reservation",
    icon: CalendarClock,
  },
]

export const BROADCAST_CENTER_GUEST_MENU: BroadcastCenterMenuItemInterface[] = [
  {
    tab: BroadcastCenterTabEnum.REGISTRATION,
    labelKey: "broadcast-center.menu.registration",
    icon: Mic2,
  },
]

export const BROADCAST_CENTER_SUB_MENU: BroadcastCenterMenuItemInterface[] = [
  { tab: BroadcastCenterTabEnum.GUIDE, labelKey: "broadcast-center.menu.guide", icon: BookOpen },
]

/* ── Anchor registration form ─────────────────────────────── */

export const ApplySchema = z.object({
  name: z.string().min(1, "Họ tên không được để trống"),
  phone: z.string().min(1, "Số điện thoại không được để trống").regex(/^\d+$/, "Chỉ được nhập số"),
  idNumber: z.string().min(1, "Số CMND/CCCD không được để trống"),
  brief: z.string().min(1, "Giới thiệu không được để trống").max(40, "Tối đa 40 ký tự"),
  idFront: z.string().min(1, "Vui lòng tải ảnh mặt trước CMND/CCCD"),
  idBack: z.string().min(1, "Vui lòng tải ảnh mặt sau CMND/CCCD"),
  idHolding: z.string().min(1, "Vui lòng tải ảnh cầm CMND/CCCD"),
})

export type ApplyFormType = z.infer<typeof ApplySchema>

export const APPLY_FORM_DEFAULTS: ApplyFormType = {
  name: "",
  phone: "",
  idNumber: "",
  brief: "",
  idFront: "",
  idBack: "",
  idHolding: "",
}

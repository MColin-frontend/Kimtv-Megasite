import type { TranslationKey } from "@/i18n"
import { DateRangeEnum } from "@/enums/common.enum"

import icWhistle from "@assets/icons/home/ic-whistle.svg"

const MATCH_STATUS_TAB = {
  ALL: "all",
  LIVE: "live",
  UPCOMING: "upcoming",
  FINISHED: "finished",
} as const

export type MatchStatusTabValue = (typeof MATCH_STATUS_TAB)[keyof typeof MATCH_STATUS_TAB]

const MATCH_STATUS_TABS: {
  value: MatchStatusTabValue
  labelKey: TranslationKey
  icon?: { src: string }
}[] = [
  { value: MATCH_STATUS_TAB.ALL, labelKey: "home.status.all" },
  { value: MATCH_STATUS_TAB.LIVE, labelKey: "home.status.live" },
  { value: MATCH_STATUS_TAB.FINISHED, labelKey: "home.status.finished", icon: icWhistle },
]

const HERO_VIDEO_PARAMS = {
  MATCH_ID: "match_id",
  GAME_ID: "game_id",
} as const

const MATCH_FIXTURES_PARAMS = {
  DATE: "date",
  PICKED_DATE: "picked_date",
  LEAGUES: "leagues",
  STATUS: "status",
  PAGE: "page",
  PAGE_SIZE: "page_size",
} as const

const FOOTBALL_GAME_ID = 202
const FOOTBALL_GAME_MONGO_ID = "668cfbb063abf516827a2dc4"

const DEFAULT_FILTER_MATCH: DateRangeEnum = DateRangeEnum.TODAY

const DATE_RANGE_OPTIONS: { value: DateRangeEnum; labelKey: TranslationKey }[] = [
  { value: DateRangeEnum.YESTERDAY, labelKey: "common.yesterday" },
  { value: DateRangeEnum.TODAY, labelKey: "common.today" },
  { value: DateRangeEnum.TOMORROW, labelKey: "common.tomorrow" },
]

const TEAM_FORM_STYLE: Record<string, string> = {
  W: "bg-green-500/20 text-green-400",
  D: "bg-white/10 text-white/50",
  L: "bg-red-500/20 text-red-400",
}

const POSITION_STYLE: Record<string, string> = {
  F: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  ST: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  CF: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  MC: "bg-green-500/20 text-green-300 border-green-500/30",
  MF: "bg-green-500/20 text-green-300 border-green-500/30",
  CM: "bg-green-500/20 text-green-300 border-green-500/30",
  AM: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  LW: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  RW: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  DC: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  CB: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  LB: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  RB: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  GK: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
}

const PLAYER_RANK_CONFIG: Record<number, { border: string; crown: string; shadow: string }> = {
  1: {
    border: "ring-yellow-400/60",
    crown: "text-yellow-400",
    shadow: "shadow-[0_0_12px_rgba(250,204,21,0.25)]",
  },
  2: {
    border: "ring-slate-300/60",
    crown: "text-slate-300",
    shadow: "shadow-[0_0_10px_rgba(203,213,225,0.2)]",
  },
  3: {
    border: "ring-amber-600/60",
    crown: "text-amber-600",
    shadow: "shadow-[0_0_10px_rgba(180,83,9,0.2)]",
  },
}

const RANK_BADGE_CFG: Record<
  number,
  { bg: string; border: string; text: string; crown: string; laurel: string }
> = {
  1: {
    bg: "bg-gradient-to-b from-[#c8960a] to-[#1a1200]",
    border: "border-yellow-500/60",
    text: "text-yellow-200",
    crown: "text-yellow-400",
    laurel: "#c9963c",
  },
  2: {
    bg: "bg-gradient-to-b from-[#6e7f8c] to-[#0e1318]",
    border: "border-slate-400/40",
    text: "text-slate-200",
    crown: "text-slate-300",
    laurel: "#8a9fb0",
  },
  3: {
    bg: "bg-gradient-to-b from-[#9a5520] to-[#150a00]",
    border: "border-amber-700/50",
    text: "text-amber-300",
    crown: "text-amber-500",
    laurel: "#b07030",
  },
}

const MEDAL_BADGE: Record<number, { bg: string; shadow: string }> = {
  1: {
    bg: "linear-gradient(160deg, #ffd75a 0%, #f6c343 45%, #c8872a 100%)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.35), 2px 0 8px rgba(246,195,67,0.25)",
  },
  2: {
    bg: "linear-gradient(160deg, #e4e4e4 0%, #c0c0c0 45%, #909090 100%)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.4), 2px 0 8px rgba(150,150,150,0.2)",
  },
  3: {
    bg: "linear-gradient(160deg, #e8a870 0%, #cd7f32 45%, #9e5a1e 100%)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.35), 2px 0 8px rgba(205,127,50,0.25)",
  },
}

const DEFAULT_BADGE = {
  bg: "linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 100%)",
  shadow: "inset 0 1px 0 rgba(255,255,255,0.2), 2px 0 6px rgba(0,0,0,0.15)",
}

function formatMarketValue(value: number, currency = "€"): string {
  if (value >= 1_000_000) return `${currency}${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${currency}${(value / 1_000).toFixed(0)}K`
  return `${currency}${value}`
}

export {
  DATE_RANGE_OPTIONS,
  DEFAULT_BADGE,
  DEFAULT_FILTER_MATCH,
  FOOTBALL_GAME_ID,
  FOOTBALL_GAME_MONGO_ID,
  formatMarketValue,
  HERO_VIDEO_PARAMS,
  MATCH_FIXTURES_PARAMS,
  MATCH_STATUS_TAB,
  MATCH_STATUS_TABS,
  MEDAL_BADGE,
  PLAYER_RANK_CONFIG,
  POSITION_STYLE,
  RANK_BADGE_CFG,
  TEAM_FORM_STYLE,
}

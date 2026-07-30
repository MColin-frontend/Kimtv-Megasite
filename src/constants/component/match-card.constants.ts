import { LIVE_MATCH_TYPE } from "@/lib/match.utils"

import icCornerFlag from "@assets/icons/match/ic-corner-flag.png"
import icRedCardV2 from "@assets/icons/match/ic-red-card-v2.svg"
import icYellowCardV2 from "@assets/icons/match/ic-yellow-card-v2.svg"
import imgFootball from "@assets/images/match/img-football.png"

/** Map halfLabel → i18n key dùng với t() */
export const MATCH_HALF_LABEL_I18N_KEY: Record<string, string> = {
  H1: "match.card.period.h1",
  HT: "match.card.period.ht",
  H2: "match.card.period.h2",
  ET: "match.card.period.et",
  PEN: "match.card.period.pen",
  LIVE: "match.card.period.live",
} as const

/** Fallback string khi không có i18n (tương thích ngược) */
export const MATCH_HALF_LABEL_VI: Record<string, string> = {
  H1: "Hiệp 1",
  HT: "Giữa hiệp",
  H2: "Hiệp 2",
  ET: "Hiệp phụ",
  PEN: "Luân lưu",
  LIVE: "Đang diễn ra",
} as const

export const MATCH_STAT_I18N_KEYS = {
  shots: "match.card.stats.shots",
  yellowCard: "match.card.stats.yellow-card",
  redCard: "match.card.stats.red-card",
  corner: "match.card.stats.corner",
} as const

export const COUNTDOWN_I18N_KEYS = {
  hours: "match.card.hours",
  minutes: "match.card.minutes",
  seconds: "match.card.seconds",
} as const

export const COUNTDOWN_ITEMS_CONFIG = [
  { valueKey: "hours" as const, labelKey: COUNTDOWN_I18N_KEYS.hours },
  { valueKey: "minutes" as const, labelKey: COUNTDOWN_I18N_KEYS.minutes },
  { valueKey: "seconds" as const, labelKey: COUNTDOWN_I18N_KEYS.seconds },
] as const

export const MATCH_CARD_I18N_KEYS = {
  finished: "match.card.finished",
  blvLabel: "match.card.blv-label",
  streamLabel: "match.card.stream-label",
  liveLabel: "match.card.live-label",
  watching: "match.card.watching",
  watchingTooltip: "match.card.watching-tooltip",
  streamUpcomingLabel: "match.card.stream-upcoming.label",
  streamUpcomingTitle: "match.card.stream-upcoming.title",
  streamUpcomingSubtitle: "match.card.stream-upcoming.subtitle",
} as const

export const MATCH_STAT_ICONS = {
  football: imgFootball,
  yellowCard: icYellowCardV2,
  redCard: icRedCardV2,
  cornerFlag: icCornerFlag,
} as const

/** Config tĩnh cho từng stat — icon + alt + i18n key + field mapping */
export const MATCH_STAT_CONFIG = [
  {
    icon: icYellowCardV2,
    alt: "yellow",
    labelKey: MATCH_STAT_I18N_KEYS.yellowCard,
    homeKey: "homeYellowCard" as const,
    awayKey: "awayYellowCard" as const,
  },
  {
    icon: icRedCardV2,
    alt: "red",
    labelKey: MATCH_STAT_I18N_KEYS.redCard,
    homeKey: "homeRedCard" as const,
    awayKey: "awayRedCard" as const,
  },
  {
    icon: icCornerFlag,
    alt: "corner",
    labelKey: MATCH_STAT_I18N_KEYS.corner,
    homeKey: "homeCornerKick" as const,
    awayKey: "awayCornerKick" as const,
  },
] as const

type MatchWithFootballStats = {
  homeYellowCard?: number | null
  awayYellowCard?: number | null
  homeRedCard?: number | null
  awayRedCard?: number | null
  homeCornerKick?: number | null
  awayCornerKick?: number | null
}

export function buildMatchStats(match: MatchWithFootballStats, t: (key: string) => string) {
  return MATCH_STAT_CONFIG.map((cfg) => ({
    icon: cfg.icon,
    alt: cfg.alt,
    label: t(cfg.labelKey),
    home: (match[cfg.homeKey] ?? 0) as number,
    away: (match[cfg.awayKey] ?? 0) as number,
  }))
}

export const MATCH_STATUS_LABEL_CONFIG = {
  live: {
    i18nKey: "match.card.status.live",
    badge: LIVE_MATCH_TYPE.LIVE,
    badgeClass: "bg-red-600 text-white",
    textClass: "text-white",
    leftAccentClass: "bg-red-600",
    wrapperClass: "border-red-600/40 bg-live-label shadow-live-label",
    triangleClass: "triangle-live",
  },
  upcoming: {
    i18nKey: "match.card.status.upcoming",
    badge: LIVE_MATCH_TYPE.UPCOMING,
    badgeClass: "bg-gold text-black",
    textClass: "text-white",
    leftAccentClass: "bg-gold",
    wrapperClass: "border-gold/40 bg-gold-label shadow-gold-label",
    triangleClass: "triangle-gold",
  },
  finished: {
    i18nKey: "match.card.status.finished",
    badge: LIVE_MATCH_TYPE.FINISHED,
    badgeClass: "bg-slate-400/15 text-slate-300",
    textClass: "text-slate-300",
    leftAccentClass: "bg-slate-400/50",
    wrapperClass: "border-slate-400/25 bg-finished-label shadow-finished-label",
    triangleClass: "triangle-finished",
  },
} as const

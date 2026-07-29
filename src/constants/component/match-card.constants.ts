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

export const MATCH_CARD_I18N_KEYS = {
  finished: "match.card.finished",
  blvLabel: "match.card.blv-label",
  streamLabel: "match.card.stream-label",
  liveLabel: "match.card.live-label",
  watching: "match.card.watching",
  watchingTooltip: "match.card.watching-tooltip",
} as const

export const MATCH_STAT_ICONS = {
  football: imgFootball,
  yellowCard: icYellowCardV2,
  redCard: icRedCardV2,
  cornerFlag: icCornerFlag,
} as const

/** Config tĩnh cho từng stat — icon + alt + i18n key */
export const MATCH_STAT_CONFIG = [
  { icon: icYellowCardV2, alt: "yellow", labelKey: MATCH_STAT_I18N_KEYS.yellowCard },
  { icon: icRedCardV2, alt: "red", labelKey: MATCH_STAT_I18N_KEYS.redCard },
  { icon: icCornerFlag, alt: "corner", labelKey: MATCH_STAT_I18N_KEYS.corner },
] as const

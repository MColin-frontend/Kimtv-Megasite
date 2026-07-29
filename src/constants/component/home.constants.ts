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

export {
  DATE_RANGE_OPTIONS,
  DEFAULT_FILTER_MATCH,
  FOOTBALL_GAME_ID,
  FOOTBALL_GAME_MONGO_ID,
  HERO_VIDEO_PARAMS,
  MATCH_FIXTURES_PARAMS,
  MATCH_STATUS_TAB,
  MATCH_STATUS_TABS,
}

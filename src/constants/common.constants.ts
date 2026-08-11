import { MatchFootballStateEnum } from "@/enums/match.enum"

const PAGE_KEY = "page"
const PAGE_SIZE_KEY = "pageSize"
const PAGE_INDEX_KEY = "pageIndex"
const KEYWORD_KEY = "keyword"
const MATCH_SCHEDULE_PAGE_KEY = "schedule-page"

const DATA_KEY = "records"
const TOTAL_KEY = "total"

const DEFAULT_PAGE_SIZE: number = 20
const DEFAULT_PAGE: number = 1
const PAGE_SIZE_OPTION: number[] = [10, 12, 20, 30, 40, 50, 60, 70, 80, 90, 100]

const COLS_CLASS: Record<number, string> = {
  2: "basis-1/2 max-sm:basis-full min-w-0",
  3: "basis-1/3 max-lg:basis-1/2 max-sm:basis-full min-w-0",
  4: "basis-1/4 max-lg:basis-1/3 max-md:basis-1/2 max-sm:basis-full min-w-0",
  5: "basis-1/5 max-lg:basis-1/3 max-sm:basis-full min-w-0",
  6: "basis-1/6 max-lg:basis-1/4 max-sm:basis-full min-w-0",
}

/** Label ngắn cho giai đoạn bóng đá — dùng trên match card. */
const MATCH_HALF_LABEL: Partial<Record<MatchFootballStateEnum, string>> = {
  [MatchFootballStateEnum.FIRST_HALF]: "H1",
  [MatchFootballStateEnum.HALF_TIME]: "HT",
  [MatchFootballStateEnum.SECOND_HALF]: "H2",
  [MatchFootballStateEnum.EXTRA_TIME]: "ET",
  [MatchFootballStateEnum.EXTRA_TIME_SECOND]: "ET",
  [MatchFootballStateEnum.PENALTIES]: "PEN",
}

export const SKELETON_BG = "bg-gray-200"

export interface PreferenceTagInterface {
  id: string
  label: string
}

export const DEFAULT_PREFERENCE_TAGS: PreferenceTagInterface[] = [
  { id: "bong-da", label: "Bóng đá" },
  { id: "nba", label: "NBA" },
  { id: "epl", label: "EPL" },
]

export {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
  PAGE_SIZE_OPTION,
  MATCH_HALF_LABEL,
  PAGE_KEY,
  PAGE_SIZE_KEY,
  PAGE_INDEX_KEY,
  KEYWORD_KEY,
  MATCH_SCHEDULE_PAGE_KEY,
  COLS_CLASS,
  DATA_KEY,
  TOTAL_KEY,
}

import { MatchFootballStateEnum } from "@/enums/match.enum"

const DEFAULT_PAGE_SIZE: number = 20
const DEFAULT_PAGE: number = 1
const PAGE_SIZE_OPTION: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

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

export { DEFAULT_PAGE_SIZE, DEFAULT_PAGE, PAGE_SIZE_OPTION, MATCH_HALF_LABEL }

import type { ElementType } from "react"
import { Layers, Target, Trophy } from "lucide-react"

export enum PollChannelEnum {
  START = "POLL_START",
  ACTIVE = "POLL_ACTIVE",
  UPDATE = "POLL_UPDATE",
  CLOSED = "POLL_CLOSED",
}

export const POLL_QUESTION_MAX = 120
export const POLL_MAX_OPTIONS = 6
export const POLL_MIN_OPTIONS = 2

export enum PollTypeEnum {
  SINGLE = "single",
  MULTIPLE = "multiple",
  RATING = "rating",
}

export const POLL_TYPES = [PollTypeEnum.SINGLE, PollTypeEnum.MULTIPLE, PollTypeEnum.RATING] as const
export type PollTypeValue = PollTypeEnum

export const POLL_DURATION_PRESETS = [
  { label: "30s", value: "30" },
  { label: "1 phút", value: "60" },
  { label: "2 phút", value: "120" },
  { label: "5 phút", value: "300" },
  { label: "Tùy chỉnh", value: "custom" },
] as const

export const POLL_RATING_SCALE_PRESETS = [
  { label: "1 – 5", min: 1, max: 5 },
  { label: "1 – 10", min: 1, max: 10 },
] as const

export type PollTypeConfig = Record<
  PollTypeValue,
  { icon: ElementType; labelKey: string; descKey: string }
>

export const POLL_TYPE_CONFIG: PollTypeConfig = {
  [PollTypeEnum.SINGLE]: {
    icon: Target,
    labelKey: "live.poll.type.single",
    descKey: "live.poll.type.singleDesc",
  },
  [PollTypeEnum.MULTIPLE]: {
    icon: Layers,
    labelKey: "live.poll.type.multiple",
    descKey: "live.poll.type.multipleDesc",
  },
  [PollTypeEnum.RATING]: {
    icon: Trophy,
    labelKey: "live.poll.type.rating",
    descKey: "live.poll.type.ratingDesc",
  },
}

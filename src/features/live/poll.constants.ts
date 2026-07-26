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

/** Khớp với field `type` từ API response */
export enum PollTypeApiEnum {
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  RATING = "RATING",
}
export type PollTypeApiValue = `${PollTypeApiEnum}`

/** Trạng thái poll từ API */
export enum PollStatusEnum {
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
}
export type PollStatusValue = `${PollStatusEnum}`

export const POLL_DURATION_PRESETS = [
  { labelKey: "live.poll.duration-presets.30s", value: "30" },
  { labelKey: "live.poll.duration-presets.1min", value: "60" },
  { labelKey: "live.poll.duration-presets.2min", value: "120" },
  { labelKey: "live.poll.duration-presets.5min", value: "300" },
  { labelKey: "live.poll.duration-presets.custom", value: "custom" },
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
    descKey: "live.poll.type.single-desc",
  },
  [PollTypeEnum.MULTIPLE]: {
    icon: Layers,
    labelKey: "live.poll.type.multiple",
    descKey: "live.poll.type.multiple-desc",
  },
  [PollTypeEnum.RATING]: {
    icon: Trophy,
    labelKey: "live.poll.type.rating",
    descKey: "live.poll.type.rating-desc",
  },
}

/** local ↔ API poll type */
export const POLL_TYPE_MAP = {
  [PollTypeEnum.SINGLE]: PollTypeApiEnum.SINGLE_CHOICE,
  [PollTypeEnum.MULTIPLE]: PollTypeApiEnum.MULTIPLE_CHOICE,
  [PollTypeEnum.RATING]: PollTypeApiEnum.RATING,
} as const satisfies Record<PollTypeValue, PollTypeApiValue>

export function pollTypeFromApi(type: PollTypeApiValue): PollTypeValue {
  const entry = (Object.entries(POLL_TYPE_MAP) as [PollTypeValue, PollTypeApiValue][]).find(
    ([, api]) => api === type
  )
  return entry?.[0] ?? PollTypeEnum.SINGLE
}

export const POLL_TYPE_BADGE_CONFIG: Record<PollTypeApiValue, { label: string; cls: string }> = {
  [PollTypeApiEnum.SINGLE_CHOICE]: {
    label: "SINGLE CHOICE",
    cls: "text-green-400 bg-green-400/10 border border-green-400/25",
  },
  [PollTypeApiEnum.MULTIPLE_CHOICE]: {
    label: "MULTIPLE CHOICE",
    cls: "text-violet-400 bg-violet-400/10 border border-violet-400/25",
  },
  [PollTypeApiEnum.RATING]: {
    label: "RATING",
    cls: "text-gold bg-gold/10 border border-gold/25",
  },
}

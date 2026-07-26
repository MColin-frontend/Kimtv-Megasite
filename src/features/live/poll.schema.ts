import { z } from "zod"

import type { TranslationKey } from "@/i18n/use-translation"

import { POLL_MIN_OPTIONS, POLL_QUESTION_MAX, PollTypeEnum } from "./poll.constants"

export function createPollSchema(t: (key: TranslationKey) => string) {
  return z
    .object({
      pollType: z.nativeEnum(PollTypeEnum),
      question: z
        .string()
        .min(1, t("live.poll.errors.question-required"))
        .max(POLL_QUESTION_MAX, t("live.poll.errors.question-max")),
      options: z.array(z.object({ value: z.string() })),
      duration: z.string().min(1, t("live.poll.errors.duration-required")),
      customDuration: z.string().optional(),
      minSelect: z.number().optional(),
      maxSelect: z.number().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.pollType !== PollTypeEnum.RATING) {
        if (data.options.length < POLL_MIN_OPTIONS) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["options"],
            message: t("live.poll.errors.options-min"),
          })
        }
        data.options.forEach((opt, i) => {
          if (!opt.value.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["options", i, "value"],
              message: t("live.poll.errors.option-required"),
            })
          }
        })
      }

      if (data.pollType === PollTypeEnum.MULTIPLE || data.pollType === PollTypeEnum.RATING) {
        if (data.minSelect == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["minSelect"],
            message: t("live.poll.errors.min-select-required"),
          })
        }
        if (data.maxSelect == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxSelect"],
            message: t("live.poll.errors.max-select-required"),
          })
        }
        if (data.minSelect != null && data.maxSelect != null && data.minSelect > data.maxSelect) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxSelect"],
            message: t("live.poll.errors.max-select-gte-min"),
          })
        }
        if (
          data.pollType === PollTypeEnum.MULTIPLE &&
          data.maxSelect != null &&
          data.maxSelect > data.options.length
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxSelect"],
            message: t("live.poll.errors.max-select-exceed"),
          })
        }
      }
    })
}

export type PollFormType = z.infer<ReturnType<typeof createPollSchema>>

export const POLL_DEFAULTS: PollFormType = {
  pollType: PollTypeEnum.SINGLE,
  question: "",
  options: [{ value: "" }, { value: "" }],
  duration: "60",
  customDuration: "",
}

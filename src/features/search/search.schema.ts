import { z } from "zod"

import type { TranslationKey } from "@/i18n"

export { SEARCH_FILTER_KEY, SEARCH_QUERY_KEY } from "./search.constants"

export const SEARCH_QUERY_MAX = 200

export function createSearchSchema(t: (key: TranslationKey) => string) {
  return z.object({
    q: z
      .string()
      .min(1, t("search.error.required"))
      .max(SEARCH_QUERY_MAX, t("search.error.max").replace("{max}", String(SEARCH_QUERY_MAX)))
      .transform((v) => v.trim()),
  })
}

export type SearchFormType = { q: string }

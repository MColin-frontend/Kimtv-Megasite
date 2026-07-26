import type { LocaleType } from "./config"
import type { Dictionary } from "./locales/vi"

export * from "./config"
export * from "./slug-map"
export { useTranslation } from "./use-translation"
export type { TranslationKey } from "./use-translation"

// getLocale (server-only) — import trực tiếp, KHÔNG qua barrel này:
// import { getLocale } from "@/i18n/get-locale"

const dictionaries: Record<LocaleType, () => Promise<{ default: Dictionary }>> = {
  vi: () => import("./locales/vi"),
}

export async function getDictionary(locale: LocaleType): Promise<Dictionary> {
  return (await dictionaries[locale]()).default
}

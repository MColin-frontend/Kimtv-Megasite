import type { LocaleType, NonViLocale } from "./config"
import { DEFAULT_LOCALE } from "./config"

/**
 * vi canonical slug → { locale: localized-slug }
 *
 * Thêm ngôn ngữ mới:
 *   1. Thêm locale vào LOCALES trong config.ts
 *   2. Thêm slug vào mỗi entry bên dưới
 */
export const SLUG_MAP: Record<string, Partial<Record<NonViLocale, string>>> = {
  // Sports
  "lich-thi-dau": {},
  "ti-so-truc-tuyen": {},
  "ket-qua": {},
  bxh: {},
  "tin-tuc": {},
  video: {},
  "du-lieu": {},
  // Auth
  "dang-nhap": {},
  "dang-ky": {},
  // Other
  "moi-ban": {},
}

export type ViSlug = keyof typeof SLUG_MAP

/** SLUG_TO_VI[locale][localized-slug] → vi canonical slug — dùng trong proxy */
export const SLUG_TO_VI = {} as Partial<Record<NonViLocale, Record<string, string>>>

/** Tạo path theo locale — fallback về vi slug nếu chưa có translation */
export function localePath(locale: LocaleType, viSlug: ViSlug, suffix?: string): string {
  const slug =
    locale === DEFAULT_LOCALE ? viSlug : (SLUG_MAP[viSlug]?.[locale as NonViLocale] ?? viSlug)
  const base = `/${locale}/${slug}`
  return suffix ? `${base}/${suffix}` : base
}

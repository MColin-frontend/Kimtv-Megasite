"use client"

import { useParams } from "next/navigation"

import { DEFAULT_LOCALE, type LocaleType } from "./config"
import type { Dictionary } from "./locales/vi"
import vi from "./locales/vi"

const dictionaries: Record<LocaleType, Dictionary> = { vi }

type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends string
    ? `${Prefix}${string & K}`
    : DotPaths<T[K], `${Prefix}${string & K}.`>
}[keyof T]

export type TranslationKey = DotPaths<Dictionary>

export function useTranslation() {
  const params = useParams<{ lang: string }>()
  const locale = (params?.lang as LocaleType) ?? DEFAULT_LOCALE
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]

  function t(key: TranslationKey): string {
    const value = key.split(".").reduce<unknown>((obj, k) => {
      return (obj as Record<string, unknown>)?.[k]
    }, dict)
    return typeof value === "string" ? value : key
  }

  return { t, locale, dict }
}

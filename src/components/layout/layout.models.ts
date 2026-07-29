import type { ElementType } from "react"

import type { TranslationKey } from "@/i18n"
import type { Routes } from "@/config/routes"

interface NavI18nItemInterface {
  labelKey: TranslationKey
  getHref: (r: Routes) => string
  icon?: ElementType
  iconSrc?: string // path to SVG/image asset
  badge?: boolean
  relatedSlugs?: string[] // additional slugs that should activate this item
}

interface FooterMenuInterface {
  key: string
  getHref: (r: Routes) => string
}

export type { NavI18nItemInterface, FooterMenuInterface }

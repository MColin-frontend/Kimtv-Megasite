import type { ElementType } from "react"
import {
  Broadcast,
  CalendarCheck,
  FilmSlate,
  HouseSimple,
  NewspaperClipping,
} from "@phosphor-icons/react"
import { MonitorPlay } from "lucide-react"

import type { TranslationKey } from "@/i18n"
import type { Routes } from "@/config/routes"

import type { FooterMenuInterface, NavI18nItemInterface } from "@/components/layout/layout.models"

export interface DropdownItemInterface {
  key: string
  labelKey: TranslationKey
  icon: ElementType
  iconColor: string
  getHref: (r: Routes) => string
}

export const HEADER_DROPDOWN_ITEMS: DropdownItemInterface[] = [
  {
    key: "broadcast",
    labelKey: "header.user.menu.broadcast",
    icon: MonitorPlay,
    iconColor: "text-gold",
    getHref: (r) => r.broadcastCenter,
  },
]

export const MAIN_NAV_ITEMS: NavI18nItemInterface[] = [
  { labelKey: "header.nav.home", getHref: (r) => r.home, icon: HouseSimple },
  { labelKey: "header.nav.schedule", getHref: (r) => r.schedule, icon: CalendarCheck },
  {
    labelKey: "header.nav.live-schedule",
    getHref: (r) => r.liveSchedule,
    icon: Broadcast,
    badge: true,
    relatedSlugs: ["truc-tiep"],
  },
  { labelKey: "header.nav.news", getHref: (r) => r.news.index, icon: NewspaperClipping },
  { labelKey: "header.nav.highlight", getHref: (r) => r.video.index, icon: FilmSlate },
]

export const FOOTER_MENUS: FooterMenuInterface[] = [
  { key: "home", getHref: (r) => r.home },
  { key: "fixtures", getHref: (r) => r.schedule },
  { key: "live-score", getHref: (r) => r.liveScore },
  { key: "news", getHref: (r) => r.news.index },
  { key: "highlights", getHref: (r) => r.video.index },
]

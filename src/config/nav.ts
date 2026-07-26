import { DEFAULT_LOCALE, type LocaleType } from "@/i18n"

import { getRoutes } from "./routes"

export interface NavItemInterface {
  label: string
  href: string
}

const NAV_LABELS: Record<string, Partial<Record<LocaleType, string>>> = {
  home: { vi: "Trang chủ" },
  schedule: { vi: "Lịch thi đấu" },
  liveScore: { vi: "Tỉ số trực tuyến" },
  results: { vi: "Kết quả" },
  standings: { vi: "BXH" },
  news: { vi: "Tin tức" },
  video: { vi: "Video" },
  data: { vi: "Dữ liệu" },
}

function t(key: string, locale: LocaleType): string {
  return NAV_LABELS[key]?.[locale] ?? NAV_LABELS[key]?.[DEFAULT_LOCALE] ?? key
}

export function getMainNav(locale: LocaleType): NavItemInterface[] {
  const routes = getRoutes(locale)
  return [
    { label: t("home", locale), href: routes.home },
    { label: t("schedule", locale), href: routes.schedule },
    { label: t("liveScore", locale), href: routes.liveScore },
    { label: t("results", locale), href: routes.results },
    { label: t("standings", locale), href: routes.standings },
    { label: t("news", locale), href: routes.news.index },
    { label: t("video", locale), href: routes.video.index },
    { label: t("data", locale), href: routes.data },
  ]
}

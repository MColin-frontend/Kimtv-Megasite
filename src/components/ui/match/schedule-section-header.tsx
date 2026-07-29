"use client"

import { useTranslation } from "@/i18n"

import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

import imgTrophy from "@assets/images/common/img-trophy.png"

export function ScheduleSectionHeader() {
  const { t } = useTranslation()

  return (
    <div className="relative flex items-center">
      <div className="img-blend-dark relative shrink-0">
        <Img src={imgTrophy} alt="" width={80} height={80} className="max-sm:!h-16 max-sm:!w-16" />
      </div>
      <div className="bg-gold mr-5 h-8 w-0.5 shrink-0 max-sm:mr-3 max-sm:h-6" />
      <div className="flex min-w-0 flex-col gap-1 overflow-visible">
        <Typography variant="h1" className="text-gradient-white max-sm:text-24">
          {t("schedule.page-title")} {t("schedule.header-suffix")}
        </Typography>
        <Typography variant="body" className="max-sm:text-12 uppercase">
          {t("schedule.header-desc")}
        </Typography>
      </div>
    </div>
  )
}

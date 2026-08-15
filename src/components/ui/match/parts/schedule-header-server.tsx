import type { StaticImageData } from "next/image"
import Image from "next/image"

import { getTranslation } from "@/i18n/get-locale"

import { Typography } from "@/components/ui/typography"

import imgTrophy from "@assets/images/common/img-trophy.webp"

interface ScheduleHeaderServerProps {
  image?: StaticImageData | string
  title?: string
  subtitle?: string
}

export async function ScheduleHeaderServer({ image, title, subtitle }: ScheduleHeaderServerProps) {
  const { t } = await getTranslation()

  const resolvedTitle = title ?? `${t("schedule.page-title")} ${t("schedule.header-suffix")}`
  const resolvedSubtitle = subtitle ?? t("schedule.header-desc")
  const resolvedImage = image ?? imgTrophy

  return (
    <div className="relative flex items-center">
      <div className="img-blend-dark relative shrink-0">
        <Image
          src={resolvedImage}
          alt=""
          width={80}
          height={80}
          className="max-sm:!h-16 max-sm:!w-16"
        />
      </div>
      <div className="bg-gold mr-5 h-8 w-0.5 shrink-0 max-sm:mr-3 max-sm:h-6" />
      <div className="flex min-w-0 flex-col gap-1 overflow-visible">
        <Typography variant="h1" className="text-gradient-white max-sm:text-24">
          {resolvedTitle}
        </Typography>
        <Typography variant="body" className="max-sm:text-12 uppercase">
          {resolvedSubtitle}
        </Typography>
      </div>
    </div>
  )
}

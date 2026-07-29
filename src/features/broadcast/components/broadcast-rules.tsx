"use client"

import type { ElementType } from "react"
import {
  Ban,
  CigaretteOff,
  Crosshair,
  EyeOff,
  Flag,
  Landmark,
  Megaphone,
  MessageSquareOff,
  MonitorOff,
  Scale,
  ShieldAlert,
  UserRoundX,
  UserX,
} from "lucide-react"

import { useTranslation } from "@/i18n/use-translation"

import { getBroadcastRules } from "@/features/broadcast/broadcast.constants"
import { Typography } from "@/components/ui/typography"

const RULE_ICONS: ElementType[] = [
  Flag,
  Scale,
  EyeOff,
  Ban,
  Crosshair,
  Megaphone,
  MessageSquareOff,
  Landmark,
  CigaretteOff,
  UserX,
  MonitorOff,
  UserRoundX,
]

export function BroadcastRules() {
  const { t } = useTranslation()
  const rules = getBroadcastRules(t)

  return (
    <section className="card-glow rounded-12 relative flex h-full min-h-0 flex-col overflow-hidden border border-red-500/15">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.14),transparent_70%)]" />

      <div className="relative flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-5">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <div className="rounded-10 flex size-9 shrink-0 items-center justify-center bg-red-500/15 ring-1 ring-red-400/25 sm:size-10">
            <ShieldAlert className="size-4 text-red-300 sm:size-5" />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Typography variant="h5" className="text-white">
              {t("broadcast.rules.title")}
            </Typography>
            <Typography variant="caption" className="text-white/55">
              {t("broadcast.rules.badge")}
            </Typography>
          </div>
        </div>

        {/* Intro banner */}
        <div className="rounded-10 shrink-0 border border-amber-400/20 bg-amber-400/8 px-3 py-2.5 sm:px-3.5 sm:py-3">
          <Typography variant="body-sm" className="text-amber-100/90">
            {t("broadcast.rules.description")}
          </Typography>
        </div>

        {/* Rules list — fills remaining height */}
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5 sm:pr-1">
          {rules.map((rule, i) => {
            const Icon = RULE_ICONS[i] ?? Ban
            return (
              <article
                key={i}
                className="group rounded-10 relative flex gap-2.5 border border-white/6 bg-white/[0.03] p-2.5 transition-colors hover:border-red-400/25 hover:bg-red-500/[0.06] sm:gap-3 sm:p-3"
              >
                <span className="rounded-l-10 absolute top-0 bottom-0 left-0 w-0.5 bg-red-400/0 transition-colors group-hover:bg-red-400/70" />

                <div className="rounded-8 flex size-7 shrink-0 items-center justify-center bg-red-500/12 text-red-300 sm:size-8">
                  <Icon className="size-3.5" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Typography
                    variant="body-sm"
                    weight="600"
                    className="text-white/85 transition-colors group-hover:text-white"
                  >
                    {rule.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="leading-150 text-white/55 transition-colors group-hover:text-white/85"
                  >
                    {rule.desc}
                  </Typography>
                </div>
              </article>
            )
          })}
        </div>

        {/* Footer */}
        <div className="rounded-8 flex shrink-0 items-start gap-2 border border-red-500/20 bg-red-500/10 px-2.5 py-2 sm:px-3 sm:py-2.5">
          <Ban className="mt-0.5 size-3.5 shrink-0 text-red-300" />
          <Typography variant="caption" weight="500" className="text-red-200/90">
            {t("broadcast.rules.footer")}
          </Typography>
        </div>
      </div>
    </section>
  )
}

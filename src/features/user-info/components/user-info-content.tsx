"use client"

import { Suspense } from "react"
import { LayoutGrid, PlayCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/useRouter"

import { useTranslation } from "@/i18n"

import { ScrollReveal } from "@/components/ui/scroll-reveal"

import { USER_INFO_TABS, UserInfoTabEnum, type UserInfoTabType } from "../user-info.constants"
import { ContentList } from "./content-list"
import { UserInfoProfilePanel } from "./profile-panel"

const TAB_ICONS: Record<UserInfoTabType, React.ComponentType<{ className?: string }> | null> = {
  [UserInfoTabEnum.ALL]: null,
  [UserInfoTabEnum.NEWS]: LayoutGrid,
  [UserInfoTabEnum.VIDEO]: PlayCircle,
}

export function UserInfoContent() {
  const { t } = useTranslation()
  const { getParam, setParams } = useRouter()

  const rawTab = getParam("tab")
  const activeTab: UserInfoTabType =
    rawTab === UserInfoTabEnum.NEWS || rawTab === UserInfoTabEnum.VIDEO
      ? rawTab
      : UserInfoTabEnum.ALL

  const setActiveTab = (tab: UserInfoTabType) =>
    setParams(
      { tab: tab === UserInfoTabEnum.ALL ? null : tab, page: null },
      { replace: true, scroll: false }
    )

  return (
    <div className="flex flex-col gap-4">
      <ScrollReveal variant="fade-up" duration={600} distance={24}>
        <UserInfoProfilePanel />
      </ScrollReveal>

      <ScrollReveal variant="fade-up" duration={500} distance={16} delay={100}>
        <div className="mt-10 max-md:mt-4">
          <div className="flex items-center border-b border-white/8">
            {USER_INFO_TABS.map(({ key, labelKey }) => {
              const Icon = TAB_ICONS[key]
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "text-17 font-600 relative flex items-center gap-2 px-8 py-4 whitespace-nowrap transition-all duration-200 outline-none select-none max-md:px-4 max-md:py-3",
                    isActive ? "text-gold" : "text-white/45 hover:text-white/75"
                  )}
                >
                  {Icon && <Icon className="size-4 shrink-0" />}
                  {t(labelKey)}
                  {isActive && (
                    <span className="bg-gradient-button shadow-[0_0_12px_theme(colors.gold/0.6)] absolute inset-x-0 bottom-0 h-[3px]" />
                  )}
                </button>
              )
            })}
          </div>

          <Suspense key={activeTab}>
            <ContentList />
          </Suspense>
        </div>
      </ScrollReveal>
    </div>
  )
}

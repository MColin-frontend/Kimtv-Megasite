"use client"

import Link from "next/link"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarClock, ChevronDown, Radio, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/useRouter"

import { useTranslation } from "@/i18n/use-translation"
import { getRoutes } from "@/config/routes"

import {
  deleteReservation,
  fetchAnchorInfo,
  fetchReservations,
} from "@/features/broadcast/broadcast.api"
import { Empty } from "@/components/ui/empty"
import { Img } from "@/components/ui/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Typography } from "@/components/ui/typography"

import {
  BROADCAST_CENTER_GUEST_MENU,
  BROADCAST_CENTER_MAIN_MENU,
  BROADCAST_CENTER_SUB_MENU,
  BroadcastCenterTabEnum,
} from "../broadcast.constants"

function MenuItem({
  item,
  isActive,
  href,
  t,
}: {
  item: (typeof BROADCAST_CENTER_MAIN_MENU)[number]
  isActive: boolean
  href: string
  t: ReturnType<typeof useTranslation>["t"]
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-8 relative flex items-center gap-3 px-3 py-2 transition-all duration-150",
        isActive
          ? "bg-amber-400/12 text-amber-300"
          : "text-white/45 hover:bg-white/6 hover:text-white/80"
      )}
    >
      {isActive && (
        <span className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-amber-400" />
      )}
      <item.icon
        className={cn(
          "size-[15px] shrink-0 transition-colors",
          isActive ? "text-amber-400" : "text-white/30 group-hover:text-white/60"
        )}
      />
      <Typography
        variant="body-sm"
        weight={isActive ? "500" : "400"}
        className="leading-none text-inherit"
      >
        {t(item.labelKey as Parameters<typeof t>[0])}
      </Typography>
    </Link>
  )
}

export function BroadcastCenterSidebarSkeleton() {
  return (
    <div className="flex w-80 shrink-0 flex-col gap-3 max-lg:w-full">
      <aside className="card-glow rounded-12 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/6 px-4 py-3.5">
          <Skeleton className="rounded-6 size-6 shrink-0" />
          <Skeleton className="rounded-4 h-3 w-28" />
        </div>
        <div className="flex flex-col gap-0.5 p-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="rounded-4 size-[15px] shrink-0" />
              <Skeleton className="rounded-4 h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="mx-3 h-px bg-white/6" />
        <div className="flex flex-col gap-0.5 p-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="rounded-4 size-[15px] shrink-0" />
            <Skeleton className="rounded-4 h-4 w-28" />
          </div>
        </div>
      </aside>
    </div>
  )
}

export function BroadcastCenterSidebar() {
  const { t, locale } = useTranslation()
  const { getParam } = useRouter()
  const routes = getRoutes(locale)

  const { data: anchorInfo } = useQuery({
    queryKey: ["anchor-info"],
    queryFn: fetchAnchorInfo,
    staleTime: 60_000,
  })

  const isRegistered = !!anchorInfo?.userId
  const defaultTab = isRegistered
    ? BroadcastCenterTabEnum.SETTINGS
    : BroadcastCenterTabEnum.REGISTRATION
  const activeTab = (getParam("tab") as BroadcastCenterTabEnum) ?? defaultTab

  const tabHref = (tab: BroadcastCenterTabEnum) => {
    const step = getParam("step")
    const params = new URLSearchParams({ tab })
    if (step) params.set("step", step)
    return `${routes.broadcastCenter}?${params.toString()}`
  }

  const queryClient = useQueryClient()

  const { data: reservations, isLoading: reservationsLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: fetchReservations,
    staleTime: 0,
    enabled: isRegistered,
  })

  async function handleCancel(matchId: number, gameId: number) {
    await deleteReservation(matchId, gameId)
    queryClient.invalidateQueries({ queryKey: ["reservations"] })
  }

  return (
    <div className="flex w-80 shrink-0 flex-col gap-3 max-lg:w-full">
      <AccordionPrimitive.Root
        defaultValue={["nav"]}
        className="card-glow rounded-12 overflow-hidden"
      >
        <AccordionPrimitive.Item value="nav" className="group/nav border-none">
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="flex w-full items-center justify-between px-4 py-3.5 outline-none">
              <div className="flex items-center gap-2">
                <div className="rounded-6 flex size-6 items-center justify-center bg-amber-400/15">
                  <Radio className="size-3 text-amber-400" />
                </div>
                <Typography variant="overline" className="text-white/50">
                  {t("broadcast-center.section-manage")}
                </Typography>
              </div>
              <ChevronDown className="size-3.5 text-white/30 transition-transform duration-200 group-data-[open]/nav:rotate-180" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Panel className="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden">
            <div className="border-t border-white/6">
              <nav className="flex flex-col gap-0.5 p-2">
                {(isRegistered ? BROADCAST_CENTER_MAIN_MENU : BROADCAST_CENTER_GUEST_MENU).map(
                  (item) => (
                    <MenuItem
                      key={item.tab}
                      item={item}
                      isActive={activeTab === item.tab}
                      href={tabHref(item.tab)}
                      t={t}
                    />
                  )
                )}
              </nav>
              {isRegistered && (
                <>
                  <div className="mx-3 h-px bg-white/6" />
                  <nav className="flex flex-col gap-0.5 p-2">
                    {BROADCAST_CENTER_SUB_MENU.map((item) => (
                      <MenuItem
                        key={item.tab}
                        item={item}
                        isActive={activeTab === item.tab}
                        href={tabHref(item.tab)}
                        t={t}
                      />
                    ))}
                  </nav>
                </>
              )}
            </div>
          </AccordionPrimitive.Panel>
        </AccordionPrimitive.Item>
      </AccordionPrimitive.Root>

      {activeTab === BroadcastCenterTabEnum.RESERVATION && (
        <AccordionPrimitive.Root
          defaultValue={["res"]}
          className="card-glow rounded-12 overflow-hidden"
        >
          <AccordionPrimitive.Item value="res" className="group/res border-none">
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger className="flex w-full items-center justify-between px-4 py-3.5 outline-none">
                <div className="flex items-center gap-2">
                  <div className="rounded-6 flex size-6 items-center justify-center bg-amber-400/15">
                    <CalendarClock className="size-3 text-amber-400" />
                  </div>
                  <Typography variant="overline" className="text-white/50">
                    {t("broadcast-center.reservation.active-title")}
                  </Typography>
                </div>
                <ChevronDown className="size-3.5 text-white/30 transition-transform duration-200 group-data-[open]/res:rotate-180" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Panel className="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden">
              <div className="flex min-h-60 flex-col gap-1.5 p-3 pt-0">
                {reservationsLoading ? (
                  <div className="flex flex-col gap-1.5">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-8 flex items-center gap-2 border border-white/6 bg-white/[0.02] px-3 py-2"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <Skeleton className="size-3.5 shrink-0 rounded-full" />
                            <Skeleton className="rounded-4 h-3 w-24" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Skeleton className="size-3.5 shrink-0 rounded-full" />
                            <Skeleton className="rounded-4 h-3 w-20" />
                          </div>
                        </div>
                        <Skeleton className="rounded-6 size-5 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : reservations && reservations.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {reservations.map((r, i) => (
                      <div
                        key={`${r.matchId}-${i}`}
                        className="rounded-8 flex items-center gap-2 border border-amber-400/15 bg-amber-400/5 px-3 py-2"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            {r.homeLogo && (
                              <Img
                                src={r.homeLogo}
                                alt=""
                                width={14}
                                height={14}
                                objectFit="contain"
                                className="shrink-0"
                              />
                            )}
                            <Typography
                              variant="caption"
                              weight="500"
                              className="truncate text-white/80"
                            >
                              {r.homeName ?? "—"}
                            </Typography>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {r.awayLogo && (
                              <Img
                                src={r.awayLogo}
                                alt=""
                                width={14}
                                height={14}
                                objectFit="contain"
                                className="shrink-0"
                              />
                            )}
                            <Typography
                              variant="caption"
                              weight="500"
                              className="truncate text-white/80"
                            >
                              {r.awayName ?? "—"}
                            </Typography>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCancel(r.matchId, r.gameId)}
                          className="rounded-6 shrink-0 p-1 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    tip={t("broadcast-center.reservation.select-match-hint")}
                    imageSize={80}
                    className="[&_p]:text-12 py-3 [&_img]:opacity-100 [&_p]:text-white/30"
                  />
                )}
              </div>
            </AccordionPrimitive.Panel>
          </AccordionPrimitive.Item>
        </AccordionPrimitive.Root>
      )}
    </div>
  )
}

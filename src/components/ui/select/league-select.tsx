"use client"

import React, { useMemo, useRef, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { ChevronDown, Flame, Globe, Search, Star, X } from "lucide-react"

import { resolveLeagueRegion } from "@/lib/country.utils"
import { cn } from "@/lib/utils"

import { useTranslation } from "@/i18n"

import type { LeagueApiItem } from "@/features/home/home.models"
import { Button } from "@/components/ui/button"
import { CountryFlag } from "@/components/ui/country-flag"
import { Img } from "@/components/ui/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import imgEmpty from "@assets/images/common/img-empty.webp"

/* ─── Types ──────────────────────────────────────────────────── */

export type LeagueItem = LeagueApiItem & { continent?: ContinentKey }

export interface LeagueGroup {
  letter: string
  items: LeagueItem[]
}

type ContinentKey = "asia" | "europe" | "north_america" | "south_america" | "other"
type SidebarKey = "all" | "popular" | ContinentKey

/* ─── Continent mapping ──────────────────────────────────────── */

const ASIA_IDS = new Set([
  5, 6, 10, 12, 16, 21, 33, 37, 40, 43, 45, 47, 52, 53, 60, 62, 63, 66, 68, 71, 75, 93, 102, 114,
  201, 226,
])
const EUROPE_IDS = new Set([
  3, 7, 8, 13, 15, 20, 27, 28, 30, 31, 35, 36, 39, 44, 48, 49, 50, 51, 54, 55, 65, 67, 69, 70, 72,
  76, 78, 83, 84, 87, 89, 90, 92, 94, 95, 96, 97, 98, 99, 100, 101, 104, 106, 110, 111, 112, 113,
  115, 116, 117, 118, 119, 121,
])
const NORTH_AMERICA_IDS = new Set([24, 25, 46, 58, 73, 79, 105, 108, 209, 228])
const SOUTH_AMERICA_IDS = new Set([18, 19, 22, 23, 29, 32, 42, 59, 85, 86, 91])

function getContinent(regionId: number): ContinentKey {
  if (ASIA_IDS.has(regionId)) return "asia"
  if (EUROPE_IDS.has(regionId)) return "europe"
  if (NORTH_AMERICA_IDS.has(regionId)) return "north_america"
  if (SOUTH_AMERICA_IDS.has(regionId)) return "south_america"
  return "other"
}

const CONTINENT_LABEL: Record<ContinentKey, string> = {
  asia: "Châu Á",
  europe: "Châu Âu",
  north_america: "Châu Mỹ",
  south_america: "Nam Mỹ",
  other: "Khác",
}

const CONTINENT_FLAG: Record<ContinentKey, string> = {
  asia: "JP",
  europe: "EU",
  north_america: "US",
  south_america: "BR",
  other: "UN",
}

const CONTINENT_TABS: ContinentKey[] = ["asia", "europe", "north_america", "south_america", "other"]

/* ─── Builders ───────────────────────────────────────────────── */

export function buildLeagueGroupsFromApi(items: LeagueApiItem[]): LeagueGroup[] {
  const groupMap = new Map<string, LeagueItem[]>()
  for (const item of items) {
    const continent = getContinent(item.regionId)
    if (!groupMap.has(continent)) groupMap.set(continent, [])
    groupMap.get(continent)!.push({ ...item, continent })
  }
  return [...groupMap.entries()].map(([letter, items]) => ({ letter, items }))
}

export function buildHotLeaguesFromApi(items: LeagueApiItem[]): LeagueItem[] {
  return items.map((item) => ({ ...item, continent: getContinent(item.regionId) }))
}

/* ─── Sort ───────────────────────────────────────────────────── */

type SortKey = "popular" | "name"

const SORT_LABELS: Record<SortKey, string> = {
  popular: "Phổ biến nhất",
  name: "Tên A–Z",
}

/* ─── Component ──────────────────────────────────────────────── */

interface LeagueSelectProps {
  groups: LeagueGroup[]
  hotLeagues?: LeagueItem[]
  value?: number[]
  onValueChange?: (value: number[]) => void
  disabled?: boolean
  className?: string
}

export function LeagueSelect({
  groups,
  hotLeagues = [],
  value = [],
  onValueChange,
  disabled,
  className,
}: LeagueSelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<number[]>(value)
  const [search, setSearch] = useState("")
  const [sidebarKey, setSidebarKey] = useState<SidebarKey>("all")
  const [sort, setSort] = useState<SortKey>("popular")
  const [showSort, setShowSort] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const hasSelection = value.length > 0

  /* all items flat */
  const allItems = useMemo(
    () => [...hotLeagues, ...groups.flatMap((g) => g.items)],
    [hotLeagues, groups]
  )

  const totalCount = allItems.length

  /* continent → items map */
  const continentMap = useMemo(() => {
    const map = new Map<ContinentKey, LeagueItem[]>()
    for (const group of groups) {
      map.set(group.letter as ContinentKey, group.items)
    }
    return map
  }, [groups])

  /* sidebar counts */
  const continentCounts = useMemo(() => {
    const out: Partial<Record<ContinentKey, number>> = {}
    for (const [key, items] of continentMap) out[key] = items.length
    return out
  }, [continentMap])

  /* sidebar items */
  const sidebarItems: Array<{
    key: SidebarKey
    label: string
    count: number
    flag?: string
    Icon?: React.ElementType
  }> = [
    { key: "all", label: t("home.league-select.all"), count: totalCount, Icon: Globe },
    {
      key: "popular",
      label: t("home.league-select.favorites"),
      count: hotLeagues.length,
      Icon: Star,
    },
    ...CONTINENT_TABS.map((c) => ({
      key: c,
      label: CONTINENT_LABEL[c],
      count: continentCounts[c] ?? 0,
      flag: CONTINENT_FLAG[c],
    })),
  ]

  /* filtered items for the current view */
  const currentItems = useMemo(() => {
    let base: LeagueItem[]
    if (sidebarKey === "popular") {
      base = hotLeagues
    } else if (sidebarKey === "all") {
      base = groups.flatMap((g) => g.items)
    } else {
      base = continentMap.get(sidebarKey as ContinentKey) ?? []
    }

    const q = search.trim().toLowerCase()
    if (q) base = base.filter((i) => i.name.toLowerCase().includes(q))

    return sort === "name"
      ? [...base].sort((a, b) => a.name.localeCompare(b.name))
      : [...base].sort((a, b) => (b.gameCount ?? 0) - (a.gameCount ?? 0))
  }, [sidebarKey, hotLeagues, groups, continentMap, search, sort])

  /* filtered hot for search */
  const filteredHot = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return hotLeagues
    return hotLeagues.filter((i) => i.name.toLowerCase().includes(q))
  }, [hotLeagues, search])

  const showFavorites = filteredHot.length > 0 && (sidebarKey === "all" || sidebarKey === "popular")

  /* actions */
  const toggle = (id: number) =>
    setDraft((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))

  const handleOpen = () => {
    if (disabled) return
    setDraft(value)
    setSearch("")
    setSidebarKey("all")
    setOpen(true)
  }

  const handleApply = () => {
    onValueChange?.(draft)
    setOpen(false)
  }

  const handleClearAll = () => {
    setDraft([])
    onValueChange?.([])
  }

  const handleSidebar = (key: SidebarKey) => {
    setSidebarKey(key)
    setSearch("")
    listRef.current?.scrollTo({ top: 0 })
  }

  /* trigger label */
  const displayLabel = () => {
    if (!hasSelection) return t("home.league-select.all")
    if (value.length === 1) {
      const item = allItems.find((l) => l.leagueId === value[0])
      return item?.name ?? `1 ${t("home.league-select.unit")}`
    }
    return `${value.length} ${t("home.league-select.unit")}`
  }

  const isEmpty = currentItems.length === 0 && !showFavorites

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={cn(
          "inline-flex h-9 w-[160px] items-center justify-between gap-2.5 max-sm:w-full",
          "rounded-8 border px-3.5 backdrop-blur-sm",
          "cursor-pointer transition-all duration-200 outline-none select-none",
          "disabled:pointer-events-none disabled:opacity-40",
          hasSelection
            ? "border-gold/50 bg-gold/10 hover:border-gold/70"
            : "border-white/20 bg-white/8 hover:border-white/35"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {hasSelection && (
            <span className="bg-gold text-primary font-700 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] leading-none">
              {value.length}
            </span>
          )}
          <Typography
            as="span"
            variant="label"
            className={cn("truncate", hasSelection ? "font-600 text-gold" : "text-white")}
          >
            {displayLabel()}
          </Typography>
        </div>
        <ChevronDown
          className={cn("size-3.5 shrink-0", hasSelection ? "text-gold/70" : "text-white/50")}
        />
      </button>

      {/* Modal */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 bg-black/75 backdrop-blur-sm data-closed:duration-150 data-open:duration-200" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex overflow-y-auto p-4">
            <Dialog.Popup
              className={cn(
                "relative m-auto flex h-[min(90vh,760px)] max-h-full w-full max-w-[1100px] flex-col overflow-hidden p-4",
                "rounded-12 bg-[#0e1523]",
                "shadow-[0_40px_100px_rgba(0,0,0,0.85)]",
                "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
                "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                "data-closed:duration-150 data-open:duration-200"
              )}
            >
              {/* ── Modal header ── */}
              <div className="flex shrink-0 items-center justify-between">
                <div>
                  <Typography variant="h5" className="leading-tight text-white">
                    {t("home.league-select.title")}
                  </Typography>
                  <Typography variant="caption" className="text-amber-400">
                    {t("home.league-select.subtitle")}
                  </Typography>
                </div>
                <Dialog.Close className="rounded-8 p-1.5 text-white/40 transition-colors hover:bg-white/8 hover:text-white">
                  <X className="size-5" />
                </Dialog.Close>
              </div>

              {/* ── Body ── */}
              <div className="mt-4 flex min-h-0 flex-1 gap-4 overflow-hidden max-sm:flex-col">
                {/* ── LEFT SIDEBAR ── */}
                <div className="card-glow rounded-12 flex w-[188px] shrink-0 flex-col self-start max-sm:w-full max-sm:self-auto">
                  {/* "DANH MỤC" header – hidden on mobile */}
                  <div className="px-4 pt-3.5 pb-2 max-sm:hidden">
                    <Typography
                      as="p"
                      size="10"
                      weight="700"
                      className="tracking-[0.18em] text-white/30 uppercase"
                    >
                      Danh mục
                    </Typography>
                  </div>

                  {/* nav list – vertical on desktop, horizontal scroll on mobile */}
                  <div
                    style={{ scrollbarWidth: "none" }}
                    className="max-sm:flex max-sm:flex-row max-sm:gap-1 max-sm:overflow-x-auto max-sm:px-3 max-sm:py-2"
                  >
                    {sidebarItems.map(({ key, label, count, flag, Icon }) => {
                      const active = sidebarKey === key
                      return (
                        <button
                          key={key}
                          onClick={() => handleSidebar(key)}
                          className={cn(
                            "group relative flex w-full cursor-pointer items-center justify-between py-2 pr-3 pl-4 text-left transition-colors duration-100",
                            "max-sm:rounded-6 max-sm:w-auto max-sm:shrink-0 max-sm:justify-start max-sm:gap-1.5 max-sm:px-2.5 max-sm:py-1.5",
                            active ? "bg-gold/10" : "hover:bg-white/4"
                          )}
                        >
                          {active && (
                            <span className="bg-gold absolute inset-y-0 left-0 w-[3px] rounded-r-full max-sm:hidden" />
                          )}

                          <div className="flex min-w-0 items-center gap-1.5">
                            {flag ? (
                              <CountryFlag
                                code={flag}
                                className={cn(
                                  "size-3.5 transition-opacity",
                                  active ? "opacity-100" : "opacity-50 group-hover:opacity-75"
                                )}
                              />
                            ) : Icon ? (
                              <Icon
                                className={cn(
                                  "size-3 shrink-0",
                                  Icon === Star && "fill-current",
                                  active ? "text-gold" : "text-white/35 group-hover:text-white/60"
                                )}
                              />
                            ) : null}
                            <Typography
                              as="span"
                              size="12"
                              weight={active ? "600" : "400"}
                              className={cn(
                                "transition-colors max-sm:whitespace-nowrap",
                                active ? "text-gold" : "text-white/55 group-hover:text-white/80"
                              )}
                            >
                              {label}
                            </Typography>
                          </div>

                          {count > 0 && (
                            <span
                              className={cn(
                                "font-600 ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] leading-none tabular-nums max-sm:hidden",
                                active
                                  ? "bg-gold/25 text-gold"
                                  : "bg-white/8 text-white/30 group-hover:bg-white/12"
                              )}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="card-glow rounded-12 flex min-w-0 flex-1 flex-col overflow-hidden px-5 max-sm:min-h-0">
                  {/* search + sort bar */}
                  <div className="flex shrink-0 items-center gap-3 py-3">
                    {/* search */}
                    <div className="rounded-8 flex flex-1 items-center gap-2 bg-white/6 px-3 transition-all focus-within:bg-white/8">
                      <Search className="size-3.5 shrink-0 text-white/35" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("home.league-select.search-placeholder")}
                        className="text-12 h-8 flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="text-white/30 hover:text-white/70"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    {/* sort */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSort((v) => !v)}
                        className={cn(
                          "rounded-8 flex shrink-0 cursor-pointer items-center gap-1.5 bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10",
                          showSort && "bg-white/10"
                        )}
                      >
                        <Typography as="span" size="12" className="whitespace-nowrap text-white/60">
                          Sắp xếp:{" "}
                          <span className="font-500 text-white/80">{SORT_LABELS[sort]}</span>
                        </Typography>
                        <ChevronDown
                          className={cn(
                            "size-3 text-white/40 transition-transform",
                            showSort && "rotate-180"
                          )}
                        />
                      </button>

                      {showSort && (
                        <div className="rounded-8 absolute top-full right-0 z-20 mt-1 overflow-hidden bg-[#141e30] shadow-xl">
                          {(["popular", "name"] as SortKey[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setSort(s)
                                setShowSort(false)
                              }}
                              className={cn(
                                "flex w-full cursor-pointer items-center px-4 py-2.5 transition-colors hover:bg-white/8",
                                sort === s ? "text-gold font-500" : "text-white/70"
                              )}
                            >
                              <Typography
                                as="span"
                                size="12"
                                className="whitespace-nowrap text-inherit"
                              >
                                {SORT_LABELS[s]}
                              </Typography>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* scrollable content */}
                  <div
                    ref={listRef}
                    className="-mx-5 flex flex-1 flex-col overflow-y-auto overscroll-contain pb-8"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(255,255,255,0.07) transparent",
                    }}
                    onClick={() => showSort && setShowSort(false)}
                  >
                    {/* ── YÊU THÍCH section ── */}
                    {showFavorites && (
                      <div className="px-5 pt-0 pb-3">
                        <div className="mb-2.5 flex items-center gap-1.5">
                          <Star className="fill-gold text-gold size-4" />
                          <Typography
                            as="p"
                            size="16"
                            weight="500"
                            className="text-white uppercase"
                          >
                            Yêu thích
                          </Typography>
                        </div>
                        <div className="max-xs:grid-cols-1 grid grid-cols-4 gap-2 max-lg:grid-cols-3 max-md:grid-cols-2">
                          {filteredHot.map((league) => {
                            const sel = draft.includes(league.leagueId)
                            const region = resolveLeagueRegion({
                              hostCountry: league.hostCountry,
                              regionId: league.regionId,
                              leagueName: league.name,
                            })
                            return (
                              <button
                                key={league.leagueId}
                                onClick={() => toggle(league.leagueId)}
                                className={cn(
                                  "rounded-6 group relative flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 outline-none",
                                  sel
                                    ? "bg-gold/12 ring-gold/30 shadow-[0_2px_16px_rgba(251,191,36,0.15)] ring-1"
                                    : "bg-white/4 hover:bg-white/7"
                                )}
                              >
                                {/* logo */}
                                {league.logo ? (
                                  <Img
                                    src={league.logo}
                                    alt={league.name}
                                    width={44}
                                    height={44}
                                    objectFit="contain"
                                    className="size-11 shrink-0 object-center"
                                  />
                                ) : (
                                  <div
                                    className={cn(
                                      "font-700 text-14 flex size-11 shrink-0 items-center justify-center",
                                      sel ? "bg-gold/20 text-gold" : "bg-white/10 text-white/40"
                                    )}
                                  >
                                    {league.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}

                                {/* text */}
                                <div className="min-w-0 flex-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger
                                        render={
                                          <p
                                            className={cn(
                                              "text-12 font-500 truncate leading-tight",
                                              sel ? "text-gold" : "text-white/85"
                                            )}
                                          />
                                        }
                                      >
                                        {league.name}
                                      </TooltipTrigger>
                                      <TooltipContent>{league.name}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger
                                        render={<div className="mt-1 flex items-center gap-1" />}
                                      >
                                        <CountryFlag
                                          code={region.iso}
                                          title={region.label}
                                          className="h-2.5 w-3.5 opacity-80"
                                        />
                                        <p className="text-10 truncate leading-tight text-white/70">
                                          {region.label}
                                        </p>
                                      </TooltipTrigger>
                                      <TooltipContent>{region.label}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>

                                {/* HOT badge — absolute top-right */}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger
                                      render={
                                        <span className="rounded-4 absolute top-1.5 right-1.5 flex cursor-default items-center gap-0.5 bg-red-600 px-1 py-0.5" />
                                      }
                                    >
                                      <Flame className="size-2 fill-white text-white" />
                                      <span className="font-500 text-[8px] leading-none text-white uppercase">
                                        Hot
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Giải đấu nổi bật</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── League list ── */}
                    {isEmpty ? (
                      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3">
                        <Img src={imgEmpty} alt="" width={60} height={60} className="opacity-30" />
                        <Typography size="12" className="text-white/35">
                          {t("home.league-select.empty")}
                        </Typography>
                      </div>
                    ) : sidebarKey !== "popular" && currentItems.length > 0 ? (
                      <div className="px-5 pb-6">
                        <div className="text-10 font-700 tracking-1 hidden grid-cols-[28px_minmax(0,1.8fr)_72px_minmax(100px,1fr)_72px_56px] items-center gap-3 px-2.5 py-1.5 text-white/35 uppercase md:grid">
                          <span />
                          <span>{t("home.league-select.col-league")}</span>
                          <span>{t("home.league-select.col-level")}</span>
                          <span>{t("home.league-select.col-region")}</span>
                          <span>{t("home.league-select.col-status")}</span>
                          <span className="text-right">{t("home.league-select.col-matches")}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {currentItems.map((league) => {
                            const sel = draft.includes(league.leagueId)
                            const region = resolveLeagueRegion({
                              hostCountry: league.hostCountry,
                              regionId: league.regionId,
                              leagueName: league.name,
                            })
                            return (
                              <button
                                key={league.leagueId}
                                onClick={() => toggle(league.leagueId)}
                                className={cn(
                                  "rounded-8 grid w-full cursor-pointer grid-cols-[28px_minmax(0,1fr)] items-center gap-3 border px-2.5 py-1.5 text-left transition-all duration-150 md:grid-cols-[28px_minmax(0,1.8fr)_72px_minmax(100px,1fr)_72px_56px]",
                                  sel
                                    ? "border-gold/25 bg-gold/8 shadow-[inset_0_1px_0_rgba(251,191,36,0.2),0_4px_14px_rgba(251,191,36,0.1)]"
                                    : "border-white/8 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/14 hover:bg-white/[0.06]"
                                )}
                              >
                                <Star
                                  className={cn(
                                    "size-4 shrink-0",
                                    league.isHot ? "fill-gold text-gold" : "text-gold/70 fill-none"
                                  )}
                                />

                                <div className="flex min-w-0 items-center gap-3">
                                  {league.logo ? (
                                    <Img
                                      src={league.logo}
                                      alt=""
                                      width={28}
                                      height={28}
                                      objectFit="contain"
                                      className="size-7 shrink-0 object-center"
                                    />
                                  ) : (
                                    <div className="font-700 text-10 flex size-7 shrink-0 items-center justify-center bg-white/10 text-white/40">
                                      {league.name.slice(0, 1)}
                                    </div>
                                  )}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger
                                        render={
                                          <p
                                            className={cn(
                                              "text-12 truncate leading-tight",
                                              sel ? "font-600 text-gold" : "text-white/90"
                                            )}
                                          />
                                        }
                                      >
                                        {league.name}
                                      </TooltipTrigger>
                                      <TooltipContent>{league.name}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>

                                <span className="hidden md:inline-flex">
                                  {league.level >= 1 && league.level < 99 ? (
                                    <span className="rounded-6 bg-purple/25 text-10 font-600 px-2 py-0.5 text-white/90">
                                      {t("home.league-select.level").replace(
                                        "{{n}}",
                                        String(league.level)
                                      )}
                                    </span>
                                  ) : null}
                                </span>

                                <div className="hidden min-w-0 items-center gap-1.5 md:flex">
                                  <CountryFlag
                                    code={region.iso}
                                    title={region.label}
                                    className="h-3.5 w-5 opacity-90"
                                  />
                                  <Typography
                                    as="p"
                                    size="12"
                                    className="truncate leading-tight text-white/70"
                                  >
                                    {region.label}
                                  </Typography>
                                </div>

                                <div className="hidden md:flex">
                                  {league.isHot ? (
                                    <span className="rounded-4 flex items-center gap-0.5 bg-red-600 px-1 py-0.5">
                                      <Flame className="size-2 fill-white text-white" />
                                      <span className="font-500 text-[8px] leading-none text-white uppercase">
                                        {t("home.league-select.hot")}
                                      </span>
                                    </span>
                                  ) : null}
                                </div>

                                <span
                                  className={cn(
                                    "text-12 hidden text-right tabular-nums md:block",
                                    sel ? "font-700 text-gold" : "text-white/50"
                                  )}
                                >
                                  {league.gameCount ?? 0}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="mt-4 flex shrink-0 items-center justify-end gap-2 max-sm:flex-col-reverse max-sm:gap-1.5">
                <Button
                  onClick={handleClearAll}
                  variant="cancel"
                  size="sm"
                  disabled={draft.length === 0}
                  className="text-white max-sm:w-full"
                >
                  {t("home.league-select.clear-all")}
                </Button>
                <Button
                  onClick={handleApply}
                  variant="gradient"
                  size="sm"
                  className="max-sm:w-full"
                >
                  {draft.length > 0 && (
                    <span className="text-10 font-700 flex h-4 min-w-4 items-center justify-center rounded-full bg-black/12 px-1 text-black/70 tabular-nums sm:h-5 sm:min-w-5 sm:px-1.5">
                      {draft.length}
                    </span>
                  )}
                  {t("home.league-select.apply")}
                </Button>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

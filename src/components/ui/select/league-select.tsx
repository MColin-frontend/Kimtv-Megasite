"use client"

import { useState } from "react"
import { Popover } from "@base-ui/react/popover"
import { Bookmark, ChevronDown, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { useTranslation } from "@/i18n"

import type { LeagueApiItem } from "@/features/home/home.models"
import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

import imgEmpty from "@assets/images/common/img-empty.png"

export interface LeagueItem {
  id: number
  name: string
  count?: number
}

export interface LeagueGroup {
  letter: string
  items: LeagueItem[]
}

export function buildLeagueGroupsFromApi(items: LeagueApiItem[]): LeagueGroup[] {
  const groupMap = new Map<string, LeagueItem[]>()
  for (const item of items) {
    const letter = item.firstLetter?.toUpperCase() || "#"
    if (!groupMap.has(letter)) groupMap.set(letter, [])
    groupMap.get(letter)!.push({ id: item.leagueId, name: item.name, count: item.gameCount })
  }
  return [...groupMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, items]) => ({ letter, items }))
}

interface LeagueSelectProps {
  groups: LeagueGroup[]
  favorites?: LeagueItem[]
  value?: number[]
  onValueChange?: (value: number[]) => void
  className?: string
}

export function LeagueSelect({
  groups,
  favorites = [],
  value = [],
  onValueChange,
  className,
}: LeagueSelectProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const allItems: LeagueItem[] = [...favorites, ...groups.flatMap((g) => g.items)]
  const hasSelection = value.length > 0

  const filteredGroups = search.trim()
    ? groups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
        }))
        .filter((g) => g.items.length > 0)
    : groups

  const filteredFavorites = search.trim()
    ? favorites.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    : favorites

  const toggle = (id: number) => {
    const next = value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    onValueChange?.(next)
  }

  const clearAll = () => onValueChange?.([])

  const displayLabel = () => {
    if (!hasSelection) return t("home.league-select.all")
    if (value.length === 1) {
      const item = allItems.find((l) => l.id === value[0])
      return item?.name ?? `1 ${t("home.league-select.unit")}`
    }
    return `${value.length} ${t("home.league-select.unit")}`
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover.Root>
        <Popover.Trigger
          className={cn(
            "group/trigger inline-flex h-9 w-[160px] max-sm:w-full items-center justify-between gap-2.5",
            "rounded-8 border px-3.5 backdrop-blur-sm",
            "cursor-pointer outline-none select-none",
            "transition-all duration-200",
            hasSelection
              ? "border-gold/50 bg-gold/10 hover:border-gold/70 hover:bg-gold/15"
              : "border-white/20 bg-white/8 hover:border-white/35 hover:bg-white/12",
            "data-[popup-open]:ring-2",
            hasSelection ? "data-[popup-open]:ring-gold/30" : "data-[popup-open]:ring-white/15"
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {hasSelection && (
              <span className="bg-gold font-700 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] leading-none">
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
            className={cn(
              "size-3.5 shrink-0 transition-transform duration-200",
              "group-data-[popup-open]/trigger:rotate-180",
              hasSelection ? "text-gold/70" : "text-white"
            )}
          />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Positioner side="bottom" align="end" sideOffset={8}>
            <Popover.Popup
              className={cn(
                "z-[999] w-[min(600px,95vw)] overflow-hidden",
                "rounded-8 popup-bg border border-white/10",
                "shadow-[0_20px_60px_rgba(0,0,0,0.6)]",
                "origin-(--transform-origin)",
                "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97] data-open:slide-in-from-top-2",
                "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.97]",
                "data-closed:duration-100 data-open:duration-150"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Typography as="span" variant="label" weight="600" className="text-white">
                    {t("home.league-select.title")}
                  </Typography>
                  {hasSelection && (
                    <span className="rounded-4 bg-gold/20 ring-gold/30 inline-flex items-center px-2 py-0.5 ring-1">
                      <Typography as="span" variant="caption" weight="700" className="text-gold">
                        {value.length} {t("home.league-select.selected")}
                      </Typography>
                    </span>
                  )}
                </div>

                <button
                  onClick={clearAll}
                  className={cn(
                    "rounded-8 flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 transition-colors duration-150",
                    hasSelection ? "text-muted hover:bg-white/8 hover:text-white" : "text-gold"
                  )}
                >
                  {hasSelection ? (
                    <X className="size-3" />
                  ) : (
                    <span className="bg-gold size-1.5 rounded-full" />
                  )}
                  <Typography as="span" variant="caption" weight="500" className="text-inherit">
                    {t("home.league-select.all")}
                  </Typography>
                </button>
              </div>

              {/* Search */}
              <div className="border-b border-white/8 px-4 py-2.5">
                <div className="rounded-8 flex items-center gap-2 bg-white/6 px-3 ring-1 ring-white/10 focus-within:ring-white/20">
                  <Search className="size-3.5 shrink-0 text-white" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("home.league-select.search-placeholder")}
                    className="text-12 font-400 placeholder:text-placeholder h-8 flex-1 bg-transparent text-white outline-none"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="hover:text-muted flex size-4 cursor-pointer items-center justify-center rounded-full text-white"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable list */}
              <div
                className="overflow-y-auto overscroll-contain"
                style={{
                  height: 360,
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.08) transparent",
                }}
              >
                {filteredGroups.length === 0 && filteredFavorites.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-3">
                    <Img src={imgEmpty} alt="empty" width={80} height={80} className="opacity-50" />
                    <Typography variant="body" className="text-white">
                      {t("home.league-select.empty")}
                    </Typography>
                  </div>
                )}

                {filteredFavorites.length > 0 && (
                  <div className="border-b border-white/8 px-4 py-3">
                    <div className="mb-2.5 flex items-center gap-1.5">
                      <Bookmark className="fill-gold text-gold size-3.5" />
                      <Typography
                        as="span"
                        variant="caption"
                        className="font-700 tracking-widest text-white uppercase"
                      >
                        {t("home.league-select.favorites")}
                      </Typography>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {filteredFavorites.map((league) => (
                        <LeagueOption
                          key={league.id}
                          league={league}
                          selected={value.includes(league.id)}
                          onSelect={() => toggle(league.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredGroups.map((group) => (
                  <div
                    key={group.letter}
                    className="border-b border-white/5 px-4 py-3 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <Typography
                        as="span"
                        variant="caption"
                        className="font-700 w-5 shrink-0 pt-1.5 leading-none text-white"
                      >
                        {group.letter}
                      </Typography>
                      <div className="flex flex-1 flex-wrap gap-1.5">
                        {group.items.map((league) => (
                          <LeagueOption
                            key={league.id}
                            league={league}
                            selected={value.includes(league.id)}
                            onSelect={() => toggle(league.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}

function LeagueOption({
  league,
  selected,
  onSelect,
}: {
  league: LeagueItem
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "rounded-8 inline-flex cursor-pointer items-center gap-1.5 px-2 py-1",
        "transition-all duration-100",
        selected
          ? "bg-gold/15 ring-gold/35 hover:bg-gold/20 ring-1"
          : "hover:bg-white/8 hover:ring-1 hover:ring-white/10"
      )}
    >
      <Typography
        variant="label"
        className={cn(
          "leading-none whitespace-nowrap",
          selected ? "font-600 text-gold" : "text-white"
        )}
      >
        {league.name}
      </Typography>
      {league.count != null && (
        <Typography
          variant="label"
          className={cn("font-600", selected ? "text-gold/70" : "text-white")}
        >
          {league.count}
        </Typography>
      )}
    </button>
  )
}

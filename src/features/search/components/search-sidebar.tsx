"use client"

import { useState } from "react"
import { ChevronDown, Clock, LayoutGrid, Search, Trash2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/use-router"

import { useTranslation } from "@/i18n"

import { Empty } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { HISTORY_LABEL_MAX, useSearchHistory } from "../hooks/use-search-history"
import {
  SEARCH_ANCHOR_PAGE_KEY,
  SEARCH_FILTER_KEY,
  SEARCH_FILTER_TYPES,
  SEARCH_MATCH_PAGE_KEY,
  SEARCH_NEWS_PAGE_KEY,
  SEARCH_QUERY_KEY,
  SEARCH_USERS_PAGE_KEY,
  SearchFilterEnum,
} from "../search.constants"

function SidebarSection({
  icon: Icon,
  title,
  iconColor,
  iconBg,
  action,
  children,
}: {
  icon: React.ElementType
  title: string
  iconColor: string
  iconBg: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="card-glow rounded-12 overflow-hidden">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2 px-4 py-3.5 outline-none"
        >
          <div className={cn("rounded-6 flex size-6 items-center justify-center", iconBg)}>
            <Icon className={cn("size-3", iconColor)} aria-hidden />
          </div>
          <span className="text-12 font-600 tracking-4 leading-150 text-white/80 uppercase">
            {title}
          </span>
          <ChevronDown
            className={cn(
              "ml-auto size-3.5 text-white/50 transition-transform duration-200",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </button>
        {action}
      </div>
      {open && <div className="border-t border-white/6">{children}</div>}
    </div>
  )
}

export function SearchSidebar() {
  const { t } = useTranslation()
  const { getParam, setParams } = useRouter()
  const query = getParam(SEARCH_QUERY_KEY) ?? ""
  const activeFilter = (getParam(SEARCH_FILTER_KEY) ?? SearchFilterEnum.ALL) as SearchFilterEnum
  const [historyFilter, setHistoryFilter] = useState<string>("")
  const {
    history,
    add: addHistory,
    remove: removeHistory,
    clear: clearHistory,
  } = useSearchHistory()

  function handleFilterChange(key: SearchFilterEnum) {
    setParams(
      {
        [SEARCH_FILTER_KEY]: key === SearchFilterEnum.ALL ? null : key,
        [SEARCH_MATCH_PAGE_KEY]: null,
        [SEARCH_NEWS_PAGE_KEY]: null,
        [SEARCH_USERS_PAGE_KEY]: null,
        [SEARCH_ANCHOR_PAGE_KEY]: null,
      },
      { replace: true, scroll: false }
    )
  }

  function handleTag(tag: string) {
    setParams({ [SEARCH_QUERY_KEY]: tag || null }, { replace: true, scroll: false })
  }

  return (
    <aside className="sticky top-23 hidden h-fit w-80 shrink-0 flex-col gap-3 overflow-y-auto lg:flex">
      <SidebarSection
        icon={LayoutGrid}
        title={t("search.sidebar.explore")}
        iconColor="text-gold"
        iconBg="bg-gold/15"
      >
        <nav className="flex flex-col gap-1 p-2">
          {SEARCH_FILTER_TYPES.map(({ key, labelKey, icon: Icon }) => {
            const active = activeFilter === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleFilterChange(key as SearchFilterEnum)}
                className={cn(
                  "group rounded-8 relative flex w-full items-center gap-3 px-3 py-2 transition-all duration-150",
                  active
                    ? "bg-amber-400/12 text-amber-300"
                    : "text-white/75 hover:bg-white/6 hover:text-white"
                )}
              >
                {active && (
                  <span className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-amber-400" />
                )}
                <Icon
                  className={cn(
                    "size-[15px] shrink-0 transition-colors",
                    active ? "text-amber-300" : "text-white/55 group-hover:text-white/85"
                  )}
                />
                <p
                  className={cn(
                    "text-12 sm:text-14 leading-none",
                    active ? "font-500" : "font-400"
                  )}
                >
                  {t(labelKey as Parameters<typeof t>[0])}
                </p>
              </button>
            )
          })}
        </nav>
      </SidebarSection>

      <SidebarSection
        icon={Clock}
        title={t("search.sidebar.history")}
        iconColor="text-amber-400"
        iconBg="bg-amber-400/15"
      >
        {history.length === 0 ? (
          <Empty
            tip={t("search.sidebar.history-empty")}
            imageSize={80}
            className="min-h-[300px] py-14"
          />
        ) : (
          <div className="flex flex-col gap-2 p-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-full border border-white/15 bg-[#0d1829] px-3">
                <Search className="size-3.5 shrink-0 text-white/40" />
                <Input
                  variant="ghost"
                  inputSize="sm"
                  wrapperClassName="flex-1"
                  placeholder={t("search.sidebar.history-filter-placeholder")}
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setHistoryFilter("")
                    if (e.key === "Enter") e.preventDefault()
                  }}
                />
              </div>
              <Tooltip>
                <TooltipTrigger onClick={clearHistory}>
                  <Trash2 className="size-3.5 shrink-0 cursor-pointer text-red-400 transition-colors hover:text-red-300" />
                </TooltipTrigger>
                <TooltipContent side="left">{t("search.sidebar.history-clear")}</TooltipContent>
              </Tooltip>
            </div>
            <nav className="flex h-[300px] scrollbar-thin flex-col gap-1 overflow-y-auto p-2">
              {history
                .filter(
                  (h) => !historyFilter || h.toLowerCase().includes(historyFilter.toLowerCase())
                )
                .map((label) => {
                  const truncated = label.length > HISTORY_LABEL_MAX
                  const display = truncated ? label.slice(0, HISTORY_LABEL_MAX) + "..." : label
                  const active = label.toLowerCase() === query.toLowerCase()
                  return (
                    <Tooltip key={label}>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            onClick={() => {
                              handleTag(label)
                              addHistory(label)
                            }}
                            className={cn(
                              "group rounded-8 relative flex w-full items-center gap-3 px-3 py-2 transition-all duration-150",
                              active
                                ? "bg-amber-400/12 text-amber-300"
                                : "text-white/75 hover:bg-white/6 hover:text-white"
                            )}
                          />
                        }
                      >
                        {active && (
                          <span className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-amber-400" />
                        )}
                        <Clock
                          className={cn(
                            "size-[15px] shrink-0 transition-colors",
                            active ? "text-amber-400" : "text-white/30 group-hover:text-white/55"
                          )}
                        />
                        <span className="text-12 sm:text-14 font-400 flex-1 truncate text-left leading-none">
                          {display}
                        </span>
                        <X
                          className="size-3 shrink-0 cursor-pointer text-red-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeHistory(label)
                          }}
                        />
                      </TooltipTrigger>
                      {truncated && <TooltipContent side="right">{label}</TooltipContent>}
                    </Tooltip>
                  )
                })}
            </nav>
          </div>
        )}
      </SidebarSection>
    </aside>
  )
}

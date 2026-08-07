"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Clock, LayoutGrid, Search, Trash2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/use-router"

import { useTranslation } from "@/i18n"
import { FOOTBALL_GAME_MONGO_ID } from "@/constants/component/home.constants"

import { Empty } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import {
  HISTORY_LABEL_MAX,
  SEARCH_HISTORY_KEY,
  useSearchHistory,
} from "../hooks/use-search-history"
import {
  fetchAttentionAnchors,
  fetchGameMatchLive,
  fetchSearchMatches,
  fetchSearchNews,
  fetchSearchUsers,
} from "../search.api"
import {
  SEARCH_FILTER_KEY,
  SEARCH_FILTER_TYPES,
  SEARCH_QUERY_KEY,
  SearchFilterEnum,
} from "../search.constants"

function SearchForm({
  onSearch,
  placeholder: placeholderProp,
  nameKey = SEARCH_QUERY_KEY,
  size = "lg",
}: {
  onSearch?: (q: string) => void
  placeholder?: string
  nameKey?: string
  size?: "sm" | "default" | "lg"
  compact?: boolean
}) {
  const { t } = useTranslation()
  const { setParams, removeParams, getParam } = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const urlQuery = getParam(nameKey) ?? ""

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = ((new FormData(e.currentTarget).get(nameKey) as string) ?? "").trim()
    if (!q) return
    setParams({ [nameKey]: q }, { replace: true })
    onSearch?.(q)
  }

  const handleClear = () => {
    formRef.current?.reset()
    removeParams(nameKey, { replace: true, scroll: false })
  }

  return (
    <form
      ref={formRef}
      key={urlQuery}
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full max-w-[900px]! items-center border border-white/15 bg-[#0d1829]",
        "shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        "rounded-full"
      )}
    >
      <Input
        variant="ghost"
        inputSize={size}
        wrapperClassName={cn("flex-1 rounded-full", size === "sm" ? "px-3" : "px-5")}
        leftIcon={<Search className={size === "sm" ? "h-3.5 w-3.5" : "h-[18px] w-[18px]"} />}
        name={nameKey}
        type="text"
        defaultValue={urlQuery}
        autoComplete="off"
        placeholder={placeholderProp ?? t("search.form.placeholder")}
        className="placeholder:text-white/30 placeholder:italic"
        onKeyDown={(e) => e.key === "Escape" && formRef.current?.reset()}
        rightIcon={
          urlQuery ? (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white",
                size === "sm" ? "size-[15px]" : "size-6"
              )}
            >
              <X className={size === "sm" ? "size-2.5" : "size-3"} />
            </button>
          ) : undefined
        }
      />
    </form>
  )
}

// ── Sidebar collapsible section ──────────────────────────────────────────────

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
      <div className="flex items-center justify-between pr-3">
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

// ── Results page (has query) ──────────────────────────────────────────────────

function SearchResults({ onTag }: { onTag: (tag: string) => void }) {
  const { getParam, setParams } = useRouter()
  const query = getParam(SEARCH_QUERY_KEY) ?? ""
  const activeFilter = (getParam(SEARCH_FILTER_KEY) ?? SearchFilterEnum.ALL) as SearchFilterEnum
  const [historyFilter, setHistoryFilter] = useState(() => getParam(SEARCH_HISTORY_KEY) ?? "")
  const {
    history,
    add: addHistory,
    remove: removeHistory,
    clear: clearHistory,
  } = useSearchHistory()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any>(null)
  const [searchLoading, setSearchLoading] = useState(true)

  useEffect(() => {
    const params = { keyword: query, pageIndex: 1 }

    const req = (() => {
      switch (activeFilter) {
        case SearchFilterEnum.MATCH:
          return fetchSearchMatches(params)
        case SearchFilterEnum.NEWS:
          return fetchSearchNews(params)
        case SearchFilterEnum.USER:
          return fetchSearchUsers(params)
        case SearchFilterEnum.STREAM:
          return fetchAttentionAnchors()
        case SearchFilterEnum.GAME:
          return fetchGameMatchLive({ id: FOOTBALL_GAME_MONGO_ID, typeScreen: 0 })
        default:
          return Promise.allSettled([
            fetchSearchMatches(params),
            fetchSearchNews(params),
            fetchSearchUsers(params),
            fetchAttentionAnchors(),
            fetchGameMatchLive({ id: FOOTBALL_GAME_MONGO_ID, typeScreen: 0 }),
          ]).then(([matches, news, users, anchors, gameLive]) => ({
            matches: matches.status === "fulfilled" ? matches.value : null,
            news: news.status === "fulfilled" ? news.value : null,
            users: users.status === "fulfilled" ? users.value : null,
            anchors: anchors.status === "fulfilled" ? anchors.value : null,
            gameLive: gameLive.status === "fulfilled" ? gameLive.value : null,
          }))
      }
    })()

    req.then(setSearchResults).finally(() => setSearchLoading(false))
  }, [query, activeFilter])

  function handleFilterChange(key: SearchFilterEnum) {
    setParams(
      { [SEARCH_FILTER_KEY]: key === SearchFilterEnum.ALL ? null : key },
      { replace: true, scroll: false }
    )
  }

  console.log("searchLoading", searchLoading)
  console.log("searchResults", searchResults)

  return (
    <div className="container flex min-h-screen flex-col gap-20">
      <section className="relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-baseline gap-3">
              <Typography
                as="span"
                size="48"
                weight="800"
                className="leading-125 text-white uppercase italic"
              >
                TÌM KIẾM
              </Typography>
              <Typography
                as="span"
                size="48"
                weight="800"
                className="text-gold drop-shadow-gold leading-100 uppercase italic"
              >
                {query ? `"${query}"` : "Mọi Thứ"}
              </Typography>
            </div>
            <Typography variant="body" className="text-white/80">
              Tìm kiếm trận đấu, đội bóng, cầu thủ, giải đấu, tin tức và nhiều hơn nữa.
            </Typography>
          </div>
          <SearchForm onSearch={addHistory} />
        </div>
      </section>

      <div className="flex gap-6">
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-80 shrink-0 flex-col gap-3 overflow-y-auto p-4 lg:flex">
          <SidebarSection
            icon={LayoutGrid}
            title="Khám Phá"
            iconColor="text-gold"
            iconBg="bg-gold/15"
          >
            <nav className="flex flex-col gap-1 p-2">
              {SEARCH_FILTER_TYPES.map(({ key, label, icon: Icon }) => {
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
                        active ? "text-amber-400" : "text-white/55 group-hover:text-white/85"
                      )}
                    />
                    <p
                      className={cn(
                        "text-12 sm:text-14 leading-none",
                        active ? "font-500" : "font-400"
                      )}
                    >
                      {label}
                    </p>
                  </button>
                )
              })}
            </nav>
          </SidebarSection>

          <SidebarSection
            icon={Clock}
            title="Lịch Sử Tìm Kiếm"
            iconColor="text-amber-400"
            iconBg="bg-amber-400/15"
          >
            {history.length === 0 ? (
              <Empty
                tip="Chưa có lịch sử tìm kiếm"
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
                      placeholder="Lọc lịch sử..."
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
                    <TooltipContent side="left">Xoá tất cả lịch sử</TooltipContent>
                  </Tooltip>
                </div>
                <nav className="flex h-[300px] flex-col gap-1 overflow-y-auto p-2">
                  {history
                    .filter(
                      (h) => !historyFilter || h.toLowerCase().includes(historyFilter.toLowerCase())
                    )
                    .map((label) => {
                      const truncated = label.length > HISTORY_LABEL_MAX
                      const display = truncated ? label.slice(0, HISTORY_LABEL_MAX) + "..." : label
                      const active = label.toLowerCase() === query.toLowerCase()
                      return (
                        <Tooltip key={label} className="w-full">
                          <TooltipTrigger className="w-full">
                            <button
                              type="button"
                              onClick={() => {
                                onTag(label)
                                addHistory(label)
                              }}
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
                              <Clock
                                className={cn(
                                  "size-[15px] shrink-0 transition-colors",
                                  active
                                    ? "text-amber-400"
                                    : "text-white/30 group-hover:text-white/55"
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
                            </button>
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

        <div></div>
      </div>
    </div>
  )
}

export function SearchPage() {
  const { setParams } = useRouter()

  function handleTag(tag: string) {
    setParams({ [SEARCH_QUERY_KEY]: tag || "" }, { replace: true, scroll: false })
  }

  return <SearchResults onTag={handleTag} />
}

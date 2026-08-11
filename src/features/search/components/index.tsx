"use client"

import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/use-router"

import { useTranslation } from "@/i18n"

import { MatchSchedule } from "@/features/home/components/match-schedule"
import { LiveMatchFilterSection } from "@/features/live-schedule/components/live-match-filter-section"
import { Typography } from "@/components/ui/typography"

import { useSearchHistory } from "../hooks/use-search-history"
import {
  SEARCH_ANCHOR_PAGE_KEY,
  SEARCH_FILTER_KEY,
  SEARCH_FILTER_TYPES,
  SEARCH_MATCH_PAGE_KEY,
  SEARCH_NEWS_PAGE_KEY,
  SEARCH_USERS_PAGE_KEY,
  SearchAllResultKeyEnum,
  SearchFilterEnum,
} from "../search.constants"
import { SearchAttentionAnchorSection } from "./search-attention-anchor-section"
import { SearchForm } from "./search-form"
import { SearchNewsSection } from "./search-news-section"
import { SearchSidebar } from "./search-sidebar"
import { SearchUsersSection } from "./search-users-section"

function SearchMobileFilters() {
  const { t } = useTranslation()
  const { getParam, setParams } = useRouter()
  const activeFilter = (getParam(SEARCH_FILTER_KEY) ?? SearchFilterEnum.ALL) as SearchFilterEnum

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

  return (
    <div className="flex w-full max-w-full min-w-0 scrollbar-none gap-1.5 overflow-x-auto overscroll-x-contain lg:hidden">
      {SEARCH_FILTER_TYPES.map(({ key, labelKey, icon: Icon }) => {
        const active = activeFilter === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleFilterChange(key as SearchFilterEnum)}
            className={cn(
              "rounded-8 flex shrink-0 items-center gap-1.5 px-3 py-2 transition-all duration-150",
              "text-12 font-500",
              active
                ? "bg-amber-400/15 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                : "bg-white/5 text-white/60 hover:bg-white/8 hover:text-white/80"
            )}
          >
            <Icon
              className={cn("size-3.5 shrink-0", active ? "text-amber-300" : "text-white/45")}
            />
            <span className="whitespace-nowrap">{t(labelKey as Parameters<typeof t>[0])}</span>
          </button>
        )
      })}
    </div>
  )
}

function SearchResults() {
  const { t } = useTranslation()
  const { getParam } = useRouter()
  const activeFilter = (getParam(SEARCH_FILTER_KEY) ?? SearchFilterEnum.ALL) as SearchFilterEnum
  const isAll = activeFilter === SearchFilterEnum.ALL

  const { add: addHistory } = useSearchHistory()

  const show = (f: SearchFilterEnum) => isAll || activeFilter === f

  const sections = [
    { key: SearchAllResultKeyEnum.MATCHES, visible: isAll, node: <MatchSchedule cols={4} /> },
    {
      key: SearchFilterEnum.MATCH,
      visible: activeFilter === SearchFilterEnum.MATCH,
      node: <LiveMatchFilterSection hideFilter cols={3} pageKey={SEARCH_MATCH_PAGE_KEY} />,
    },
    {
      key: SearchFilterEnum.NEWS,
      visible: show(SearchFilterEnum.NEWS),
      node: <SearchNewsSection />,
    },
    {
      key: SearchFilterEnum.USER,
      visible: show(SearchFilterEnum.USER),
      node: <SearchUsersSection />,
    },
    {
      key: SearchFilterEnum.STREAM,
      visible: show(SearchFilterEnum.STREAM),
      node: <SearchAttentionAnchorSection />,
    },
  ]

  return (
    <div className="container flex min-h-screen flex-col gap-20 max-lg:gap-12 max-md:gap-6 max-sm:gap-3">
      <section className="relative z-10 flex flex-col items-center gap-5 overflow-hidden max-md:gap-4 max-sm:gap-3">
        <div className="flex flex-col items-center gap-3 max-sm:gap-2">
          <div className="flex flex-wrap items-baseline justify-center gap-2 max-sm:gap-1.5 sm:gap-3">
            <Typography
              as="span"
              size="48"
              weight="800"
              className="max-md:text-36! max-sm:text-30! leading-125 text-white uppercase italic"
            >
              {t("search.hero.title")}
            </Typography>
            <Typography
              as="span"
              size="48"
              weight="800"
              className="text-gold drop-shadow-gold max-md:text-36! max-sm:text-30! leading-100 uppercase italic"
            >
              {t("search.hero.subtitle")}
            </Typography>
          </div>
          <Typography
            variant="body"
            className="max-sm:text-12 text-center text-white/80 max-sm:leading-150"
          >
            {t("search.hero.description")}
          </Typography>
        </div>
        <div className="hidden w-full justify-center lg:flex">
          <SearchForm onSearch={addHistory} />
        </div>
      </section>

      {/* Mobile: ghim search + filter khi scroll */}
      <div className="bg-background/95 sticky top-12 z-40 -mx-[15px] flex flex-col gap-2 px-[15px] py-2 backdrop-blur-md max-md:-mx-3 max-md:px-3 max-sm:gap-1.5 lg:hidden">
        <SearchForm onSearch={addHistory} />
        <SearchMobileFilters />
      </div>

      <div className="flex items-start gap-6 max-lg:flex-col max-lg:gap-4 max-sm:gap-3">
        <SearchSidebar />

        <div className="flex w-full min-w-0 flex-1 flex-col gap-6 overflow-x-clip max-md:gap-4 max-sm:gap-3">
          {sections.map(({ key, visible, node }) => (
            // Keep mounted when switching tabs so follow local state is not wiped;
            // queries already use refetchOnMount: "always" when they become enabled again.
            <div
              key={String(key)}
              className={visible ? undefined : "hidden"}
              aria-hidden={!visible}
            >
              {node}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SearchPage() {
  return <SearchResults />
}

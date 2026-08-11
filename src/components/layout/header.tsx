"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Search, UserRound, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useDisclosure } from "@/hooks/use-disclosure"
import { useRouter } from "@/hooks/use-router"

import { SLUG_MAP, useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"
import { HEADER_DROPDOWN_ITEMS, MAIN_NAV_ITEMS } from "@/constants/component/layout.constants"

import { SEARCH_QUERY_KEY } from "@/features/search/search.schema"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Img } from "@/components/ui/image"
import { Input } from "@/components/ui/input"
import { ConfirmModal } from "@/components/ui/modal/confirm"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import kimtvLogo from "@assets/icons/layout/ic-kimtv.svg"

/* ── Gold diamond divider (header dropdown) ──────────────── */
function GoldDiamondDivider() {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent_0%,rgba(246,195,67,0.15)_25%,rgba(254,227,170,0.95)_100%)] shadow-[0_0_6px_rgba(246,195,67,0.55)]" />
      <svg
        width="9"
        height="13"
        viewBox="0 0 9 13"
        className="shrink-0 drop-shadow-[0_0_5px_rgba(246,195,67,0.9)]"
      >
        <defs>
          <linearGradient id="header-diamond-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4f8ff" />
            <stop offset="48%" stopColor="#d4e4f7" />
            <stop offset="52%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="header-diamond-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fee3aa" />
            <stop offset="100%" stopColor="#eac367" />
          </linearGradient>
        </defs>
        <path
          d="M4.5 1.2 L8 6.5 L4.5 11.8 L1 6.5 Z"
          fill="url(#header-diamond-fill)"
          stroke="url(#header-diamond-stroke)"
          strokeWidth="0.9"
        />
      </svg>
      <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(254,227,170,0.95)_0%,rgba(246,195,67,0.15)_75%,transparent_100%)] shadow-[0_0_6px_rgba(246,195,67,0.55)]" />
    </div>
  )
}

/* ── Avatar Dropdown ─────────────────────────────────────── */
interface AvatarDropdownProps {
  user: { name?: string | null; avatar?: string | null; vip99Icon?: string | null }
  userId?: string | number | null
  onLogout: () => void
}

function AvatarDropdown({ user, userId, onLogout }: AvatarDropdownProps) {
  const { t, locale } = useTranslation()
  const routes = getRoutes(locale)
  const { state, open, close, toggle, setOpen } = useDisclosure("dropdown", "confirm")
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!state.dropdown) return
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        close("dropdown")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [state.dropdown, close])

  const displayName = user.name ?? t("header.user.fallback-name")

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex w-full items-center gap-2">
        <button
          onClick={() => toggle("dropdown")}
          className="flex w-fit items-center gap-2 rounded-full transition-all max-sm:gap-1.5"
          aria-label={t("header.user.aria-label")}
        >
          <div className="border-gradient-gold-radiant flex shrink-0 items-center justify-center rounded-full !border-[2px]">
            <Avatar size={50} className="max-sm:!size-[38px]">
              <AvatarImage src={user?.avatar} />
            </Avatar>
          </div>
        </button>

        <div className="hidden items-center gap-2 lg:flex">
          <Typography
            weight="600"
            className="min-w-0 truncate text-left text-white [font-style:oblique_8deg]"
          >
            {displayName}
          </Typography>
          {user.vip99Icon && (
            <Img
              src={user.vip99Icon}
              alt="vip"
              width={32}
              height={32}
              unoptimized
              objectFit="contain"
              className="!h-9 !w-auto shrink-0"
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          "absolute top-full right-0 z-50 mt-2 w-54 max-sm:w-44",
          "panel-news rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
          "origin-top-right transition-all duration-150",
          state.dropdown
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        )}
      >
        {/* User info */}
        <div className="flex flex-col gap-1 pb-1.5">
          <div className="flex items-center gap-1 p-2 pb-1">
            <div className="border-gradient-gold-radiant flex shrink-0 items-center justify-center rounded-full !border-[4px]">
              <Avatar size={48} className="max-sm:!size-9">
                <AvatarImage src={user?.avatar} />
              </Avatar>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <Typography
                  variant="body"
                  weight="800"
                  className="max-sm:text-14 line-clamp-1 text-center text-white"
                >
                  {displayName}
                </Typography>
              </TooltipTrigger>
              <TooltipContent>{displayName}</TooltipContent>
            </Tooltip>
            {user.vip99Icon && (
              <Img
                src={user.vip99Icon}
                alt="vip"
                width={32}
                height={32}
                unoptimized
                objectFit="contain"
                className="shrink-0"
              />
            )}
          </div>
          <GoldDiamondDivider />
        </div>

        {/* Menu items */}
        <div className="py-1">
          {userId && (
            <Link
              href={routes.userInfo(String(userId))}
              className="group flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-colors hover:bg-white/5 max-sm:px-2.5 max-sm:py-2"
            >
              <UserRound className="text-gold size-4 shrink-0 transition-colors" />
              <Typography
                variant="body-sm"
                className="max-sm:text-12 whitespace-nowrap text-white/85 transition-colors group-hover:text-white"
              >
                {t("header.user.menu.profile")}
              </Typography>
            </Link>
          )}
          {HEADER_DROPDOWN_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.getHref(routes)}
              className="group flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-colors hover:bg-white/5 max-sm:px-2.5 max-sm:py-2"
            >
              <item.icon className={cn("size-4 shrink-0 transition-colors", item.iconColor)} />
              <Typography
                variant="body-sm"
                className="max-sm:text-12 whitespace-nowrap text-white/85 transition-colors group-hover:text-white"
              >
                {t(item.labelKey)}
              </Typography>
            </Link>
          ))}
        </div>

        <div className="mx-3.5 border-t border-white/8" />

        {/* Logout */}
        <div className="py-1">
          <button
            onClick={() => {
              close("dropdown")
              open("confirm")
            }}
            className="group flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-colors hover:bg-red-500/8 max-sm:px-2.5 max-sm:py-2"
          >
            <LogOut className="size-4 shrink-0 text-red-400" />
            <Typography
              variant="body-sm"
              className="max-sm:text-12 whitespace-nowrap text-red-400/80 transition-colors group-hover:text-red-400"
            >
              {t("header.user.logout.label")}
            </Typography>
          </button>
        </div>
      </div>

      {state.confirm && (
        <ConfirmModal
          open={state.confirm}
          onOpenChange={(v) => setOpen("confirm", v)}
          title={t("header.user.logout.title")}
          content={t("header.user.logout.content")}
          confirmLabel={t("header.user.logout.confirm")}
          cancelLabel={t("header.user.logout.cancel")}
          type="destructive"
          onConfirm={onLogout}
        />
      )}
    </div>
  )
}

/* ── Search ──────────────────────────────────────────────── */

const searchBtnClass = (active: boolean) =>
  cn(
    "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 max-sm:h-8 max-sm:w-8",
    "border shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
    active
      ? "border-gold/50 bg-gold/10 text-gold shadow-[0_0_12px_rgba(246,195,67,0.2)]"
      : "text-muted border-white/10 bg-white/[0.05] hover:border-white/20 hover:bg-white/10 hover:text-white"
  )

/** Mobile: link thẳng tới trang search — luôn hiện, không phụ thuộc Suspense. */
function MobileSearchButton() {
  const { t, locale } = useTranslation()
  const routes = getRoutes(locale)
  const pathname = usePathname()
  const isSearchPage = pathname === routes.search || pathname.startsWith(`${routes.search}/`)

  return (
    <Link
      href={routes.search}
      aria-label={t("header.search.aria-label")}
      className={cn(searchBtnClass(isSearchPage), "md:hidden")}
    >
      <Search className="h-3.5 w-3.5" />
    </Link>
  )
}

/** Desktop: nút expand form inline. */
function SearchInput() {
  const { t, locale } = useTranslation()
  const routes = getRoutes(locale)
  const { push, removeParams, getParam, pathname } = useRouter()
  const isSearchPage = pathname === routes.search
  const { state, open, close } = useDisclosure("search")
  const formRef = useRef<HTMLFormElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const urlQuery = getParam(SEARCH_QUERY_KEY) ?? ""

  const focusInput = () => wrapRef.current?.querySelector<HTMLInputElement>("input")?.focus()

  const handleClear = () => {
    formRef.current?.reset()
    removeParams(SEARCH_QUERY_KEY, { replace: true, scroll: false })
    setTimeout(focusInput, 0)
  }

  const expand = () => {
    open("search")
    setTimeout(focusInput, 50)
  }

  const collapse = () => {
    close("search")
    if (!isSearchPage) removeParams(SEARCH_QUERY_KEY, { replace: true, scroll: false })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = ((new FormData(e.currentTarget).get(SEARCH_QUERY_KEY) as string) ?? "").trim()
    if (!q) {
      push(routes.search)
    } else {
      push(routes.searchWithQuery(q))
    }
    close("search")
  }

  const handleBlur = () => {
    setTimeout(() => {
      if (!wrapRef.current?.contains(document.activeElement)) collapse()
    }, 100)
  }

  return (
    <div ref={wrapRef} className="relative hidden md:block" onBlur={handleBlur}>
      <button
        onClick={expand}
        aria-label={t("header.search.aria-label")}
        className={searchBtnClass(state.search || isSearchPage)}
      >
        <Search className="h-[15px] w-[15px]" />
      </button>

      <form
        ref={formRef}
        key={urlQuery}
        onSubmit={handleSubmit}
        className={cn(
          "absolute top-1/2 right-0 z-50 -translate-y-1/2",
          "h-9 rounded-full border border-white/15 bg-[#0d1829]",
          "shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
          "origin-right transition-all duration-200 ease-out",
          state.search
            ? "pointer-events-auto w-56 scale-x-100 opacity-100"
            : "pointer-events-none w-8 scale-x-0 opacity-0"
        )}
      >
        <Input
          type="text"
          name={SEARCH_QUERY_KEY}
          defaultValue={urlQuery}
          onKeyDown={(e) => e.key === "Escape" && collapse()}
          placeholder={t("header.search.placeholder")}
          variant="ghost"
          inputSize="sm"
          wrapperClassName="h-full rounded-full px-3"
          leftIcon={<Search className="h-3.5 w-3.5" />}
          rightIcon={
            urlQuery && (
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={handleClear}
                className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
              >
                <X className="size-3" />
              </Button>
            )
          }
        />
      </form>
    </div>
  )
}

/* ── Desktop Nav ─────────────────────────────────────────── */

function DesktopNav({
  items,
  isActive,
  t,
}: {
  items: typeof import("@/constants/component/layout.constants").MAIN_NAV_ITEMS
  isActive: (href: string, relatedSlugs?: string[]) => boolean
  t: (key: Parameters<ReturnType<typeof useTranslation>["t"]>[0]) => string
}) {
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const [indicator, setIndicator] = useState({ left: 0, opacity: 0 })

  const updateIndicator = useCallback(() => {
    const nav = navRef.current
    if (!nav) return
    const active = nav.querySelector<HTMLElement>("[data-active='true']")
    if (active) {
      const navRect = nav.getBoundingClientRect()
      const rect = active.getBoundingClientRect()
      setIndicator({ left: rect.left - navRect.left + rect.width / 2 - 16, opacity: 1 })
    } else {
      setIndicator((s) => ({ ...s, opacity: 0 }))
    }
  }, [])

  useEffect(() => {
    updateIndicator()
    const ro = new ResizeObserver(updateIndicator)
    if (navRef.current) ro.observe(navRef.current)
    return () => ro.disconnect()
  }, [pathname, updateIndicator])

  return (
    <nav ref={navRef} className="relative flex flex-1 items-center justify-center max-lg:hidden">
      <span
        aria-hidden
        className="via-gold pointer-events-none absolute bottom-0 h-[2px] w-8 rounded-full bg-gradient-to-r from-transparent to-transparent transition-[left,opacity] duration-300 ease-out"
        style={{ left: indicator.left, opacity: indicator.opacity }}
      />
      {items.map((item) => {
        const locale = (pathname.split("/")[1] ?? "vi") as Parameters<typeof getRoutes>[0]
        const routes = getRoutes(locale)
        const href = item.getHref(routes)
        const active = isActive(href, item.relatedSlugs)
        const Icon = item.icon
        return (
          <Link
            key={item.labelKey}
            href={href}
            data-active={active}
            className={cn(
              "group rounded-12 relative flex flex-col items-center gap-2 px-6 pt-2.5 pb-3 transition-all duration-200",
              active ? "text-gold" : "text-white/45 hover:text-white/75"
            )}
          >
            <div className="relative z-10">
              {item.iconSrc ? (
                <Img
                  src={item.iconSrc}
                  alt=""
                  width={20}
                  height={20}
                  objectFit="contain"
                  className={cn(
                    "size-5 transition-all duration-200",
                    active ? "" : "opacity-45 group-hover:opacity-65"
                  )}
                  style={
                    active
                      ? {
                          filter:
                            "drop-shadow(0 0 3px rgba(246,195,67,1)) drop-shadow(0 0 10px rgba(246,195,67,0.7)) brightness(1.1) sepia(1) saturate(3) hue-rotate(5deg)",
                        }
                      : undefined
                  }
                />
              ) : Icon ? (
                <Icon
                  weight={active ? "fill" : "regular"}
                  size={20}
                  className={cn(
                    "transition-all duration-200",
                    active ? "text-gold" : "text-white/40 group-hover:text-white/65"
                  )}
                  style={
                    active
                      ? {
                          filter:
                            "drop-shadow(0 0 3px rgba(246,195,67,1)) drop-shadow(0 0 10px rgba(246,195,67,0.7)) drop-shadow(0 0 22px rgba(246,195,67,0.4))",
                        }
                      : undefined
                  }
                />
              ) : null}
              {item.badge && (
                <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-90" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-red-600 shadow-[0_0_6px_2px_rgba(220,38,38,1),0_0_12px_4px_rgba(220,38,38,0.6)]" />
                </span>
              )}
            </div>
            <Typography
              as="span"
              variant="caption"
              weight="500"
              color={active ? "gold" : "white/45"}
              className={cn(
                "relative z-10 leading-none whitespace-nowrap transition-colors duration-200",
                active ? "" : "group-hover:text-white/70"
              )}
              style={
                active
                  ? {
                      filter:
                        "drop-shadow(0 0 5px rgba(246,195,67,0.8)) drop-shadow(0 0 12px rgba(246,195,67,0.4))",
                    }
                  : undefined
              }
            >
              {t(item.labelKey)}
            </Typography>
          </Link>
        )
      })}
    </nav>
  )
}

/* ── Main ────────────────────────────────────────────────── */
export function Header() {
  const { t, locale } = useTranslation()
  const pathname = usePathname()
  const routes = getRoutes(locale)
  const { user, isLoggedIn, login, logout } = useAuth()

  function isActive(href: string, relatedSlugs?: string[]): boolean {
    if (href === `/${locale}`) return pathname === `/${locale}`
    const viSlug = href.split("/")[2] ?? ""
    const localizedSlugs = Object.values(SLUG_MAP[viSlug] ?? {})
    if (pathname.includes(`/${viSlug}`) || localizedSlugs.some((s) => pathname.includes(`/${s}`)))
      return true
    return !!relatedSlugs?.some((s) => pathname.includes(`/${s}`))
  }

  return (
    <header id="site-header" className="bg-header sticky top-0 z-50 w-full">
      <div className="container flex h-fit items-center gap-3 py-3 max-sm:gap-2 max-sm:py-2!">
        <Link href={routes.home} className="shrink-0">
          <Img
            src={kimtvLogo}
            alt="KimTV"
            width={130}
            height={48}
            priority
            objectFit="contain"
            className="max-sm:!h-[30px] max-sm:!w-[82px]"
          />
        </Link>

        <DesktopNav items={MAIN_NAV_ITEMS} isActive={isActive} t={t} />

        <div className="ml-auto flex shrink-0 items-center gap-2 max-sm:gap-1.5 sm:gap-3">
          <MobileSearchButton />
          <Suspense fallback={null}>
            <SearchInput />
          </Suspense>
          {isLoggedIn && user ? (
            <AvatarDropdown user={user} userId={user.userId ?? user.uid} onLogout={logout} />
          ) : (
            <Button
              variant="gradient"
              onClick={login}
              className="max-lg:h-9 max-lg:w-9 max-lg:rounded-full max-lg:px-0 max-sm:h-8 max-sm:w-8"
            >
              <UserRound className="h-3.5 w-3.5" />
              <span className="max-lg:hidden">{t("header.auth.login")}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

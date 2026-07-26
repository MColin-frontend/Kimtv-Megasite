"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Menu, UserRound, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useDisclosure } from "@/hooks/useDisclosure"

import { SLUG_MAP, useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"
import { HEADER_DROPDOWN_ITEMS, MAIN_NAV_ITEMS } from "@/constants/component/layout.constants"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Img } from "@/components/ui/image"
import { ConfirmModal } from "@/components/ui/modal/confirm"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Typography } from "@/components/ui/typography"

import kimtvLogo from "@assets/icons/layout/ic-kimtv.svg"

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

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => toggle("dropdown")}
        className="border-gradient-gold-radiant flex items-center justify-center rounded-full transition-all"
        aria-label={t("header.user.aria-label")}
      >
        <Avatar size={50} className="max-sm:!size-[38px]">
          <AvatarImage src={user?.avatar} />
        </Avatar>
      </button>

      <div
        className={cn(
          "absolute top-full right-0 z-50 mt-2 w-52 max-sm:w-44",
          "panel-news rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
          "origin-top-right transition-all duration-150",
          state.dropdown
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        )}
      >
        {/* User info */}
        <div className="flex items-center gap-2 border-b border-white/8 px-3.5 py-4 max-sm:px-2.5 max-sm:py-3">
          <div className="border-gradient-gold-radiant flex items-center justify-center rounded-full transition-all">
            <Avatar size={48} className="max-sm:!size-9">
              <AvatarImage src={user?.avatar} />
            </Avatar>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Typography
                variant="body"
                weight="800"
                className="max-sm:text-14 line-clamp-2 text-center text-white"
              >
                {user.name ?? t("header.user.fallback-name")}
              </Typography>
            </TooltipTrigger>
            <TooltipContent>{user.name ?? t("header.user.fallback-name")}</TooltipContent>
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

        {/* Menu items */}
        <div className="py-1">
          {userId && (
            <Link
              href={routes.userInfo(String(userId))}
              className="group flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-colors hover:bg-white/5 max-sm:px-2.5 max-sm:py-2"
            >
              <UserRound className="text-primary size-4 shrink-0 transition-colors" />
              <Typography
                variant="body-sm"
                className="text-muted max-sm:text-12 whitespace-nowrap transition-colors group-hover:text-white"
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
                className="text-muted max-sm:text-12 whitespace-nowrap transition-colors group-hover:text-white"
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

/* TODO: restore search */
/* ── Search ──────────────────────────────────────────────── */
// function SearchInput() {
//   const { t } = useTranslation()
//   const { state, open, close } = useDisclosure("search")
//   const [value, setValue] = useState<string>("")
//   const inputRef = useRef<HTMLInputElement>(null)
//   const wrapRef = useRef<HTMLDivElement>(null)

//   const expand = () => {
//     open("search")
//     setTimeout(() => inputRef.current?.focus(), 50)
//   }

//   const collapse = () => {
//     close("search")
//     setValue("")
//   }

//   const handleBlur = () => {
//     setTimeout(() => {
//       if (!wrapRef.current?.contains(document.activeElement)) collapse()
//     }, 100)
//   }

//   return (
//     <div ref={wrapRef} className="relative hidden md:block" onBlur={handleBlur}>
//       <button
//         onClick={expand}
//         aria-label={t("header.search.aria-label")}
//         className={cn(
//           "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
//           "border shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
//           state.search
//             ? "border-white/25 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
//             : "text-muted border-white/10 bg-white/[0.05] hover:border-white/20 hover:bg-white/10 hover:text-white"
//         )}
//       >
//         <Search className="h-[15px] w-[15px]" />
//       </button>

//       <div
//         className={cn(
//           "absolute top-1/2 right-0 z-50 -translate-y-1/2",
//           "flex items-center gap-2.5",
//           "h-9 rounded-full border border-white/15 bg-[#0d1829]",
//           "pr-2.5 pl-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
//           "origin-right transition-all duration-200 ease-out",
//           state.search
//             ? "pointer-events-auto w-56 scale-x-100 opacity-100"
//             : "pointer-events-none w-8 scale-x-0 opacity-0"
//         )}
//       >
//         <Search className="text-muted h-3.5 w-3.5 shrink-0" />
//         <input
//           ref={inputRef}
//           type="text"
//           value={value}
//           onChange={(e) => setValue(e.target.value)}
//           onKeyDown={(e) => e.key === "Escape" && collapse()}
//           placeholder={t("header.search.placeholder")}
//           className="text-13 placeholder:text-placeholder flex-1 bg-transparent text-white outline-none"
//         />
//         {value && (
//           <button
//             onClick={() => {
//               setValue("")
//               inputRef.current?.focus()
//             }}
//             className="text-muted hover:text-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white/20"
//           >
//             <X className="h-3 w-3" />
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }

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

  useEffect(() => {
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
  }, [pathname])

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
                <img
                  src={item.iconSrc}
                  alt=""
                  className={cn(
                    "size-5 object-contain transition-all duration-200",
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
  const { state, toggle, close } = useDisclosure("mobileMenu")
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
    <>
      <header id="site-header" className="bg-header sticky top-0 z-50 w-full">
        <div className="container flex h-fit items-center gap-3 py-3">
          <Link href={routes.home} className="shrink-0" onClick={() => close("mobileMenu")}>
            <Img
              src={kimtvLogo}
              alt="KimTV"
              width={130}
              height={48}
              priority
              objectFit="contain"
              className="max-sm:!h-[37px] max-sm:!w-[100px]"
            />
          </Link>

          <DesktopNav items={MAIN_NAV_ITEMS} isActive={isActive} t={t} />

          <div className="ml-auto flex shrink-0 items-center gap-3 max-sm:gap-2">
            {/* TODO: restore search */}
            {/* <SearchInput /> */}

            {isLoggedIn && user ? (
              <AvatarDropdown user={user} userId={user.userId ?? user.uid} onLogout={logout} />
            ) : (
              <Button variant="gradient" onClick={login} className="max-lg:hidden">
                <UserRound className="h-3.5 w-3.5" />
                {t("header.auth.login")}
              </Button>
            )}

            <button
              aria-label={
                state.mobileMenu ? t("header.mobile-menu.close") : t("header.mobile-menu.open")
              }
              onClick={() => toggle("mobileMenu")}
              className="text-muted relative hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Menu
                className={cn(
                  "absolute h-[18px] w-[18px] transition-all duration-200",
                  state.mobileMenu
                    ? "scale-50 rotate-90 opacity-0"
                    : "scale-100 rotate-0 opacity-100"
                )}
              />
              <X
                className={cn(
                  "absolute h-[18px] w-[18px] transition-all duration-200",
                  state.mobileMenu
                    ? "scale-100 rotate-0 opacity-100"
                    : "scale-50 -rotate-90 opacity-0"
                )}
              />
            </button>
          </div>
        </div>
      </header>

      <div
        onClick={() => close("mobileMenu")}
        className={cn(
          "fixed inset-0 top-[60px] z-40 bg-black/60 backdrop-blur-sm lg:hidden",
          "transition-opacity duration-300",
          state.mobileMenu ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div
        className={cn(
          "bg-navy fixed inset-x-0 top-[60px] z-50 lg:hidden",
          "border-b border-white/8",
          "transition-all duration-300 ease-out",
          state.mobileMenu
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        )}
      >
        <nav className="container divide-y divide-white/6 py-2">
          {MAIN_NAV_ITEMS.map((item) => {
            const href = item.getHref(routes)
            const active = isActive(href, item.relatedSlugs)
            const Icon = item.icon
            return (
              <Link
                key={href}
                href={href}
                onClick={() => close("mobileMenu")}
                className={cn(
                  "flex h-[52px] items-center gap-3 transition-colors",
                  active ? "text-gold" : "text-muted hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "h-4 w-[3px] rounded-full transition-all duration-200",
                    active ? "bg-gold" : "bg-transparent"
                  )}
                />
                {Icon && (
                  <div className="relative">
                    <Icon className="size-4 shrink-0" />
                    {item.badge && (
                      <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-red-500" />
                    )}
                  </div>
                )}
                <Typography variant="label" className="text-inherit">
                  {t(item.labelKey)}
                </Typography>
              </Link>
            )
          })}
        </nav>

        {!isLoggedIn && (
          <div className="container pt-3 pb-5">
            <Button
              variant="gradient"
              className="w-full"
              onClick={() => {
                login()
                close("mobileMenu")
              }}
            >
              <UserRound className="h-4 w-4" />
              {t("header.auth.login")}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

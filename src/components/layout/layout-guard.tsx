"use client"

import { useEffect, useRef } from "react"
import { useParams } from "next/navigation"

import type { KimtvUser } from "@/lib/auth-cookie"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "@/hooks/useRouter"

import { getRoutes } from "@/config/routes"
import type { LocaleType } from "@/i18n"

export interface LayoutGuardContext {
  user: KimtvUser | null
  isLoggedIn: boolean
}

export interface LayoutGuardProps {
  children: React.ReactNode
  /** Trả về true → cho qua, false → redirect */
  condition: (ctx: LayoutGuardContext) => boolean
  /** URL redirect khi condition = false. Mặc định: trang đăng nhập */
  redirectTo?: string
  /** Hiển thị trong lúc chờ auth load. Mặc định: null */
  fallback?: React.ReactNode
}

/* ── Pre-built conditions ────────────────────────────────── */

export const guardConditions = {
  requireAuth: ({ isLoggedIn }: LayoutGuardContext) => isLoggedIn,
  requireGuest: ({ isLoggedIn }: LayoutGuardContext) => !isLoggedIn,
} satisfies Record<string, (ctx: LayoutGuardContext) => boolean>

/* ── HOC ─────────────────────────────────────────────────── */

export function withLayoutGuard<P extends { children: React.ReactNode }>(
  Component: React.ComponentType<P>,
  guardProps: Omit<LayoutGuardProps, "children">
) {
  function GuardedLayout(props: P) {
    return (
      <LayoutGuard {...guardProps}>
        <Component {...props} />
      </LayoutGuard>
    )
  }
  GuardedLayout.displayName = `withLayoutGuard(${Component.displayName ?? Component.name})`
  return GuardedLayout
}

/* ── Component ───────────────────────────────────────────── */

export function LayoutGuard({ children, condition, redirectTo, fallback = null }: LayoutGuardProps) {
  const { user, isLoggedIn, isLoading } = useAuth()
  const { replace } = useRouter()
  const params = useParams()
  const lang = ((params?.lang as LocaleType) ?? "vi") as LocaleType

  const conditionRef = useRef(condition)
  useEffect(() => {
    conditionRef.current = condition
  })

  const routes = getRoutes(lang)
  const redirectUrl = redirectTo ?? routes.auth.login

  useEffect(() => {
    if (isLoading) return
    if (!conditionRef.current({ user, isLoggedIn })) {
      replace(redirectUrl)
    }
  }, [isLoading, isLoggedIn, user, redirectUrl, replace])

  if (isLoading) return <>{fallback}</>
  if (!condition({ user, isLoggedIn })) return null

  return <>{children}</>
}

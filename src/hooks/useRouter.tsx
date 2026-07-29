"use client"

import { useCallback } from "react"
import { useRouter as useNextRouter, usePathname, useSearchParams } from "next/navigation"

type ParamValue = string | number | boolean | null | undefined

/** Params map — value rỗng ("", null, undefined) sẽ xoá param đó */
type Params = Record<string, ParamValue>

interface UseRouterReturn {
  pathname: string
  searchParams: ReturnType<typeof useSearchParams>
  /** Lấy giá trị của một param */
  getParam: (key: string) => string | null
  /** Điều hướng tới một URL mới (thêm vào history) */
  push: (href: string) => void
  /** Thay thế URL hiện tại (không thêm history) */
  replace: (href: string) => void
  back: () => void
  forward: () => void
  refresh: () => void
  /**
   * Merge params vào URL hiện tại.
   * - Value có nội dung → set/update param
   * - Value rỗng ("", null, undefined) → xoá param
   * - Nhiều params một lúc
   */
  setParams: (params: Params, opts?: { replace?: boolean; scroll?: boolean }) => void
  /**
   * Reset toàn bộ params, chỉ giữ lại các params truyền vào.
   * Value rỗng → không set
   */
  resetParams: (params?: Params, opts?: { replace?: boolean; scroll?: boolean }) => void
  /** Xoá một hoặc nhiều params */
  removeParams: (keys: string | string[], opts?: { replace?: boolean; scroll?: boolean }) => void
}

export function useRouter(): UseRouterReturn {
  const router = useNextRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  /* ── helpers ──────────────────────────────────────────────── */
  const buildUrl = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [pathname]
  )

  const isEmpty = (v: ParamValue): boolean => v === "" || v === null || v === undefined

  /* ── setParams ────────────────────────────────────────────── */
  const setParams = useCallback(
    (params: Params, opts?: { replace?: boolean; scroll?: boolean }) => {
      const next = new URLSearchParams(searchParams.toString())

      Object.entries(params).forEach(([key, val]) => {
        if (isEmpty(val)) {
          next.delete(key)
        } else {
          next.set(key, String(val))
        }
      })

      const url = buildUrl(next)
      const navOpts = { scroll: opts?.scroll ?? true }
      if (opts?.replace) router.replace(url, navOpts)
      else router.push(url, navOpts)
    },
    [router, searchParams, buildUrl]
  )

  /* ── resetParams ──────────────────────────────────────────── */
  const resetParams = useCallback(
    (params?: Params, opts?: { replace?: boolean; scroll?: boolean }) => {
      const next = new URLSearchParams()

      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (!isEmpty(val)) next.set(key, String(val))
        })
      }

      const url = buildUrl(next)
      const navOpts = { scroll: opts?.scroll ?? true }
      if (opts?.replace) router.replace(url, navOpts)
      else router.push(url, navOpts)
    },
    [router, buildUrl]
  )

  /* ── removeParams ─────────────────────────────────────────── */
  const removeParams = useCallback(
    (keys: string | string[], opts?: { replace?: boolean; scroll?: boolean }) => {
      const next = new URLSearchParams(searchParams.toString())
      const list = Array.isArray(keys) ? keys : [keys]
      list.forEach((k) => next.delete(k))

      const url = buildUrl(next)
      const navOpts = { scroll: opts?.scroll ?? true }
      if (opts?.replace) router.replace(url, navOpts)
      else router.push(url, navOpts)
    },
    [router, searchParams, buildUrl]
  )

  /* ── return ───────────────────────────────────────────────── */
  return {
    pathname,
    searchParams,
    getParam: (key: string) => searchParams.get(key),
    push: (href) => router.push(href),
    replace: (href) => router.replace(href),
    back: () => router.back(),
    forward: () => router.forward(),
    refresh: () => router.refresh(),
    setParams,
    resetParams,
    removeParams,
  }
}

"use client"

import { useCallback, useSyncExternalStore } from "react"

export const SEARCH_HISTORY_KEY = "search-key-history"
const LS_KEY = SEARCH_HISTORY_KEY
const MAX_ITEMS = 20
export const HISTORY_LABEL_MAX = 20

export interface SearchHistoryItem {
  q: string
}

let _cachedRaw: string | null = null
let _cachedParsed: string[] = []

function readLS(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw === _cachedRaw) return _cachedParsed
    _cachedRaw = raw
    _cachedParsed = JSON.parse(raw ?? "[]")
    return _cachedParsed
  } catch {
    return _cachedParsed
  }
}

function writeLS(next: string[]) {
  if (next.length === 0) {
    localStorage.removeItem(LS_KEY)
  } else {
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  }
  // Notify same-tab subscribers (storage event only fires cross-tab natively)
  window.dispatchEvent(new StorageEvent("storage", { key: LS_KEY }))
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb)
  return () => window.removeEventListener("storage", cb)
}

const EMPTY: string[] = []
function serverSnapshot() {
  return EMPTY
}

export function useSearchHistory() {
  // Server snapshot [] matches SSR HTML; client snapshot reads localStorage after hydration
  const history = useSyncExternalStore(subscribe, readLS, serverSnapshot)

  const add = useCallback((q: string) => {
    const val = q.trim().slice(0, HISTORY_LABEL_MAX)
    if (!val) return
    writeLS([val, ...readLS().filter((h) => h !== val)].slice(0, MAX_ITEMS))
  }, [])

  const remove = useCallback((q: string) => {
    writeLS(readLS().filter((h) => h !== q))
  }, [])

  const clear = useCallback(() => {
    writeLS([])
  }, [])

  return { history, add, remove, clear }
}

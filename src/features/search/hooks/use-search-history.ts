"use client"

import { useEffect, useState } from "react"

export const SEARCH_HISTORY_KEY = "search-key-history"
const LS_KEY = SEARCH_HISTORY_KEY
const MAX_ITEMS = 20
export const HISTORY_LABEL_MAX = 20

export interface SearchHistoryItem {
  q: string
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"))
    } catch {}
  }, [])

  function add(q: string) {
    const val = q.trim().slice(0, HISTORY_LABEL_MAX)
    if (!val) return
    setHistory((prev) => {
      const next = [val, ...prev.filter((h) => h !== val)].slice(0, MAX_ITEMS)
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }

  function remove(q: string) {
    setHistory((prev) => {
      const next = prev.filter((h) => h !== q)
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }

  function clear() {
    setHistory([])
    localStorage.removeItem(LS_KEY)
  }

  return { history, add, remove, clear }
}

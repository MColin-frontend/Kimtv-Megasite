import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-10",
        "text-11",
        "text-12",
        "text-13",
        "text-14",
        "text-16",
        "text-17",
        "text-18",
        "text-20",
        "text-22",
        "text-24",
        "text-30",
        "text-36",
        "text-48",
        "text-60",
        "text-72",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Tạo unique key cho optimistic UI items. */
export function createUniqueKey(prefix = "key"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** Chuẩn hóa text để so sánh (lowercase, collapse spaces). */
export function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ")
}

/** Rút gọn số lớn: 1200 → "1.2K", 1500000 → "1.5M". */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return String(n)
}

/** Chuyển milliseconds (hoặc seconds nếu < 1000) sang "m:ss". */
export function formatDuration(ms: number): string {
  const totalSec = ms >= 1000 ? Math.floor(ms / 1000) : Math.floor(ms)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, "0")}`
}

export function formatViewers(n: number | null | undefined): string {
  if (!n) return "0"
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

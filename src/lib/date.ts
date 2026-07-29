export function parseDateParam(s: string | null): Date | null {
  if (!s) return null
  const [y, m, d] = s.split("-").map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function formatDateParam(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function formatFullDate(d: Date): string {
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatDisplayDate(d: Date): string {
  const today = new Date()
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  if (isToday) return "Hôm nay"
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })
}

export function formatKickOff(ts: number, locale = "vi-VN"): string {
  return new Date(ts * 1000).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format unix timestamp (seconds hoặc milliseconds) → chuỗi ngày giờ.
 * Tự phát hiện đơn vị: >= 1e12 là ms, ngược lại là giây.
 */
export function formatTimestamp(value: string | number | undefined, locale = "vi-VN"): string {
  if (!value) return ""
  const ts = Number(value)
  if (!ts) return ""
  const ms = ts < 1e12 ? ts * 1000 : ts
  const d = new Date(ms)
  if (isNaN(d.getTime())) return ""
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Phút bóng đá — quá 90 hiển thị dạng `90+6`. */
export function formatFootballGameTime(gameTime: number): string {
  if (gameTime > 90) return `90+${gameTime - 90}`
  return String(gameTime)
}

/** Unix timestamp (giây hoặc ms) → "dd/MM/yyyy HH:mm". */
export function formatPublishTime(publishTime: string | number | undefined | null): string {
  if (!publishTime) return ""
  const ts = typeof publishTime === "number" ? publishTime : Number(publishTime)
  if (!ts) return ""
  const date = new Date(ts > 1e10 ? ts : ts * 1000)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return "Vừa xong"
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`

  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

/** Milliseconds → "mm:ss" hoặc "HH:mm:ss" khi >= 1 giờ. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return h > 0
    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function formatMatchDate(ts: number): string {
  const d = new Date(ts * 1000)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function formatMatchTime(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

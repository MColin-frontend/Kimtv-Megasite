export interface KimtvUser {
  /** Field chuẩn hóa — luôn có sau khi parse cookie (map từ uid hoặc userId gốc). */
  userId?: number | string
  /** Field gốc từ Java backend. */
  uid?: number | string
  name?: string
  avatar?: string
  phone?: string
  email?: string
  /**
   * Role từ backend Java:
   * 1 = ADMIN | 2 = ANCHOR (BLV) | 3 = HOUSING_MANAGEMENT (CSKH)
   * Tên field backend có thể là roleType hoặc type — đọc cả hai.
   */
  roleType?: number
  type?: number
  [key: string]: unknown
}

/** Parse raw `userInfo` cookie — backend Java trả `uid`, normalize về `userId`. */
export function parseUserInfoCookie(raw: string | undefined | null): KimtvUser | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as KimtvUser
    if (parsed.uid != null && parsed.userId == null) {
      parsed.userId = parsed.uid
    }
    return parsed
  } catch {
    return null
  }
}

export function getLoginUserIdFromUser(user: KimtvUser | null | undefined): string {
  const id = user?.userId ?? user?.uid
  return id != null ? String(id) : ""
}

function getCookieDomain(): string | undefined {
  if (typeof window === "undefined") return undefined
  let domain = window.location.hostname
  if (domain === "localhost") return undefined
  if (domain.startsWith("www.")) domain = domain.slice(4)
  return `.${domain}`
}

function setCookie(name: string, value: string): void {
  const domain = getCookieDomain()
  const parts = [`${name}=${encodeURIComponent(value)}`, "path=/", "SameSite=Lax"]
  if (domain) parts.push(`domain=${domain}`)
  document.cookie = parts.join("; ")
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string): void {
  const domain = getCookieDomain()
  const base = `${name}=; path=/; max-age=0`
  document.cookie = domain ? `${base}; domain=${domain}` : base
}

const USER_INFO_STORAGE_KEY = "kimtv_user_info"

export function saveAuthCookies(token: string, user: KimtvUser): void {
  setCookie("token", token)
  setCookie("userInfo", JSON.stringify(user))
  try {
    localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(user))
  } catch {}
}

export function clearAuthCookies(): void {
  deleteCookie("token")
  deleteCookie("userInfo")
  try {
    localStorage.removeItem(USER_INFO_STORAGE_KEY)
  } catch {}
}

/** Lấy user info từ localStorage — dùng để hiển thị ngay trước khi token được xác nhận. */
export function getCachedUserInfo(): KimtvUser | null {
  try {
    return parseUserInfoCookie(localStorage.getItem(USER_INFO_STORAGE_KEY))
  } catch {
    return null
  }
}

export function getTokenFromCookie(): string | null {
  return getCookie("token")
}

export function getUserInfoFromCookie(): KimtvUser | null {
  return parseUserInfoCookie(getCookie("userInfo"))
}

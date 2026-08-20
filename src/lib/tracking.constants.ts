import {
  CtaPositionEnum,
  CtaTypeEnum,
  TrackingDeviceTypeEnum,
  TrackingEventsEnum,
  TrackingPayloadKeyEnum,
  TrackingTrafficSourceEnum,
  TrackingUtmMediumEnum,
  TrackingUtmParamKeyEnum,
  TrackingUtmSourceEnum,
  TrackingValueEnum,
} from "@/enums/tracking.enum"

// ─── Constants ────────────────────────────────────────────────────────────────

const TRACK_URL = "/java/track/event"
const SESSION_STORAGE_KEY = "_SESSION_ID"
const GEO_STORAGE_KEY = "_KIMTV_TRACKING_GEO"
const GEO_TTL_MS = 24 * 60 * 60 * 1000
const GEO_API_URL = "https://get.geojs.io/v1/ip/geo.json"
const ANONYMOUS_ID_STORAGE_KEY = "_ANONYMOUS_ID"
const SESSION_START_SENT_TAB_KEY = "_SESSION_START_SENT_TAB"
const SESSION_START_SENT_KEY = "_SESSION_START_SENT"
const SESSION_TABS_KEY = "_SESSION_TABS"
const SESSION_TAB_ID_KEY = "_SESSION_TAB_ID"
const TRACKING_RELOAD_INTENT_KEY = "_TRACKING_RELOAD_INTENT"
const STREAM_WATCHING_STORAGE_KEY = "_STREAM_WATCHING_ACTIVE"
const TAB_HEARTBEAT_MS = 5_000
const TAB_STALE_MS = 15_000
const STREAM_PROGRESS_INTERVAL_MS = 30_000

const TRACKING_UTM_SOCIAL_MEDIUMS: string[] = [
  TrackingUtmMediumEnum.SOCIAL,
  TrackingUtmMediumEnum.PAID_SOCIAL,
]
const TRACKING_UTM_REFERRAL_MEDIUMS: string[] = [
  TrackingUtmMediumEnum.CPC,
  TrackingUtmMediumEnum.PPC,
  TrackingUtmMediumEnum.DISPLAY,
  TrackingUtmMediumEnum.BANNER,
  TrackingUtmMediumEnum.EMAIL,
  TrackingUtmMediumEnum.REFERRAL,
]
const TRACKING_UTM_ORGANIC_SOURCES: string[] = [
  TrackingUtmSourceEnum.GOOGLE,
  TrackingUtmSourceEnum.BING,
  TrackingUtmSourceEnum.YAHOO,
]
const TRACKING_UTM_SOCIAL_SOURCES: string[] = [
  TrackingUtmSourceEnum.FACEBOOK,
  TrackingUtmSourceEnum.INSTAGRAM,
  TrackingUtmSourceEnum.TIKTOK,
  TrackingUtmSourceEnum.YOUTUBE,
  TrackingUtmSourceEnum.TWITTER,
  TrackingUtmSourceEnum.X,
]
const TRACKING_ORGANIC_REFERRER_HOSTS: string[] = ["google.", "bing.", "yahoo."]
const TRACKING_SOCIAL_REFERRER_HOSTS: string[] = [
  "facebook.",
  "instagram.",
  "tiktok.",
  "youtube.",
  "twitter.",
  "x.com",
]

// ─── Browser guard ────────────────────────────────────────────────────────────

const isBrowser = () => typeof window !== "undefined"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const genId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`

export const formatTrackingDateTime = (date: Date | number | string = new Date()): string => {
  let d: Date
  if (date instanceof Date) {
    d = date
  } else {
    const n = Number(date)
    if (Number.isFinite(n) && n > 0) {
      d = new Date(n < 1e12 ? n * 1000 : n)
    } else {
      d = new Date(date)
    }
  }
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ─── Device type ──────────────────────────────────────────────────────────────

export const getDeviceType = (): TrackingDeviceTypeEnum => {
  if (!isBrowser()) return TrackingDeviceTypeEnum.DESKTOP
  const ua = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(ua)) return TrackingDeviceTypeEnum.TABLET
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua))
    return TrackingDeviceTypeEnum.MOBILE
  return TrackingDeviceTypeEnum.DESKTOP
}

// ─── Geo location (stale-while-revalidate, 1-day localStorage cache) ──────────

interface GeoCache {
  country: string
  region: string
  fetchedAt: number
}

let _cachedGeo: GeoCache | null = null
let _geoFetchInflight = false

const readGeoFromStorage = (): GeoCache | null => {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(GEO_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const fetchedAt = Number(parsed.fetchedAt || 0)
    if (!fetchedAt) return null
    return {
      country: String(parsed.country || ""),
      region: String(parsed.region || ""),
      fetchedAt,
    }
  } catch {
    return null
  }
}

const isGeoFresh = (cache: GeoCache | null): boolean =>
  !!cache && !!(cache.country || cache.region) && Date.now() - cache.fetchedAt < GEO_TTL_MS

const fetchGeoLocation = async (): Promise<void> => {
  if (!isBrowser() || _geoFetchInflight) return
  _geoFetchInflight = true
  try {
    const res = await fetch(GEO_API_URL)
    if (!res.ok) return
    const data = (await res.json()) as Record<string, unknown>
    const cache: GeoCache = {
      country: String(data.country_code || ""),
      region: String(data.region || ""),
      fetchedAt: Date.now(),
    }
    _cachedGeo = cache
    try {
      localStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(cache))
    } catch {}
  } catch {
  } finally {
    _geoFetchInflight = false
  }
}

const ensureGeoLocation = (): GeoCache | null => {
  if (!isBrowser()) return null
  if (!_cachedGeo) _cachedGeo = readGeoFromStorage()
  if (!isGeoFresh(_cachedGeo)) void fetchGeoLocation()
  return _cachedGeo
}

const getCountry = (): string => ensureGeoLocation()?.country || ""
const getRegion = (): string => ensureGeoLocation()?.region || ""

export const initTrackingGeo = (): void => {
  ensureGeoLocation()
}

// ─── Anonymous ID (persistent per browser) ────────────────────────────────────

export const anonymousId = (() => {
  if (!isBrowser()) return genId("ano")
  let aid = localStorage.getItem(ANONYMOUS_ID_STORAGE_KEY)
  if (!aid) {
    aid = genId("ano")
    localStorage.setItem(ANONYMOUS_ID_STORAGE_KEY, aid)
  }
  return aid
})()

// ─── Session & tab management ─────────────────────────────────────────────────

const readTabs = (): Record<string, number> => {
  if (!isBrowser()) return {}
  try {
    const raw = localStorage.getItem(SESSION_TABS_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    return parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : {}
  } catch {
    return {}
  }
}

const writeTabs = (tabs: Record<string, number>): void => {
  if (!isBrowser()) return
  localStorage.setItem(SESSION_TABS_KEY, JSON.stringify(tabs))
}

const getTabId = (): string => {
  if (!isBrowser()) return ""
  let id = sessionStorage.getItem(SESSION_TAB_ID_KEY)
  if (!id) {
    id = genId("tab")
    sessionStorage.setItem(SESSION_TAB_ID_KEY, id)
  }
  return id
}

const pruneTabs = (tabs: Record<string, number>, now = Date.now()): Record<string, number> => {
  const next = { ...tabs }
  Object.keys(next).forEach((tabId) => {
    const ts = Number(next[tabId] || 0)
    if (!ts || now - ts > TAB_STALE_MS) delete next[tabId]
  })
  return next
}

const registerCurrentTab = (): void => {
  if (!isBrowser()) return
  const now = Date.now()
  const tabId = getTabId()
  const tabs = pruneTabs(readTabs(), now)
  tabs[tabId] = now
  writeTabs(tabs)
}

const cleanupSessionIfNoTabs = (tabs: Record<string, number>): void => {
  if (!isBrowser()) return
  if (Object.keys(tabs).length) return
  localStorage.removeItem(SESSION_STORAGE_KEY)
  localStorage.removeItem(SESSION_TABS_KEY)
}

const unregisterCurrentTab = (): void => {
  if (!isBrowser()) return
  const tabId = getTabId()
  const tabs = pruneTabs(readTabs())
  delete tabs[tabId]
  cleanupSessionIfNoTabs(tabs)
  if (Object.keys(tabs).length) writeTabs(tabs)
}

export const isLastActiveTrackingTab = (): boolean => {
  if (!isBrowser()) return true
  const tabId = getTabId()
  const tabs = pruneTabs(readTabs())
  delete tabs[tabId]
  return Object.keys(tabs).length === 0
}

let _sessionLifecycleBound = false
let _reloadDetectionBound = false

export const shouldSkipUnloadTrackingForReload = (): boolean => {
  if (!isBrowser()) return false
  try {
    if (sessionStorage.getItem(TRACKING_RELOAD_INTENT_KEY) === "1") return true
  } catch {}
  const nav = performance.getEntriesByType("navigation")[0] as
    PerformanceNavigationTiming | undefined
  if (nav?.type === "reload") return true
  if ((performance as unknown as { navigation?: { type: number } }).navigation?.type === 1)
    return true
  return false
}

const bindTrackingReloadDetection = (): void => {
  if (!isBrowser() || _reloadDetectionBound) return
  _reloadDetectionBound = true
  window.addEventListener(
    "keydown",
    (e) => {
      const key = e.key?.toLowerCase()
      if (key === "f5" || ((e.ctrlKey || e.metaKey) && key === "r")) {
        try {
          sessionStorage.setItem(TRACKING_RELOAD_INTENT_KEY, "1")
        } catch {}
      }
    },
    true
  )
  window.addEventListener("pageshow", () => {
    const nav = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined
    if (nav?.type === "reload") {
      try {
        sessionStorage.removeItem(TRACKING_RELOAD_INTENT_KEY)
        clearStreamWatchingStorage()
      } catch {}
    }
  })
}

export const bindSessionLifecycle = (): void => {
  if (!isBrowser() || _sessionLifecycleBound) return
  _sessionLifecycleBound = true
  bindTrackingReloadDetection()
  ensureSessionId()

  setInterval(() => {
    registerCurrentTab()
  }, TAB_HEARTBEAT_MS)

  const cleanup = () => unregisterCurrentTab()
  window.addEventListener("beforeunload", cleanup)
  window.addEventListener("pagehide", cleanup)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") registerCurrentTab()
  })
  window.addEventListener("storage", (e) => {
    if (e.key !== SESSION_TABS_KEY) return
    const tabs = pruneTabs(readTabs())
    cleanupSessionIfNoTabs(tabs)
    if (Object.keys(tabs).length) writeTabs(tabs)
  })
}

const ensureSessionId = (): string => {
  if (!isBrowser()) return genId("sess")
  registerCurrentTab()
  let sid = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!sid) {
    sid = genId("sess")
    localStorage.setItem(SESSION_STORAGE_KEY, sid)
  }
  return sid
}

export const getSessionId = (): string => {
  bindSessionLifecycle()
  return ensureSessionId()
}

export const resetSessionId = (): string => {
  if (!isBrowser()) return genId("sess")
  registerCurrentTab()
  const sid = genId("sess")
  localStorage.setItem(SESSION_STORAGE_KEY, sid)
  return sid
}

export const DEFAULT_BANNER_AD_TARGET_LINK = "https://www.kim66.plus/pc/?dl=7t1fn4"
export const DEFAULT_BANNER_AD_SHORT_LINK = "https://t.ly/kim66_ads"

// ─── URL & referrer ───────────────────────────────────────────────────────────

let _trackingPreviousUrl = ""

export const getTrackingSourceLink = (): string => (isBrowser() ? window.location.href : "")

export const getTrackingPagePath = (): string => {
  if (!isBrowser()) return ""
  return `${window.location.pathname}${window.location.search}`
}

export const getTrackingPageReferrer = (): string =>
  _trackingPreviousUrl || (isBrowser() && document.referrer ? document.referrer : "") || ""

export const setTrackingPreviousUrl = (url?: string): void => {
  _trackingPreviousUrl = url ?? getTrackingSourceLink()
}

// ─── Traffic source ───────────────────────────────────────────────────────────

const getUtmParamsFromSearch = (search?: string): Record<string, string> => {
  const empty = {
    [TrackingUtmParamKeyEnum.UTM_SOURCE]: "",
    [TrackingUtmParamKeyEnum.UTM_MEDIUM]: "",
  }
  if (!isBrowser()) return empty
  try {
    const params = new URLSearchParams(search != null ? search : window.location.search)
    return {
      [TrackingUtmParamKeyEnum.UTM_SOURCE]: params.get(TrackingUtmParamKeyEnum.UTM_SOURCE) || "",
      [TrackingUtmParamKeyEnum.UTM_MEDIUM]: params.get(TrackingUtmParamKeyEnum.UTM_MEDIUM) || "",
    }
  } catch {
    return empty
  }
}

const referrerIncludesAnyHost = (referrer: string, hosts: string[]): boolean =>
  hosts.some((host) => referrer.includes(host))

export const getTrafficSource = ({
  utm_source,
  utm_medium,
  referrer,
}: {
  utm_source?: string
  utm_medium?: string
  referrer?: string
}): TrackingTrafficSourceEnum => {
  const source = utm_source?.toLowerCase()
  const medium = utm_medium?.toLowerCase()
  const ref = referrer?.toLowerCase()

  if (medium) {
    if (medium === TrackingUtmMediumEnum.ORGANIC) return TrackingTrafficSourceEnum.ORGANIC
    if (TRACKING_UTM_SOCIAL_MEDIUMS.includes(medium)) return TrackingTrafficSourceEnum.SOCIAL
    if (TRACKING_UTM_REFERRAL_MEDIUMS.includes(medium)) return TrackingTrafficSourceEnum.REFERRAL
  }

  if (source) {
    if (TRACKING_UTM_ORGANIC_SOURCES.includes(source)) return TrackingTrafficSourceEnum.ORGANIC
    if (TRACKING_UTM_SOCIAL_SOURCES.includes(source)) return TrackingTrafficSourceEnum.SOCIAL
    return TrackingTrafficSourceEnum.REFERRAL
  }

  if (ref) {
    if (referrerIncludesAnyHost(ref, TRACKING_ORGANIC_REFERRER_HOSTS))
      return TrackingTrafficSourceEnum.ORGANIC
    if (referrerIncludesAnyHost(ref, TRACKING_SOCIAL_REFERRER_HOSTS))
      return TrackingTrafficSourceEnum.SOCIAL
    return TrackingTrafficSourceEnum.REFERRAL
  }

  return TrackingTrafficSourceEnum.DIRECT
}

const getPageViewTrafficSource = (search?: string): TrackingTrafficSourceEnum => {
  const utm = getUtmParamsFromSearch(search)
  const referrer = isBrowser() ? document.referrer || "" : ""
  return getTrafficSource({
    utm_source: utm[TrackingUtmParamKeyEnum.UTM_SOURCE],
    utm_medium: utm[TrackingUtmParamKeyEnum.UTM_MEDIUM],
    referrer,
  })
}

export const getTrackingContextFields = (): Record<string, unknown> => ({
  [TrackingPayloadKeyEnum.SOURCE_LINK]: getTrackingSourceLink(),
  [TrackingPayloadKeyEnum.PAGE_REFERRER]: getTrackingPageReferrer(),
  [TrackingPayloadKeyEnum.DEVICE_TYPE]: getDeviceType(),
  [TrackingPayloadKeyEnum.TRAFFIC_SOURCE]: getPageViewTrafficSource(),
  [TrackingPayloadKeyEnum.COUNTRY]: getCountry(),
  [TrackingPayloadKeyEnum.REGION]: getRegion(),
})

// ─── Stream watching state ────────────────────────────────────────────────────

interface StreamWatchingState {
  matchId: string
  roomId: string
  streamEntrySource: string
  isPlaying: boolean
  userPaused: boolean
}

let streamWatching: StreamWatchingState | null = null
let streamLeaveInProgress = false
let streamEndedUnloadSent = false
let streamWatchSessionStartTime = ""

const syncStreamWatchingStorage = (): void => {
  if (!isBrowser()) return
  try {
    if (streamWatching?.isPlaying && !streamWatching.userPaused && streamWatching.matchId) {
      sessionStorage.setItem(
        STREAM_WATCHING_STORAGE_KEY,
        JSON.stringify({
          matchId: streamWatching.matchId,
          roomId: streamWatching.roomId,
          streamEntrySource: streamWatching.streamEntrySource,
        })
      )
    } else {
      sessionStorage.removeItem(STREAM_WATCHING_STORAGE_KEY)
    }
  } catch {}
}

const readStreamWatchingStorage = (): Pick<
  StreamWatchingState,
  "matchId" | "roomId" | "streamEntrySource"
> | null => {
  if (!isBrowser()) return null
  try {
    const raw = sessionStorage.getItem(STREAM_WATCHING_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const matchId = String(parsed.matchId || "")
    if (!matchId) return null
    return {
      matchId,
      roomId: String(parsed.roomId || ""),
      streamEntrySource: String(parsed.streamEntrySource || TrackingValueEnum.DETAIL),
    }
  } catch {
    return null
  }
}

export const clearStreamWatchingStorage = (): void => {
  if (!isBrowser()) return
  try {
    sessionStorage.removeItem(STREAM_WATCHING_STORAGE_KEY)
  } catch {}
}

export const registerStreamWatching = ({
  matchId = "",
  roomId = "",
  streamEntrySource = TrackingValueEnum.DETAIL,
} = {}): void => {
  const id = String(matchId || "")
  if (!id) return
  streamWatching = {
    matchId: id,
    roomId: String(roomId || ""),
    streamEntrySource: String(streamEntrySource || TrackingValueEnum.DETAIL),
    isPlaying: true,
    userPaused: false,
  }
  if (!streamWatchSessionStartTime) streamWatchSessionStartTime = formatTrackingDateTime()
  syncStreamWatchingStorage()
  streamEndedUnloadSent = false
}

export const markStreamPlaybackPaused = (): void => {
  if (streamLeaveInProgress) return
  if (
    isBrowser() &&
    document.visibilityState === "hidden" &&
    streamWatching?.isPlaying &&
    !streamWatching.userPaused
  ) {
    return
  }
  if (streamWatching) {
    streamWatching.isPlaying = false
    streamWatching.userPaused = true
  }
  clearStreamWatchingStorage()
}

export const clearStreamWatching = (): void => {
  streamWatching = null
  streamWatchSessionStartTime = ""
  clearStreamWatchingStorage()
}

export const beginStreamLeaveTracking = (): void => {
  streamLeaveInProgress = true
}

export const hasStreamEndedUnloadSent = (): boolean => streamEndedUnloadSent

export const markStreamEndedUnloadSent = (): void => {
  streamEndedUnloadSent = true
}

export const getStreamWatchSessionStartTime = (): string =>
  streamWatchSessionStartTime || formatTrackingDateTime()

export const takeStreamWatchingForEnded = () => {
  const fromMemory = () => {
    if (!streamWatching?.matchId || streamWatching.userPaused) return null
    if (!streamWatching.isPlaying && !streamLeaveInProgress) return null
    return {
      matchId: streamWatching.matchId,
      roomId: streamWatching.roomId || "",
      streamEntrySource: streamWatching.streamEntrySource,
    }
  }
  const snap = fromMemory() ?? (streamLeaveInProgress ? readStreamWatchingStorage() : null)
  streamWatching = null
  streamLeaveInProgress = false
  clearStreamWatchingStorage()
  return snap
}

// ─── Stream helpers ───────────────────────────────────────────────────────────

export const normalizeStreamId = (value: unknown): string => {
  if (value == null) return ""
  const normalized = String(value).trim()
  if (!normalized || normalized === "null" || normalized === "undefined") return ""
  return normalized
}

export const getStreamSportType = (
  gameId?: number | null,
  detail: Record<string, unknown> | null = null
): string => {
  const match = (detail?.match as Record<string, unknown>) || detail
  const gid = Number(gameId ?? detail?.gameId ?? (match as Record<string, unknown>)?.gameId ?? 0)
  if (gid === 202) return TrackingValueEnum.SOCCER
  if (gid === 201) return TrackingValueEnum.BASKETBALL
  if (gid > 0 && gid < 200) return TrackingValueEnum.ESPORTS
  return gid ? String(gid) : ""
}

// ─── Payload builders ─────────────────────────────────────────────────────────

// Page / Session
export const payloadPageView = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.PAGE_VIEW,
}
export const payloadSessionStart = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.SESSION_START,
}
export const payloadTimeOnPage = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.TIME_ON_PAGE,
}
export const payloadPageError = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.PAGE_ERROR,
}

// Header & Footer
export const payloadLogoClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.LOGO_CLICKED,
}
export const payloadAuthButtonClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.AUTH_BUTTON_CLICKED,
}
export const payloadUserMenuOpened = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.USER_MENU_OPENED,
}
export const payloadMenuClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.MENU_CLICKED,
}
export const payloadFooterLinkClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.FOOTER_LINK_CLICKED,
}
export const payloadSocialClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.SOCIAL_CLICKED,
}

// Match
export const payloadMatchCardClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.MATCH_CARD_CLICKED,
}
export const payloadMatchDetailViewed = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.MATCH_DETAIL_VIEWED,
}
export const payloadFilterClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.FILTER_CLICKED,
}
export const payloadLeagueClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.LEAGUE_CLICKED,
}
export const payloadMatchWatchClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.MATCH_MATCH_CLICKED,
}
export const payloadMatchWatchIconClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.MATCH_WATCH_ICON_CLICKED,
}
export const payloadHeroMatchClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.HERO_MATCH_CLICKED,
}
export const payloadSidebarMatchClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.SIDEBAR_MATCH_CLICKED,
}

// Highlight & News
export const payloadHighlightCardClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.HIGHLIGHT_CARD_CLICKED,
}
export const payloadHighlightVideoPlayed = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.HIGHLIGHT_VIDEO_PLAYED,
  [TrackingPayloadKeyEnum.CONTENT]: TrackingValueEnum.HIGHLIGHT_VIEW,
}
export const payloadHighlightVideoProgress = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.HIGHLIGHT_VIDEO_PROGRESS,
  [TrackingPayloadKeyEnum.CONTENT]: TrackingValueEnum.HIGHLIGHT_VIEW,
}
export const payloadNewsCardClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.NEWS_CARD_CLICKED,
}
export const payloadShareClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.SHARE_CLICKED,
}

// Auth
export const payloadOpenAuthModal = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.SIGNUP_STARTED,
}
export const payloadSubmitLogin = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.LOGIN_SUBMITTED,
}
export const payloadSubmitLoginSuccess = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.LOGIN_SUCCEEDED,
}
export const payloadSubmitLoginFailed = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.LOGIN_FAILED,
}
export const payloadLogout = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.LOGOUT_CLICKED,
}

// Chat
export const payloadChatLoginRequiredShown = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.CHAT_LOGIN_REQUIRED_SHOWN,
}
export const payloadChatMessageSent = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.CHAT_MESSAGE_SENT,
}
export const payloadChatMessageFailed = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.CHAT_MESSAGE_FAILED,
}
export const payloadChatSlowModeBlocked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.CHAT_SLOW_MODE_BLOCKED,
}
export const payloadChatUrlClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.CHAT_URL_CLICKED,
}
export const payloadChatScrollPaused = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.CHAT_SCROLL_PAUSED,
}
export const payloadChatScrollToLatest = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.CHAT_SCROLL_TO_LATEST,
}
export const payloadChatMessagePinned = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.CHAT_MESSAGE_PINNED,
}
export const payloadChatPinnedBannerClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.CHAT_PINNED_BANNER_CLICKED,
}
export const payloadChatDisconnected = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.CHAT_DISCONNECTED,
}

export const buildChatMessagePinnedPayload = (
  { matchId = "", messageContent = "" }: { matchId?: string; messageContent?: string } = {},
  extra: Record<string, unknown> = {}
) => ({
  ...payloadChatMessagePinned,
  [TrackingPayloadKeyEnum.ACTION_ID]: genId("act"),
  [TrackingPayloadKeyEnum.MATCH_ID]: String(matchId || ""),
  [TrackingPayloadKeyEnum.CTA_TRACKING_LINK]: String(messageContent || ""),
  ...extra,
})

export const buildChatPinnedBannerClickedPayload = (
  { matchId = "", targetLink = "" }: { matchId?: string; targetLink?: string } = {},
  extra: Record<string, unknown> = {}
) => ({
  ...payloadChatPinnedBannerClicked,
  [TrackingPayloadKeyEnum.ACTION_ID]: genId("act"),
  [TrackingPayloadKeyEnum.MATCH_ID]: String(matchId || ""),
  [TrackingPayloadKeyEnum.TARGET_LINK]: String(targetLink || ""),
  [TrackingPayloadKeyEnum.DEVICE_TYPE]: getDeviceType(),
  ...extra,
})

export const buildChatDisconnectedPayload = (
  {
    matchId = "",
    errorCode = "",
    errorMessage = "",
  }: { matchId?: string; errorCode?: string; errorMessage?: string } = {},
  extra: Record<string, unknown> = {}
) => ({
  ...payloadChatDisconnected,
  [TrackingPayloadKeyEnum.ACTION_ID]: genId("act"),
  [TrackingPayloadKeyEnum.MATCH_ID]: String(matchId || ""),
  [TrackingPayloadKeyEnum.ERROR_CODE]: String(errorCode ?? ""),
  [TrackingPayloadKeyEnum.ERROR_MESSAGE]: String(errorMessage ?? ""),
  ...extra,
})

// Stream
export const payloadStreamStarted = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.STREAM_STARTED,
}
export const payloadStreamPaused = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.STREAM_PAUSED,
}
export const payloadStreamResumed = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.STREAM_RESUMED,
}
export const payloadStreamFullscreenToggled = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.STREAM_FULLSCREEN_TOGGLED,
}
export const payloadStreamEndedByUser = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.STREAM_ENDED_BY_USER,
}

// Ads
export const payloadAdImpression = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.AD_IMPRESSION,
}
export const payloadAdClicked = {
  [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.AD_CLICKED,
  [TrackingPayloadKeyEnum.CTA_TYPE]: CtaTypeEnum.BANNER_OVERLAY,
  [TrackingPayloadKeyEnum.CTA_POSITION]: CtaPositionEnum.OVERLAY,
}

/** Resolve ad destination from click event (prefer <a href>) — giống PC's resolveAdBannerTargetLink. */
export const resolveAdBannerTargetLink = (
  event: MouseEvent | null | undefined,
  fallback = ""
): string => {
  if (!event) return String(fallback || "").trim()
  const target = event.currentTarget as HTMLElement | null
  const anchor =
    target?.tagName === "A"
      ? target
      : (target?.closest?.("a") ?? (event.target as HTMLElement)?.closest?.("a"))
  if (!anchor) return String(fallback || "").trim()
  const raw = (anchor as HTMLAnchorElement).href || anchor.getAttribute("href") || ""
  if (!raw || raw === "#" || raw.startsWith("javascript:")) return String(fallback || "").trim()
  try {
    return isBrowser() ? new URL(raw, window.location.origin).href : raw
  } catch {
    return raw || String(fallback || "").trim()
  }
}

export const buildAdClickedPayload = (
  { matchId = "" }: { matchId?: string } = {},
  extra: Record<string, unknown> = {}
) => {
  const normalizedMatchId = normalizeStreamId(matchId)
  return {
    ...payloadAdClicked,
    ...(normalizedMatchId
      ? {
          [TrackingPayloadKeyEnum.EVENT_ID]: normalizedMatchId,
          [TrackingPayloadKeyEnum.MATCH_ID]: normalizedMatchId,
        }
      : {}),
    ...extra,
  }
}

const HOME_BANNER_AD_IMPRESSION_PARAMS = {
  ctaPlacementId: null,
  ctaStartTime: null,
  ctaEndTime: null,
  ctaContent: TrackingValueEnum.BANNER_ADS,
  supporterId: null,
} as const

export const buildBannerAdImpressionParams = ({
  matchId = "",
  ctaTrackingLink = DEFAULT_BANNER_AD_TARGET_LINK,
}: { matchId?: string; ctaTrackingLink?: string } = {}) => ({
  ...HOME_BANNER_AD_IMPRESSION_PARAMS,
  matchId,
  ctaTrackingLink,
})

// ─── Builder functions ────────────────────────────────────────────────────────

export const buildHighlightVideoPlayedPayload = (extra: Record<string, unknown> = {}) => ({
  ...payloadHighlightVideoPlayed,
  [TrackingPayloadKeyEnum.ACTION_ID]: genId("act"),
  ...extra,
})

export const resolveHighlightVideoDurationSec = (
  durationMillisOrSec?: number | null,
  mediaDuration?: number
): number => {
  const fromMedia = Number(mediaDuration)
  if (fromMedia > 0 && Number.isFinite(fromMedia)) return fromMedia
  const n = Number(durationMillisOrSec) || 0
  if (!n) return 0
  return n >= 1000 ? n / 1000 : n
}

export const calcHighlightVideoProgressPercent = (
  currentTime: number,
  duration: number
): number => {
  const cur = Number(currentTime) || 0
  if (!duration || !Number.isFinite(cur)) return 0
  return Math.min(100, Math.max(0, Math.round((cur / duration) * 100)))
}

export const buildHighlightVideoProgressPayload = ({
  actionId,
  progress,
  ...extra
}: { actionId?: string; progress?: number } & Record<string, unknown> = {}) => ({
  ...payloadHighlightVideoProgress,
  [TrackingPayloadKeyEnum.ACTION_ID]: actionId || genId("act"),
  [TrackingPayloadKeyEnum.PROGRESS]: progress,
  ...extra,
})

export const createHighlightVideoTrackingSession = (extra: Record<string, unknown> = {}) => {
  const actionId = genId("act")
  return {
    actionId,
    playedPayload: () =>
      buildHighlightVideoPlayedPayload({
        [TrackingPayloadKeyEnum.ACTION_ID]: actionId,
        ...extra,
      }),
    progressPayload: (currentTime: number, duration: number, mediaDuration?: number) =>
      buildHighlightVideoProgressPayload({
        actionId,
        progress: calcHighlightVideoProgressPercent(
          currentTime,
          resolveHighlightVideoDurationSec(duration, mediaDuration)
        ),
        ...extra,
      }),
  }
}

export const buildStreamEndedByUserPayload = (
  {
    matchId = "",
    roomId = "",
  }: { matchId?: string; roomId?: string; streamEntrySource?: string } = {},
  extra: Record<string, unknown> = {}
) => ({
  ...payloadStreamEndedByUser,
  [TrackingPayloadKeyEnum.ACTION_ID]: genId("act"),
  [TrackingPayloadKeyEnum.MATCH_ID]: normalizeStreamId(matchId),
  [TrackingPayloadKeyEnum.ROOM_ID]: normalizeStreamId(roomId),
  [TrackingPayloadKeyEnum.SESSION_END_TIME]: formatTrackingDateTime(),
  [TrackingPayloadKeyEnum.SOURCE_LINK]: getTrackingSourceLink(),
  [TrackingPayloadKeyEnum.DEVICE_TYPE]: getDeviceType(),
  ...extra,
})

export const buildStreamStartedPayload = (
  {
    matchId = "",
    roomId = "",
  }: { matchId?: string; roomId?: string; streamEntrySource?: string } = {},
  extra: Record<string, unknown> = {}
) => ({
  ...payloadStreamStarted,
  [TrackingPayloadKeyEnum.MATCH_ID]: normalizeStreamId(matchId),
  [TrackingPayloadKeyEnum.ROOM_ID]: normalizeStreamId(roomId),
  [TrackingPayloadKeyEnum.DEVICE_TYPE]: getDeviceType(),
  [TrackingPayloadKeyEnum.SOURCE_LINK]: getTrackingSourceLink(),
  ...extra,
})

export const buildStreamProgressPayload = (
  {
    matchId = "",
    roomId = "",
    gameId,
    detail = null,
  }: {
    matchId?: string
    roomId?: string
    gameId?: number
    detail?: Record<string, unknown> | null
  } = {},
  extra: Record<string, unknown> = {}
) => {
  const normalizedMatchId = normalizeStreamId(matchId)
  return {
    [TrackingPayloadKeyEnum.EVENT_TYPE]: TrackingEventsEnum.STREAM_PROGRESS,
    [TrackingPayloadKeyEnum.ACTION_ID]: genId("act"),
    [TrackingPayloadKeyEnum.MATCH_ID]: normalizedMatchId,
    [TrackingPayloadKeyEnum.ROOM_ID]: normalizeStreamId(roomId),
    [TrackingPayloadKeyEnum.EVENT_ID]: normalizedMatchId,
    [TrackingPayloadKeyEnum.SPORT_TYPE]: getStreamSportType(gameId, detail),
    [TrackingPayloadKeyEnum.SESSION_START_TIME]: getStreamWatchSessionStartTime(),
    [TrackingPayloadKeyEnum.DEVICE_TYPE]: getDeviceType(),
    [TrackingPayloadKeyEnum.SOURCE_LINK]: getTrackingSourceLink(),
    [TrackingPayloadKeyEnum.PAGE_REFERRER]: getTrackingPageReferrer(),
    ...extra,
  }
}

const buildStreamLifecyclePayload = (
  basePayload: Record<string, unknown>,
  { matchId = "", roomId = "" }: { matchId?: string; roomId?: string } = {},
  extra: Record<string, unknown> = {}
): Record<string, unknown> => ({
  ...basePayload,
  [TrackingPayloadKeyEnum.MATCH_ID]: normalizeStreamId(matchId),
  [TrackingPayloadKeyEnum.ROOM_ID]: normalizeStreamId(roomId),
  [TrackingPayloadKeyEnum.DEVICE_TYPE]: getDeviceType(),
  ...extra,
})

export const buildStreamPausedPayload = (
  { matchId = "", roomId = "" }: { matchId?: string; roomId?: string } = {},
  extra: Record<string, unknown> = {}
) => buildStreamLifecyclePayload(payloadStreamPaused, { matchId, roomId }, extra)

export const buildStreamResumedPayload = (
  { matchId = "", roomId = "" }: { matchId?: string; roomId?: string } = {},
  extra: Record<string, unknown> = {}
) => buildStreamLifecyclePayload(payloadStreamResumed, { matchId, roomId }, extra)

export const buildStreamFullscreenPayload = (
  { matchId = "" }: { matchId?: string } = {},
  extra: Record<string, unknown> = {}
) => ({
  ...payloadStreamFullscreenToggled,
  [TrackingPayloadKeyEnum.MATCH_ID]: normalizeStreamId(matchId),
  [TrackingPayloadKeyEnum.DEVICE_TYPE]: getDeviceType(),
  ...extra,
})

const buildStreamIssuePayload = (
  eventType: string,
  {
    matchId = "",
    gameId,
    detail = null,
    errorCode = "",
    errorMessage = "",
  }: {
    matchId?: string
    gameId?: number
    detail?: Record<string, unknown> | null
    errorCode?: string
    errorMessage?: string
  } = {},
  extra: Record<string, unknown> = {}
): Record<string, unknown> => ({
  [TrackingPayloadKeyEnum.EVENT_TYPE]: eventType,
  [TrackingPayloadKeyEnum.ACTION_ID]: genId("act"),
  [TrackingPayloadKeyEnum.MATCH_ID]: String(matchId || ""),
  [TrackingPayloadKeyEnum.SPORT_TYPE]: getStreamSportType(gameId, detail),
  [TrackingPayloadKeyEnum.DEVICE_TYPE]: getDeviceType(),
  [TrackingPayloadKeyEnum.ERROR_CODE]: String(errorCode ?? ""),
  [TrackingPayloadKeyEnum.ERROR_MESSAGE]: String(errorMessage ?? ""),
  ...extra,
})

export const buildStreamErrorPayload = (
  params?: Parameters<typeof buildStreamIssuePayload>[1],
  extra?: Record<string, unknown>
) => buildStreamIssuePayload(TrackingEventsEnum.STREAM_ERROR, params, extra)

export const buildStreamBufferingPayload = (
  params?: Parameters<typeof buildStreamIssuePayload>[1],
  extra?: Record<string, unknown>
) => buildStreamIssuePayload(TrackingEventsEnum.STREAM_BUFFERING, params, extra)

export const buildStreamRecoveredPayload = (
  params?: Parameters<typeof buildStreamIssuePayload>[1],
  extra?: Record<string, unknown>
) => buildStreamIssuePayload(TrackingEventsEnum.STREAM_RECOVERED, params, extra)

// ─── Send functions ───────────────────────────────────────────────────────────

export const postTrackingEvent = (payload: Record<string, unknown>): void => {
  if (!isBrowser()) return
  try {
    fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", sysType: "PC" },
      body: JSON.stringify(payload),
    })
  } catch {}
}

export const sendBeaconTrackingEvent = (payload: Record<string, unknown>): boolean => {
  if (!isBrowser()) return false
  try {
    if (!navigator?.sendBeacon) return false
    const body = new Blob([JSON.stringify(payload)], { type: "application/json" })
    return navigator.sendBeacon(TRACK_URL, body)
  } catch {
    return false
  }
}

// ─── Re-exports for external use ──────────────────────────────────────────────

export { SESSION_START_SENT_TAB_KEY, SESSION_START_SENT_KEY, STREAM_PROGRESS_INTERVAL_MS }

// ─── Session reset helpers (gọi trực tiếp từ auth flows) ────────────────────

function _trackSessionStartOnce(sessionId: string, uid: string | null) {
  if (!isBrowser()) return
  try {
    const sentSessionIdInTab = sessionStorage.getItem(SESSION_START_SENT_TAB_KEY)
    if (sentSessionIdInTab === sessionId) return
    sessionStorage.setItem(SESSION_START_SENT_TAB_KEY, sessionId)
    localStorage.removeItem(SESSION_START_SENT_KEY)
  } catch {}
  postTrackingEvent({
    ...payloadSessionStart,
    ...getTrackingContextFields(),
    [TrackingPayloadKeyEnum.SESSION_ID]: sessionId,
    [TrackingPayloadKeyEnum.USER_ID]: uid,
    [TrackingPayloadKeyEnum.ANONYMOUS_ID]: anonymousId,
  })
}

/** Gọi sau khi login thành công — đổi session_id, fire session_start mới với uid mới. */
export const doSessionResetOnLogin = (uid: string | null): void => {
  if (!isBrowser()) return
  const newSessionId = resetSessionId()
  try {
    sessionStorage.removeItem(SESSION_START_SENT_TAB_KEY)
    localStorage.removeItem(SESSION_START_SENT_KEY)
  } catch {}
  _trackSessionStartOnce(newSessionId, uid)
}

/** Gọi trước khi logout — fire time_on_page, đổi session_id, fire session_start anonymous. */
export const doSessionResetOnLogout = (uid: string | null): void => {
  if (!isBrowser()) return
  const oldSessionId = getSessionId()
  postTrackingEvent({
    ...payloadTimeOnPage,
    ...getTrackingContextFields(),
    [TrackingPayloadKeyEnum.SESSION_ID]: oldSessionId,
    [TrackingPayloadKeyEnum.USER_ID]: uid,
    [TrackingPayloadKeyEnum.ANONYMOUS_ID]: anonymousId,
    [TrackingPayloadKeyEnum.SESSION_END_TIME]: Date.now(),
  })
  const newSessionId = resetSessionId()
  try {
    sessionStorage.removeItem(SESSION_START_SENT_TAB_KEY)
    localStorage.removeItem(SESSION_START_SENT_KEY)
  } catch {}
  _trackSessionStartOnce(newSessionId, null)
}

export interface MatchTrackingData {
  matchId?: number | string | null
  // Team IDs — PC dùng item.home || item.homeId
  home?: number | string | null
  homeId?: number | string | null
  homeName?: string | null
  // Away team IDs — PC dùng item.away || item.awayId
  away?: number | string | null
  awayId?: number | string | null
  awayName?: string | null
  leagueId?: number | string | null
  leagueName?: string | null
  homeScore?: number | null
  awayScore?: number | null
  startTime?: number | string | null
  kickoffTime?: number | string | null
  matchEndTime?: number | string | null
  endTime?: number | string | null
  // CURRENT_MINUTE — PC: item.currentMinute ?? item.gameTime ?? item.periodText
  currentMinute?: number | string | null
  gameTime?: number | null
  periodText?: string | null
  status?: number | null
  live?: unknown
  finished?: boolean | null
  anchor?: unknown
  roomId?: number | string | null
}

/** Đọc data-tracking-area từ element được click — giống PC's getTrackingArea(). */
export const getTrackingArea = (event: MouseEvent | null | undefined): string => {
  const el = (event?.target as HTMLElement | null)?.closest?.("[data-tracking-area]")
  return el?.getAttribute?.("data-tracking-area") || TrackingValueEnum.WHOLE_CARD
}

/** Phân loại trạng thái trận đấu — giống PC's getMatchTrackingStatus(). */
export const getMatchTrackingStatus = (
  item: MatchTrackingData,
  fallback = TrackingValueEnum.UPCOMING
): string => {
  const status = Number(item?.status)
  if (status === 2 || Number(item?.live) === 1) return TrackingValueEnum.LIVE
  if (status === 3 || item?.finished) return TrackingValueEnum.FINISHED
  if (status === 1) return TrackingValueEnum.UPCOMING
  return fallback
}

/** Giống PC: buildMatchCardPayload(item, event, { targetLink, PLACEMENT, CTA_POSITION, MATCH_STATUS, ...extra }) */
export const buildMatchCardPayload = (
  match: MatchTrackingData,
  event: MouseEvent | null | undefined,
  { targetLink = "", ...extra }: { targetLink?: string } & Record<string, unknown> = {}
) => ({
  ...payloadMatchCardClicked,
  [TrackingPayloadKeyEnum.TARGET_LINK]: targetLink,
  [TrackingPayloadKeyEnum.MATCH_ID]: String(match.matchId ?? ""),
  [TrackingPayloadKeyEnum.HOME_TEAM_ID]: String(match.home ?? match.homeId ?? ""),
  [TrackingPayloadKeyEnum.HOME_TEAM_NAME]: match.homeName ?? "",
  [TrackingPayloadKeyEnum.AWAY_TEAM_ID]: String(match.away ?? match.awayId ?? ""),
  [TrackingPayloadKeyEnum.AWAY_TEAM_NAME]: match.awayName ?? "",
  [TrackingPayloadKeyEnum.LEAGUE_ID]: String(match.leagueId ?? ""),
  [TrackingPayloadKeyEnum.LEAGUE_NAME]: match.leagueName ?? "",
  [TrackingPayloadKeyEnum.CURRENT_MINUTE]:
    match.currentMinute ?? match.gameTime ?? match.periodText ?? null,
  [TrackingPayloadKeyEnum.HOME_SCORE]: match.homeScore ?? null,
  [TrackingPayloadKeyEnum.AWAY_SCORE]: match.awayScore ?? null,
  [TrackingPayloadKeyEnum.KICKOFF_TIME]: String(match.kickoffTime ?? match.startTime ?? ""),
  [TrackingPayloadKeyEnum.CTA_CONTENT]: getTrackingArea(event),
  ...extra,
})

export const buildMatchDetailViewedPayload = (
  match: MatchTrackingData,
  extra: Record<string, unknown> = {}
) => ({
  ...payloadMatchDetailViewed,
  [TrackingPayloadKeyEnum.ACTION_ID]: genId("act"),
  [TrackingPayloadKeyEnum.MATCH_ID]: String(match.matchId ?? ""),
  [TrackingPayloadKeyEnum.LEAGUE_ID]: String(match.leagueId ?? ""),
  [TrackingPayloadKeyEnum.LEAGUE_NAME]: match.leagueName ?? "",
  [TrackingPayloadKeyEnum.HOME_TEAM_ID]: String(match.home ?? match.homeId ?? ""),
  [TrackingPayloadKeyEnum.HOME_TEAM_NAME]: match.homeName ?? "",
  [TrackingPayloadKeyEnum.AWAY_TEAM_ID]: String(match.away ?? match.awayId ?? ""),
  [TrackingPayloadKeyEnum.AWAY_TEAM_NAME]: match.awayName ?? "",
  [TrackingPayloadKeyEnum.KICKOFF_TIME]: String(match.kickoffTime ?? match.startTime ?? ""),
  [TrackingPayloadKeyEnum.MATCH_END_TIME]: String(match.matchEndTime ?? match.endTime ?? ""),
  ...extra,
})

/** Giống PC buildMatchWatchPayload — EVENT_TYPE: MATCH_MATCH_CLICKED */
export const buildMatchWatchPayload = (
  match: MatchTrackingData,
  basePayload: Record<string, unknown> = payloadMatchWatchClicked,
  extra: Record<string, unknown> = {}
) => ({
  ...basePayload,
  [TrackingPayloadKeyEnum.ACTION_ID]: genId("act"),
  [TrackingPayloadKeyEnum.MATCH_ID]: String(match.matchId ?? ""),
  [TrackingPayloadKeyEnum.LEAGUE_ID]: String(match.leagueId ?? ""),
  [TrackingPayloadKeyEnum.LEAGUE_NAME]: match.leagueName ?? "",
  [TrackingPayloadKeyEnum.HOME_TEAM_ID]: String(match.home ?? match.homeId ?? ""),
  [TrackingPayloadKeyEnum.HOME_TEAM_NAME]: match.homeName ?? "",
  [TrackingPayloadKeyEnum.AWAY_TEAM_ID]: String(match.away ?? match.awayId ?? ""),
  [TrackingPayloadKeyEnum.AWAY_TEAM_NAME]: match.awayName ?? "",
  [TrackingPayloadKeyEnum.KICKOFF_TIME]: String(match.kickoffTime ?? match.startTime ?? ""),
  [TrackingPayloadKeyEnum.MATCH_END_TIME]: String(match.matchEndTime ?? match.endTime ?? ""),
  ...extra,
})

/** Giống PC buildMatchWatchLiveIconPayload — EVENT_TYPE: MATCH_WATCH_ICON_CLICKED */
export const buildMatchWatchLiveIconPayload = (
  match: MatchTrackingData,
  extra: Record<string, unknown> = {}
) => ({
  ...payloadMatchWatchIconClicked,
  [TrackingPayloadKeyEnum.ACTION_ID]: genId("act"),
  [TrackingPayloadKeyEnum.MATCH_ID]: String(match.matchId ?? ""),
  [TrackingPayloadKeyEnum.LIVE_ROOM_ID]: String(match.roomId ?? ""),
  [TrackingPayloadKeyEnum.SESSION_START_TIME]: formatTrackingDateTime(),
  ...extra,
})

export const buildAdImpressionPayload = (
  {
    matchId = "",
    ctaPlacementId = null as string | null,
    ctaStartTime = null as string | null,
    ctaEndTime = null as string | null,
    ctaContent = TrackingValueEnum.BANNER_ADS,
    ctaTrackingLink = DEFAULT_BANNER_AD_TARGET_LINK,
    supporterId = null as string | null,
  }: {
    matchId?: string
    ctaPlacementId?: string | null
    ctaStartTime?: string | null
    ctaEndTime?: string | null
    ctaContent?: string
    ctaTrackingLink?: string
    supporterId?: string | null
  } = {},
  extra: Record<string, unknown> = {}
) => {
  const normalizedMatchId = normalizeStreamId(matchId)
  return {
    ...payloadAdImpression,
    [TrackingPayloadKeyEnum.CTA_PLACEMENT_ID]: ctaPlacementId,
    ...(normalizedMatchId
      ? {
          [TrackingPayloadKeyEnum.EVENT_ID]: normalizedMatchId,
          [TrackingPayloadKeyEnum.MATCH_ID]: normalizedMatchId,
        }
      : {}),
    [TrackingPayloadKeyEnum.CTA_TYPE]: CtaTypeEnum.BANNER_OVERLAY,
    [TrackingPayloadKeyEnum.CTA_START_TIME]: ctaStartTime,
    [TrackingPayloadKeyEnum.CTA_END_TIME]: ctaEndTime,
    [TrackingPayloadKeyEnum.CTA_POSITION]: CtaPositionEnum.OVERLAY,
    [TrackingPayloadKeyEnum.CTA_CONTENT]: ctaContent,
    [TrackingPayloadKeyEnum.CTA_TRACKING_LINK]: ctaTrackingLink,
    [TrackingPayloadKeyEnum.SUPPORTER_ID]: supporterId,
    ...extra,
  }
}

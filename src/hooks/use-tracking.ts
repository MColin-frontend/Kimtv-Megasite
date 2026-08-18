"use client"

import {
  anonymousId,
  beginStreamLeaveTracking,
  bindSessionLifecycle,
  buildAdClickedPayload,
  buildAdImpressionPayload,
  buildStreamEndedByUserPayload,
  getDeviceType,
  getSessionId,
  getTrackingContextFields,
  getTrackingPagePath,
  getTrackingPageReferrer,
  hasStreamEndedUnloadSent,
  isLastActiveTrackingTab,
  markStreamEndedUnloadSent,
  payloadPageError,
  payloadPageView,
  payloadSessionStart,
  payloadTimeOnPage,
  postTrackingEvent,
  resetSessionId,
  resolveAdBannerTargetLink,
  sendBeaconTrackingEvent,
  SESSION_START_SENT_KEY,
  SESSION_START_SENT_TAB_KEY,
  setTrackingPreviousUrl,
  shouldSkipUnloadTrackingForReload,
  takeStreamWatchingForEnded,
} from "@/lib/tracking.constants"

import { TrackingPayloadKeyEnum, TrackingValueEnum } from "@/enums/tracking.enum"

interface UseTrackingOptions {
  userId?: string | null
}

export function useTracking({ userId }: UseTrackingOptions = {}) {
  bindSessionLifecycle()

  const uid = userId || null

  const basePayload = {
    [TrackingPayloadKeyEnum.USER_ID]: uid,
    [TrackingPayloadKeyEnum.ANONYMOUS_ID]: anonymousId,
    [TrackingPayloadKeyEnum.SESSION_ID]: getSessionId(),
    [TrackingPayloadKeyEnum.DEVICE_TYPE]: getDeviceType(),
  }

  // ── Core click/event sender ────────────────────────────────────────────────

  const onClick = (extra: Record<string, unknown>) => {
    postTrackingEvent({
      ...basePayload,
      ...getTrackingContextFields(),
      ...extra,
    })
  }

  // ── Ad click — target_link = ad destination, source_link = current page ────

  const onClickAd = (
    {
      targetLink = "",
      ctaContent = TrackingValueEnum.BANNER_ADS,
      event = null as MouseEvent | null,
      matchId = "",
      ctaType = null as string | null,
      ctaPosition = null as string | null,
    } = {},
    extra: Record<string, unknown> = {}
  ) => {
    const resolvedTarget = resolveAdBannerTargetLink(event, targetLink)
    postTrackingEvent({
      [TrackingPayloadKeyEnum.USER_ID]: uid,
      [TrackingPayloadKeyEnum.ANONYMOUS_ID]: anonymousId,
      [TrackingPayloadKeyEnum.SESSION_ID]: getSessionId(),
      ...getTrackingContextFields(),
      ...buildAdClickedPayload(
        { matchId },
        {
          [TrackingPayloadKeyEnum.CTA_CONTENT]: ctaContent,
          ...(ctaType ? { [TrackingPayloadKeyEnum.CTA_TYPE]: ctaType } : {}),
          ...(ctaPosition ? { [TrackingPayloadKeyEnum.CTA_POSITION]: ctaPosition } : {}),
          ...extra,
        }
      ),
      [TrackingPayloadKeyEnum.TARGET_LINK]: resolvedTarget,
    })
  }

  // ── Ad impression — fires when banner enters viewport ──────────────────────

  const onAdImpression = (
    {
      matchId = "",
      ctaPlacementId = null as string | null,
      ctaStartTime = null as string | null,
      ctaEndTime = null as string | null,
      ctaContent = TrackingValueEnum.BANNER_ADS,
      ctaTrackingLink = "",
      supporterId = null as string | null,
    } = {},
    extra: Record<string, unknown> = {}
  ) => {
    postTrackingEvent({
      [TrackingPayloadKeyEnum.USER_ID]: uid,
      [TrackingPayloadKeyEnum.ANONYMOUS_ID]: anonymousId,
      [TrackingPayloadKeyEnum.SESSION_ID]: getSessionId(),
      ...getTrackingContextFields(),
      ...buildAdImpressionPayload(
        {
          matchId,
          ctaPlacementId,
          ctaStartTime,
          ctaEndTime,
          ctaContent,
          ctaTrackingLink,
          supporterId,
        },
        extra
      ),
    })
  }

  // ── Session start (once per tab per session) ───────────────────────────────

  const trackSessionStartOnce = (sessionId: string) => {
    if (typeof window === "undefined") return
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

  // ── Page view ──────────────────────────────────────────────────────────────

  const onPageView = () => {
    const sessionId = getSessionId()
    trackSessionStartOnce(sessionId)
    postTrackingEvent({
      ...payloadPageView,
      ...getTrackingContextFields(),
      [TrackingPayloadKeyEnum.SESSION_ID]: sessionId,
      [TrackingPayloadKeyEnum.USER_ID]: uid,
      [TrackingPayloadKeyEnum.ANONYMOUS_ID]: anonymousId,
    })
    setTrackingPreviousUrl()
  }

  // ── Time on page (cleanup fires on unload or route change) ─────────────────

  const onTimeOnPage = (extra?: Record<string, unknown>): (() => void) => {
    if (typeof window === "undefined") return () => {}

    const pageEnteredAt = Date.now()
    let sent = false

    const send = () => {
      if (sent) return
      if (!isLastActiveTrackingTab()) return
      sent = true
      const payload = {
        ...payloadTimeOnPage,
        ...getTrackingContextFields(),
        [TrackingPayloadKeyEnum.SESSION_ID]: getSessionId(),
        [TrackingPayloadKeyEnum.USER_ID]: uid,
        [TrackingPayloadKeyEnum.ANONYMOUS_ID]: anonymousId,
        [TrackingPayloadKeyEnum.SESSION_DURATION]: Date.now() - pageEnteredAt,
        ...extra,
      }
      if (!sendBeaconTrackingEvent(payload)) postTrackingEvent(payload)
    }

    window.addEventListener("beforeunload", send)
    window.addEventListener("pagehide", send)

    return () => {
      send()
      window.removeEventListener("beforeunload", send)
      window.removeEventListener("pagehide", send)
    }
  }

  // ── Stream ended by user (unload-safe via beacon) ──────────────────────────

  const tryTrackStreamEndedByUser = ({ viaUnload = false } = {}) => {
    if (hasStreamEndedUnloadSent()) return
    if (shouldSkipUnloadTrackingForReload()) return
    if (viaUnload) beginStreamLeaveTracking()

    const snap = takeStreamWatchingForEnded()
    if (!snap) return

    markStreamEndedUnloadSent()
    const payload = {
      ...basePayload,
      ...getTrackingContextFields(),
      ...buildStreamEndedByUserPayload(snap),
    }

    if (viaUnload) {
      if (!sendBeaconTrackingEvent(payload)) postTrackingEvent(payload)
      return
    }

    postTrackingEvent(payload)
  }

  const onStreamEndedByUserUnload = (): (() => void) => {
    if (typeof window === "undefined") return () => {}

    const send = (event?: Event) => {
      if (event?.type === "pagehide" && (event as PageTransitionEvent).persisted) return
      tryTrackStreamEndedByUser({ viaUnload: true })
    }

    const onVisibilityHidden = () => {
      if (document.visibilityState !== "hidden") return
      tryTrackStreamEndedByUser({ viaUnload: true })
    }

    window.addEventListener("beforeunload", send)
    window.addEventListener("pagehide", send)
    document.addEventListener("visibilitychange", onVisibilityHidden)

    return () => {
      window.removeEventListener("beforeunload", send)
      window.removeEventListener("pagehide", send)
      document.removeEventListener("visibilitychange", onVisibilityHidden)
    }
  }

  // ── Page error ─────────────────────────────────────────────────────────────

  const onPageError = ({
    errorCode,
    errorMessage = "",
    pagePath,
    pageReferrer,
  }: {
    errorCode?: string | number
    errorMessage?: string
    pagePath?: string
    pageReferrer?: string
  } = {}) => {
    if (typeof window === "undefined") return
    postTrackingEvent({
      ...payloadPageError,
      ...getTrackingContextFields(),
      [TrackingPayloadKeyEnum.SESSION_ID]: getSessionId(),
      [TrackingPayloadKeyEnum.USER_ID]: uid,
      [TrackingPayloadKeyEnum.ANONYMOUS_ID]: anonymousId,
      [TrackingPayloadKeyEnum.ERROR_CODE]: errorCode,
      [TrackingPayloadKeyEnum.ERROR_MESSAGE]: errorMessage,
      [TrackingPayloadKeyEnum.PAGE_PATH]: pagePath ?? getTrackingPagePath(),
      [TrackingPayloadKeyEnum.PAGE_REFERRER]: pageReferrer ?? getTrackingPageReferrer(),
    })
  }

  // ── Auth session management ────────────────────────────────────────────────

  const onLoginSessionStart = () => {
    if (typeof window === "undefined") return
    const newSessionId = resetSessionId()
    try {
      sessionStorage.removeItem(SESSION_START_SENT_TAB_KEY)
      localStorage.removeItem(SESSION_START_SENT_KEY)
    } catch {}
    trackSessionStartOnce(newSessionId)
  }

  const onLogoutResetSession = () => {
    if (typeof window === "undefined") return
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
    trackSessionStartOnce(newSessionId)
  }

  return {
    onClick,
    onClickAd,
    onAdImpression,
    onPageView,
    onTimeOnPage,
    onStreamEndedByUserUnload,
    tryTrackStreamEndedByUser,
    onPageError,
    onLoginSessionStart,
    onLogoutResetSession,
  }
}

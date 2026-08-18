"use client"

import { useEffect, useState } from "react"

import { exchangeIdTokenAction } from "@/server/actions/auth.action"
import {
  clearAuthCookies,
  getCachedUserInfo,
  getTokenFromCookie,
  getUserInfoFromCookie,
  saveAuthCookies,
  type KimtvUser,
} from "@/lib/auth-cookie"
import { getUserManager, loginWith99kim, logoutFrom99kim } from "@/lib/oidc"
import {
  anonymousId,
  doSessionResetOnLogin,
  doSessionResetOnLogout,
  getSessionId,
  getTrackingContextFields,
  payloadLogout,
  payloadOpenAuthModal,
  payloadSubmitLoginSuccess,
  postTrackingEvent,
} from "@/lib/tracking.constants"

import { TrackingPayloadKeyEnum } from "@/enums/tracking.enum"

const RETURN_TO_KEY = "auth_return_to"

interface AuthState {
  user: KimtvUser | null
  isLoggedIn: boolean
  isLoading: boolean
}

// Dedup: chỉ thử silent login một lần duy nhất mỗi page load
let _silentLoginPromise: Promise<KimtvUser | null> | null = null

async function trySilentLogin(): Promise<KimtvUser | null> {
  if (!_silentLoginPromise) {
    _silentLoginPromise = (async () => {
      try {
        const um = await getUserManager()
        const oidcUser = await um.signinSilent()
        if (!oidcUser?.id_token) return null
        const promotionChannelId = localStorage.getItem("promotionChannelId") ?? ""
        const res = await exchangeIdTokenAction(oidcUser.id_token, promotionChannelId)
        if (res.status === "success") {
          saveAuthCookies(res.result.token, res.result.user as KimtvUser)
          return res.result.user as KimtvUser
        }
        return null
      } catch {
        return null
      }
    })()
  }
  return _silentLoginPromise
}

export function useAuth(): AuthState & { login: () => void; logout: () => void } {
  const [state, setState] = useState<AuthState>({ user: null, isLoggedIn: false, isLoading: true })

  useEffect(() => {
    async function init() {
      const token = getTokenFromCookie()
      if (token) {
        setState({ user: getUserInfoFromCookie(), isLoggedIn: true, isLoading: false })
        return
      }

      // Không có token cookie nhưng có cache → hiển thị user ngay, xác nhận token ngầm
      const cached = getCachedUserInfo()
      if (cached) {
        setState({ user: cached, isLoggedIn: true, isLoading: true })
      }

      // Lấy lại token từ identity server (dùng refresh_token nếu có, không thì iframe)
      const user = await trySilentLogin()
      if (user) {
        const uid = String(user.userId ?? user.uid ?? "")
        doSessionResetOnLogin(uid)
        postTrackingEvent({
          ...payloadSubmitLoginSuccess,
          ...getTrackingContextFields(),
          [TrackingPayloadKeyEnum.SESSION_ID]: getSessionId(),
          [TrackingPayloadKeyEnum.USER_ID]: uid,
          [TrackingPayloadKeyEnum.ANONYMOUS_ID]: anonymousId,
          [TrackingPayloadKeyEnum.AUTH_METHOD]: "oidc_silent",
        })
      }

      setState({ user, isLoggedIn: !!user, isLoading: false })
    }

    init()
  }, [])

  const login = () => {
    // PC: fires payloadOpenAuthModal (SIGNUP_STARTED) khi user bắt đầu login
    postTrackingEvent({
      ...payloadOpenAuthModal,
      ...getTrackingContextFields(),
      [TrackingPayloadKeyEnum.SESSION_ID]: getSessionId(),
      [TrackingPayloadKeyEnum.ANONYMOUS_ID]: anonymousId,
    })
    // Lưu URL hiện tại để redirect về sau khi login xong
    try {
      sessionStorage.setItem(RETURN_TO_KEY, window.location.pathname + window.location.search)
    } catch {}
    loginWith99kim().catch(console.error)
  }

  const logout = () => {
    const uid =
      state.user?.userId != null
        ? String(state.user.userId)
        : state.user?.uid != null
          ? String(state.user.uid)
          : null
    postTrackingEvent({
      ...payloadLogout,
      ...getTrackingContextFields(),
      [TrackingPayloadKeyEnum.SESSION_ID]: getSessionId(),
      [TrackingPayloadKeyEnum.USER_ID]: uid,
      [TrackingPayloadKeyEnum.ANONYMOUS_ID]: anonymousId,
    })
    doSessionResetOnLogout(uid)
    _silentLoginPromise = null
    clearAuthCookies()
    setState({ user: null, isLoggedIn: false, isLoading: false })
    logoutFrom99kim().catch(() => {
      window.location.href = "/"
    })
  }

  return { ...state, login, logout }
}

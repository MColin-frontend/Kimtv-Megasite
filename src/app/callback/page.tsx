"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { exchangeIdTokenAction } from "@/server/actions/auth.action"
import { saveAuthCookies } from "@/lib/auth-cookie"
import { signinRedirectCallback } from "@/lib/oidc"

import { DEFAULT_LOCALE, useTranslation } from "@/i18n"

const RETURN_TO_KEY = "auth_return_to"

export default function CallbackPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [status, setStatus] = useState<"processing" | "error" | "exchange_error">("processing")
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function handle() {
      // Đọc returnTo trước khi bất kỳ redirect nào
      const returnTo = sessionStorage.getItem(RETURN_TO_KEY) || `/${DEFAULT_LOCALE}`
      sessionStorage.removeItem(RETURN_TO_KEY)

      try {
        const user = await signinRedirectCallback()
        const idToken = user?.id_token
        if (!idToken) throw new Error("Missing id_token")

        const promotionChannelId = localStorage.getItem("promotionChannelId") ?? ""
        const res = await exchangeIdTokenAction(idToken, promotionChannelId)

        if (res.status === "success") {
          saveAuthCookies(res.result.token, res.result.user)
          if (res.result.newUser) sessionStorage.setItem("kim99_new_user", "1")
          router.replace(returnTo)
        } else {
          // Backend trả lỗi (token hết hạn, không hợp lệ, v.v.)
          console.error("[callback] exchange failed:", res.errorCode, res.errorMsg)
          setStatus("exchange_error")
          setTimeout(() => router.replace(returnTo), 2500)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        // State không còn trong storage (refresh giữa chừng, replay…) → về nhà
        if (
          msg.includes("No matching state found in storage") ||
          msg.includes("No state in response")
        ) {
          router.replace(returnTo)
          return
        }
        console.error("[callback] OIDC error:", msg)
        setStatus("error")
        setTimeout(() => router.replace(returnTo), 2500)
      }
    }

    handle()
  }, [router])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-white">
      {status === "processing" && (
        <>
          <div className="border-blue h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-14 text-muted">{t("header.auth.callback.processing")}</p>
        </>
      )}
      {(status === "error" || status === "exchange_error") && (
        <p className="text-14 text-red-400">{t("header.auth.callback.error")}</p>
      )}
    </div>
  )
}

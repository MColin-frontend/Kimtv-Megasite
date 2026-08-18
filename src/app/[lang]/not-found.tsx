"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home } from "lucide-react"

import { useTracking } from "@/hooks/use-tracking"

import { DEFAULT_LOCALE, useTranslation } from "@/i18n"

import { Typography } from "@/components/ui/typography"

import imgStadiumBg from "@assets/images/common/img-stadium-bg.webp"

export default function NotFound() {
  const pathname = usePathname()
  const lang = pathname?.split("/")?.[1] || DEFAULT_LOCALE
  const { t } = useTranslation()
  const { onPageError } = useTracking()

  useEffect(() => {
    onPageError({ errorCode: 404, errorMessage: "Not Found", pagePath: pathname ?? "" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <section className="relative flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imgStadiumBg.src})` }}
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/55 via-black/45 to-black/75" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 max-sm:gap-6">
        {/* 404 + X marks */}
        <div className="relative flex items-center justify-center gap-4 select-none">
          <span
            className="font-800 text-gold/60 text-[48px] leading-none max-sm:text-[32px]"
            aria-hidden
            style={{ textShadow: "0 0 20px rgba(246,195,67,0.5)" }}
          >
            ✕
          </span>

          <h1
            className="font-800 text-gold leading-none"
            style={{
              fontSize: "clamp(80px, 18vw, 180px)",
              textShadow:
                "0 0 40px rgba(246,195,67,0.9), 0 0 80px rgba(246,195,67,0.5), 0 0 120px rgba(246,195,67,0.25)",
            }}
          >
            4
            <span className="relative inline-block">
              <span className="relative z-10">0</span>
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <span
                  className="inline-block animate-[spin_8s_linear_infinite] text-[0.8em]"
                  style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.9))" }}
                >
                  ⚽
                </span>
              </span>
            </span>
            4
          </h1>

          <span
            className="font-800 text-gold/60 text-[48px] leading-none max-sm:text-[32px]"
            aria-hidden
            style={{ textShadow: "0 0 20px rgba(246,195,67,0.5)" }}
          >
            ✕
          </span>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-4 max-sm:gap-2">
          <Typography as="p" variant="h5" className="tracking-[0.2em] text-white/90">
            {t("common.not-found.subtitle")}
          </Typography>
          <h2
            className="font-800 leading-none text-white uppercase"
            style={{
              fontSize: "clamp(32px, 7vw, 64px)",
              textShadow: "0 2px 24px rgba(0,0,0,0.8)",
            }}
          >
            Không tồn tại
          </h2>
        </div>

        {/* Description */}
        <Typography variant="h6" className="max-sm:!text-14 max-w-sm text-white/80">
          {t("common.not-found.description")}
        </Typography>

        {/* Buttons */}
        <div className="mt-2 flex items-center gap-4 max-sm:w-full max-sm:flex-col max-sm:gap-3">
          <Link
            href={`/${lang}`}
            className="rounded-8 bg-gold font-700 flex items-center gap-2 px-6 py-3 text-black shadow-[0_0_24px_rgba(246,195,67,0.5)] transition-all hover:scale-[1.03] hover:shadow-[0_0_36px_rgba(246,195,67,0.7)] active:scale-95 max-sm:w-full max-sm:justify-center"
          >
            <Home className="size-4 shrink-0" />
            <Typography
              as="span"
              variant="body-lg"
              weight="700"
              className="leading-none text-black"
            >
              {t("common.not-found.home")}
            </Typography>
          </Link>
          <Link
            href={`/${lang}/lich-thi-dau`}
            className="rounded-8 font-700 flex items-center gap-2 border border-white/30 bg-white/10 px-6 py-3 text-white backdrop-blur-sm transition-all hover:scale-[1.03] hover:border-white/50 hover:bg-white/[0.18] active:scale-95 max-sm:w-full max-sm:justify-center"
          >
            <Calendar className="size-4 shrink-0" />
            <Typography
              as="span"
              variant="body-lg"
              weight="700"
              className="leading-none text-white"
            >
              {t("common.not-found.schedule")}
            </Typography>
          </Link>
        </div>

        {/* Hint */}
        <Typography variant="body" className="mt-2 text-white/60">
          Hoặc thử tìm kiếm trang khác
        </Typography>
      </div>

      {/* Glow orb */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 z-[1] h-64 w-96 -translate-x-1/2 translate-y-1/2 rounded-full blur-[80px]"
        style={{ background: "radial-gradient(circle, rgba(246,195,67,0.18) 0%, transparent 70%)" }}
        aria-hidden
      />
    </section>
  )
}

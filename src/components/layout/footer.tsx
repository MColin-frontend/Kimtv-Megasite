"use client"

import Link from "next/link"

import { payloadFooterLinkClicked } from "@/lib/tracking.constants"
import { useTracking } from "@/hooks/use-tracking"

import { useTranslation } from "@/i18n"
import { getRoutes } from "@/config/routes"
import { FOOTER_MENUS } from "@/constants/component/layout.constants"
import { TrackingPayloadKeyEnum } from "@/enums/tracking.enum"

import type { FooterMenuInterface } from "@/components/layout/layout.models"
import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

import kimtvLogo from "@assets/icons/layout/ic-kimtv.svg"

export function Footer() {
  const { t, locale } = useTranslation()
  const routes = getRoutes(locale)
  const { onClick: track } = useTracking()

  return (
    <footer className="border-line border-t">
      <div className="container">
        <div className="border-line flex items-center justify-between gap-4 border-b pb-10 max-lg:flex-col max-lg:pb-7 max-md:pb-5">
          <div className="max-w-[400px] max-lg:flex max-lg:w-full max-lg:max-w-full max-lg:flex-col max-lg:items-center">
            <Img src={kimtvLogo} alt="KimTV" width={130} height={48} objectFit="contain" priority />

            <Typography
              variant="body-sm"
              weight="300"
              className="mt-7 leading-100 text-white max-lg:mt-6 max-md:mt-4 max-md:text-center"
            >
              {t("footer.desc")}
            </Typography>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-9 max-lg:gap-6 max-md:gap-3">
            {FOOTER_MENUS.map((menu: FooterMenuInterface) => (
              <Link
                key={menu.key}
                href={menu.getHref(routes)}
                className="footer-menu-link"
                onClick={() =>
                  track({
                    ...payloadFooterLinkClicked,
                    [TrackingPayloadKeyEnum.MENU_LABEL]: menu.key,
                    [TrackingPayloadKeyEnum.TARGET_LINK]: menu.getHref(routes),
                  })
                }
              >
                <Typography
                  variant="label"
                  className="hover:text-gold text-white uppercase transition-colors"
                >
                  {t(`footer.menu.${menu.key}` as Parameters<typeof t>[0])}
                </Typography>
              </Link>
            ))}
          </nav>
        </div>

        <Typography
          variant="body-sm"
          weight="300"
          className="pt-8 text-center text-white max-lg:pt-6 max-md:pt-4"
        >
          {t("footer.copyright")}
        </Typography>
      </div>
    </footer>
  )
}

import { notFound } from "next/navigation"

import { createMetadata } from "@/lib/metadata"

import { LOCALES, type LocaleType } from "@/i18n"

import { ClientWidgets } from "@/components/layout/client-widgets"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return createMetadata({
    title: {
      default: "KimTV — Bóng đá trực tiếp & tỉ số online",
      template: "%s | KimTV",
    },
    description:
      "KimTV — xem bóng đá trực tiếp, tỉ số online, lịch thi đấu, tin tức và highlight thể thao mới nhất.",
    alternates: { canonical: `/${lang}` },
    openGraph: { url: `/${lang}` },
  })
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!LOCALES.includes(lang as LocaleType)) notFound()

  return (
    <>
      <Header />
      <main className="flex-1 max-lg:pb-[72px] max-md:h-full">{children}</main>
      <div className="max-md:hidden">
        <Footer />
      </div>
      <MobileBottomNav />
      <ClientWidgets />
    </>
  )
}

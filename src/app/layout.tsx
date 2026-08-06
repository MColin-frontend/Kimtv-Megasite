import { Inter, Oswald } from "next/font/google"
import Image from "next/image"

import { createMetadata } from "@/lib/metadata"

import { MouseGlowProvider } from "@/components/providers/mouse-glow-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

import bgStadium from "@assets/images/common/img-stadium-bg.webp"

import "./globals.css"

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "fallback",
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "fallback",
})

export const metadata = createMetadata({
  title: {
    default: "KimTV — Bóng đá trực tiếp & tỉ số online",
    template: "%s | KimTV",
  },
  description:
    "KimTV — xem bóng đá trực tiếp, tỉ số online, lịch thi đấu, tin tức và highlight thể thao mới nhất.",
  alternates: { canonical: "/" },
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${oswald.variable} ${inter.variable} h-full antialiased`}>
      <head>
        {/* Preconnect to external origins hit early in page load */}
        <link rel="preconnect" href="https://kimtv-oss.99kimtvs.top" />
        <link rel="dns-prefetch" href="https://kimtv-oss.99kimtvs.top" />
        <link rel="preconnect" href="https://identity.99kim.llc" />
        <link rel="dns-prefetch" href="https://identity.99kim.llc" />
      </head>
      <body className="flex min-h-full flex-col">
        <div className="fixed inset-0 -z-10">
          <Image
            src={bgStadium}
            alt=""
            fill
            priority
            quality={20}
            className="object-cover object-top"
            sizes="100vw"
          />
          <div className="bg-background/85 absolute inset-0" />
        </div>
        <QueryProvider>
          <MouseGlowProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </MouseGlowProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

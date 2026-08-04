import { Inter, Oswald } from "next/font/google"
import Image from "next/image"

import { createMetadata } from "@/lib/metadata"

import { MouseGlowProvider } from "@/components/providers/mouse-glow-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

import bgStadium from "@assets/images/common/img-stadium-bg.png"

import "./globals.css"

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "vietnamese"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
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
      {/*
        Preload Oswald Latin Extended (U+100-2BA, U+1E00+) — the Vietnamese-range font file.
        next/font preloads only the .p. (basic latin) variant; this file is discovered late
        when the browser parses the font CSS and finds characters needing this range.
        Hash is content-based (changes only if Google Fonts updates Oswald).
      */}
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/_next/static/media/037b6aa687f94b32-s.0evsli58wo2lo.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <div className="fixed inset-0 -z-10">
          <Image
            src={bgStadium}
            alt=""
            fill
            priority
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

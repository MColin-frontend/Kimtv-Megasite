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
  subsets: ["vietnamese", "latin"],
  weight: ["700", "600", "500", "400"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "optional",
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

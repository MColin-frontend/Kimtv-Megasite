"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

import { cn } from "@/lib/utils"

interface BackToTopProps {
  /** px từ top để hiện button, default 400 */
  threshold?: number
  className?: string
}

export function BackToTop({ threshold = 400, className }: BackToTopProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Lên đầu trang"
      className={cn(
        "fixed right-5 bottom-20 z-50 max-sm:right-3 max-sm:bottom-16",
        "flex size-12 items-center justify-center rounded-full max-sm:size-8",
        "border text-white backdrop-blur-xl",
        "border-[rgba(245,197,24,0.5)] bg-[rgba(245,197,24,0.75)]",
        "shadow-[0_4px_20px_rgba(245,197,24,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]",
        "transition-all duration-300 hover:scale-110 hover:bg-[rgba(245,197,24,0.9)] hover:shadow-[0_0_32px_10px_rgba(245,197,24,0.45)] active:scale-95",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
        className
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  )
}

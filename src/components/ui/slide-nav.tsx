"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { CAROUSEL_ROUND_NAV_BUTTON_CLASS } from "@/constants/ui/ui-carousel.constants"

interface SlideNavBtnProps {
  onClick: () => void
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

/** Nút prev/next đặt overlay trên ảnh (nền tối, icon trắng). */
const DARK =
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black/25 backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 hover:bg-black/55 disabled:pointer-events-none disabled:opacity-40"

export type SlideNavVariant = "dark" | "gold"

function SlideNavPrev({
  onClick,
  disabled,
  className,
  variant = "dark",
  "aria-label": ariaLabel = "Previous",
}: SlideNavBtnProps & { variant?: SlideNavVariant }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(variant === "gold" ? CAROUSEL_ROUND_NAV_BUTTON_CLASS : DARK, className)}
    >
      {variant === "gold" ? (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-none stroke-current stroke-2 max-sm:h-3.5 max-sm:w-3.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      ) : (
        <ChevronLeft className="size-4 text-white sm:size-5" aria-hidden="true" />
      )}
    </button>
  )
}

function SlideNavNext({
  onClick,
  disabled,
  className,
  variant = "dark",
  "aria-label": ariaLabel = "Next",
}: SlideNavBtnProps & { variant?: SlideNavVariant }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(variant === "gold" ? CAROUSEL_ROUND_NAV_BUTTON_CLASS : DARK, className)}
    >
      {variant === "gold" ? (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-none stroke-current stroke-2 max-sm:h-3.5 max-sm:w-3.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      ) : (
        <ChevronRight className="size-4 text-white sm:size-5" aria-hidden="true" />
      )}
    </button>
  )
}

/**
 * Cặp nút prev/next overlay — đặt absolute trong container `relative`.
 *
 * @example — dark (trên ảnh)
 * <SlideNavButtons onPrev={goPrev} onNext={goNext} />
 *
 * @example — vị trí custom
 * <SlideNavButtons
 *   onPrev={goPrev} onNext={goNext}
 *   prevClassName="left-2 top-1/2 -translate-y-1/2"
 *   nextClassName="right-2 top-1/2 -translate-y-1/2"
 * />
 */
function SlideNavButtons({
  onPrev,
  onNext,
  variant = "dark",
  prevClassName,
  nextClassName,
}: {
  onPrev: () => void
  onNext: () => void
  variant?: SlideNavVariant
  prevClassName?: string
  nextClassName?: string
}) {
  return (
    <>
      <SlideNavPrev
        onClick={onPrev}
        variant={variant}
        className={cn("absolute top-1/2 left-3 z-20 -translate-y-1/2", prevClassName)}
      />
      <SlideNavNext
        onClick={onNext}
        variant={variant}
        className={cn("absolute top-1/2 right-3 z-20 -translate-y-1/2", nextClassName)}
      />
    </>
  )
}

export { SlideNavPrev, SlideNavNext, SlideNavButtons }

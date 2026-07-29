"use client"

import { ReactSVG } from "react-svg"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

import { useTranslation } from "@/i18n"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import icSend from "@assets/icons/common/ic-send.svg"

export interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  size?: "sm" | "default"
  autoFocus?: boolean
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled = false,
  loading = false,
  className,
  size = "default",
  autoFocus,
}: MessageInputProps) {
  const { t } = useTranslation()
  const { isLoggedIn, login } = useAuth()

  const resolvedPlaceholder = placeholder ?? t("chat.placeholder")
  const isActive = value.trim() !== "" && !disabled

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoggedIn) {
      login()
      return
    }
    onSubmit()
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <Input
        value={value}
        onChange={(e) => onChange(e?.target?.value)}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        autoFocus={autoFocus}
        wrapperClassName={cn(
          "group h-fit rounded-full bg-input-surface backdrop-blur-sm pr-2",
          className
        )}
        rightIcon={
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={isLoggedIn && (!isActive || loading)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full p-1 transition-all duration-200",
              "bg-white/15 shadow-none",
              "group-focus-within:!bg-white/35 group-focus-within:shadow-[0_0_14px_rgba(255,255,255,0.2)]!",
              "hover:!bg-white/35 hover:shadow-[0_0_14px_rgba(255,255,255,0.2)]",
              size === "sm" ? "size-7" : "size-10"
            )}
            aria-label={t("chat.placeholder")}
          >
            <ReactSVG
              src={typeof icSend === "string" ? icSend : (icSend as { src: string }).src}
              className={cn(
                "group-focus-within:text-gold group-hover:text-gold text-white/30 transition-colors duration-200 [&>div]:flex [&>div]:size-full [&>div]:items-center [&>div]:justify-center",
                size === "sm"
                  ? "size-3.5 [&_svg]:h-3.5! [&_svg]:w-3.5!"
                  : "size-5 [&_svg]:h-5! [&_svg]:w-5!"
              )}
            />
          </Button>
        }
      />
    </form>
  )
}

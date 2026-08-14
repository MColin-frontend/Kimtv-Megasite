"use client"

import React from "react"
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
  leftIcons?: React.ReactNode
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
  leftIcons,
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
        leftIcon={leftIcons}
        rightIcon={
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={isLoggedIn && (!isActive || loading)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full p-1 transition-all duration-200",
              isActive
                ? "bg-primary shadow-[0_0_14px_rgba(var(--color-primary-rgb,99,102,241),0.4)]"
                : "bg-white/10 shadow-none hover:bg-white/20",
              size === "sm" ? "size-7" : "size-10"
            )}
            aria-label={t("chat.placeholder")}
          >
            <ReactSVG
              src={typeof icSend === "string" ? icSend : (icSend as { src: string }).src}
              className={cn(
                "transition-colors duration-200 [&>div]:flex [&>div]:size-full [&>div]:items-center [&>div]:justify-center",
                isActive ? "text-white" : "text-white/40",
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

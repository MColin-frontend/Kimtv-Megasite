import type { InputHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

type InputVariant = "default" | "ghost"
type InputSize = "sm" | "default" | "lg"

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  variant?: InputVariant
  inputSize?: InputSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  prefix?: ReactNode
  suffix?: ReactNode
  wrapperClassName?: string
}

const borderStyles: Record<InputVariant, string> = {
  default: "border border-white/8 bg-white/[0.03] transition-colors hover:border-white/15 focus-within:border-white/25",
  ghost: "border-transparent bg-transparent",
}

const sizes: Record<InputSize, string> = {
  sm: "h-8 rounded-8 px-2.5 gap-2 text-12",
  default: "h-9 rounded-8 px-4 gap-2.5 text-14",
  lg: "h-11 rounded-12 px-3.5 gap-3 text-14",
}

const iconSizes: Record<InputSize, string> = {
  sm: "size-3.5",
  default: "size-4",
  lg: "size-4",
}

const affixSizes: Record<InputSize, string> = {
  sm: "px-2 text-12",
  default: "px-2.5 text-12",
  lg: "px-3 text-14",
}

export function Input({
  variant = "default",
  inputSize = "default",
  leftIcon,
  rightIcon,
  prefix,
  suffix,
  className,
  wrapperClassName,
  ...props
}: InputProps) {
  return (
    <div
      className={cn(
        "group flex w-full items-center",
        sizes[inputSize],
        borderStyles[variant],
        wrapperClassName
      )}
    >
      {prefix && (
        <>
          <span
            className={cn(
              "text-muted shrink-0 transition-colors duration-200 group-focus-within:text-gold/70",
              affixSizes[inputSize],
              "-ml-px flex items-center self-stretch"
            )}
          >
            {prefix}
          </span>
          <span className="bg-input-border group-focus-within:bg-gold/20 h-4 w-px shrink-0 transition-colors duration-200" />
        </>
      )}

      {leftIcon && (
        <span
          className={cn(
            "text-muted shrink-0 transition-colors duration-200 group-focus-within:text-gold/70 group-hover:text-white/70",
            iconSizes[inputSize]
          )}
        >
          {leftIcon}
        </span>
      )}

      <input
        className={cn(
          "min-w-0 flex-1 bg-transparent text-white outline-none",
          "placeholder:text-placeholder placeholder:text-14 placeholder:font-500 placeholder:leading-150 placeholder:italic",
          "transition-colors duration-200",
          className
        )}
        {...props}
      />

      {rightIcon && <span className="shrink-0">{rightIcon}</span>}

      {suffix && (
        <>
          <span className="bg-input-border group-focus-within:bg-gold/20 h-4 w-px shrink-0 transition-colors duration-200" />
          <span
            className={cn(
              "text-muted shrink-0 transition-colors duration-200 group-focus-within:text-gold/70",
              affixSizes[inputSize],
              "-mr-px flex items-center self-stretch"
            )}
          >
            {suffix}
          </span>
        </>
      )}
    </div>
  )
}

/* ── InputDisplay — read-only label/value row ─────────────── */

interface InputDisplayProps {
  label: ReactNode
  value: ReactNode
  className?: string
}

export function InputDisplay({ label, value, className }: InputDisplayProps) {
  return (
    <div
      className={cn(
        "rounded-8 flex items-center justify-between border border-white/6 bg-white/[0.02] px-4 py-2.5",
        className
      )}
    >
      <span className="text-14 font-400 leading-150 text-white/60">{label}</span>
      <span className="text-14 font-600 leading-150 text-white">{value}</span>
    </div>
  )
}

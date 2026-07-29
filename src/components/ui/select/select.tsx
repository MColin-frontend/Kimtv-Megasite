"use client"

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, ChevronDown, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { Empty } from "@/components/ui/empty"

/* ── Trigger variants ─────────────────────────────────────── */
const triggerVariants = cva(
  [
    "group/trigger inline-flex min-w-36 items-center justify-between",
    "rounded-8 font-500 leading-100",
    "cursor-pointer select-none outline-none transition-all duration-150",
    "focus-visible:ring-2 focus-visible:ring-primary/30",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border border-primary/20 bg-primary text-white hover:bg-primary/85 data-[popup-open]:bg-primary/85",
        outline:
          "border border-foreground/30 bg-transparent text-foreground hover:border-foreground/55 data-[popup-open]:border-foreground/55",
        "outline-dark":
          "border border-white/25 bg-transparent text-white hover:border-white/50 data-[popup-open]:border-white/50",
        ghost: "border-0 text-foreground hover:bg-foreground/6 data-[popup-open]:bg-foreground/6",
        navy: "border border-white/10 bg-navy text-white hover:bg-navy/80 data-[popup-open]:bg-navy/80",
        gold: "border-0 bg-gradient-to-r from-[#FFF200] to-[#AB7200] text-black hover:opacity-90",
        dark: "border border-white/20 bg-white/8 text-white backdrop-blur-sm hover:border-white/35 hover:bg-white/12 data-[popup-open]:ring-2 data-[popup-open]:ring-white/15",
        glass:
          "border-0 bg-white/6 text-white/85 backdrop-blur-3xl hover:bg-white/10 hover:text-white data-[popup-open]:bg-white/10",
      },
      size: {
        sm: "h-9  gap-2.5 px-3.5 text-13",
        default: "h-9 gap-3 px-4 text-14",
        lg: "h-12 gap-3   px-5   text-16",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
)

/* ── Types ────────────────────────────────────────────────── */
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ReactNode
  badge?: React.ReactNode
  accent?: "live" | "neutral"
}

/** Handle để control Select từ bên ngoài qua ref */
export interface SelectHandle {
  /** Mở dropdown */
  open: () => void
  /** Đóng dropdown */
  close: () => void
  /** Lấy giá trị đang được chọn */
  getValue: () => string | undefined
}

export interface SelectProps extends VariantProps<typeof triggerVariants> {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string | null) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  fullWidth?: boolean
  isActive?: boolean
  clearable?: boolean
  className?: string
  triggerClassName?: string
  popupClassName?: string
  /** Option luôn hiện đầu tiên, filter duplicate nếu đã có trong options */
  defaultOption?: SelectOption
}

/* ── Component ────────────────────────────────────────────── */
export const Select = forwardRef<SelectHandle, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    placeholder = "Chọn...",
    label,
    disabled,
    variant,
    size,
    fullWidth,
    isActive,
    clearable,
    className,
    triggerClassName,
    popupClassName,
    defaultOption,
  },
  ref
) {
  const [open, setOpen] = useState(false)
  const valueRef = useRef<string | undefined>(value ?? defaultValue)

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
    getValue: () => valueRef.current,
  }))

  const handleValueChange = useCallback(
    (v: string | null) => {
      valueRef.current = v ?? undefined
      onValueChange?.(v)
    },
    [onValueChange]
  )

  const resolvedOptions = (
    defaultOption
      ? [defaultOption, ...options.filter((o) => o.value !== defaultOption.value)]
      : options
  ).filter((o) => !(o.value === "" && o.label === ""))
  const items = resolvedOptions.map((o) => ({ value: o.value, label: o.label }))
  const selectedOpt = resolvedOptions.find((o) => o.value === value)
  const isLiveActive = selectedOpt?.accent === "live"
  const isGoldActive = isActive && !isLiveActive

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full", className)}>
      {label && (
        <span className="text-11 font-600 tracking-2 text-foreground/45 uppercase">{label}</span>
      )}

      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        open={open}
        onOpenChange={setOpen}
        onValueChange={handleValueChange}
        disabled={disabled}
        items={items}
      >
        {/* ── Trigger ── */}
        <SelectPrimitive.Trigger
          className={cn(
            triggerVariants({ variant, size }),
            fullWidth && "w-full",
            isGoldActive &&
              "border-gold/80 bg-gold/20 text-gold font-600 hover:border-gold hover:bg-gold/28 data-[popup-open]:ring-gold/30 data-[popup-open]:ring-2",
            isLiveActive &&
              "font-600 border-red-500/70 bg-red-500/20 text-red-400 hover:bg-red-500/28 data-[popup-open]:bg-red-500/28 data-[popup-open]:ring-2 data-[popup-open]:ring-red-500/30",
            triggerClassName
          )}
        >
          {/* sr-only for a11y; visual display is below */}
          <span className="sr-only">
            <SelectPrimitive.Value placeholder={placeholder} />
          </span>
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            {selectedOpt?.icon && (
              <span className="flex shrink-0 items-center">{selectedOpt.icon}</span>
            )}
            <span className="truncate">{selectedOpt?.label ?? placeholder}</span>
            {selectedOpt?.badge && <span className="ml-0.5">{selectedOpt.badge}</span>}
          </span>
          {clearable && value && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation()
                onValueChange?.(null)
              }}
              className="hover:bg-danger/20 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/30 transition-colors hover:text-white"
            >
              <X className="size-3.5" />
            </span>
          )}
          <SelectPrimitive.Icon>
            <ChevronDown
              className={cn(
                "size-3.5 transition-all duration-200 group-data-popup-open/trigger:-rotate-180",
                isGoldActive
                  ? "text-gold"
                  : isLiveActive
                    ? "text-red-400"
                    : "opacity-50 group-data-popup-open/trigger:opacity-100"
              )}
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        {/* ── Dropdown ── */}
        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner alignItemWithTrigger={false} sideOffset={5}>
            <SelectPrimitive.Popup
              className={cn(
                "z-[999] w-(--anchor-width) overflow-hidden",
                "rounded-8 popup-bg border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.55)]",
                "origin-(--transform-origin)",
                "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97] data-open:slide-in-from-top-0.5",
                "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.97]",
                "data-closed:duration-100 data-open:duration-150",
                popupClassName
              )}
            >
              <SelectPrimitive.List className="flex flex-col gap-1 p-1">
                {resolvedOptions.length === 0 && (
                  <Empty
                    imageSize={80}
                    tip="Không có kết quả"
                    className="[&_p]:text-12 py-6 [&_img]:opacity-100 [&_p]:text-white/30"
                  />
                )}
                {resolvedOptions.map((opt) => (
                  <SelectPrimitive.Item
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className={cn(
                      "group/item relative flex cursor-pointer items-center gap-2",
                      "rounded-6 px-3 py-2 outline-none select-none",
                      "text-14 font-400 leading-150",
                      "transition-colors duration-100",
                      opt.accent === "live"
                        ? opt.value === value
                          ? "font-600 bg-red-500/15 text-red-400"
                          : "text-red-400 hover:bg-red-500/10"
                        : opt.value === value
                          ? "bg-gold/15 font-600 text-gold"
                          : "text-white/50 hover:bg-white/8 hover:text-white",
                      "data-disabled:pointer-events-none data-disabled:opacity-30"
                    )}
                  >
                    {opt.icon && <span className="flex shrink-0 items-center">{opt.icon}</span>}
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                      {opt.badge && opt.badge}
                    </div>
                    <Check
                      className={cn(
                        "size-3.5 shrink-0",
                        opt.value === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.List>
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
})

"use client"

import { startTransition, useEffect, useMemo, useState } from "react"
import { Popover } from "@base-ui/react/popover"
import { useQuery } from "@tanstack/react-query"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, ChevronDown, Loader2, X } from "lucide-react"

import { javaGet, type ClientParams } from "@/server/services/client-request"
import { cn } from "@/lib/utils"

import { Empty } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import type { SelectOption } from "./select"

/* ── Trigger variants (mirrors select.tsx) ────────────────── */
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
          "border border-foreground/30 bg-transparent text-foreground hover:border-foreground/55",
        "outline-dark": "border border-white/25 bg-transparent text-white hover:border-white/50",
        ghost: "border-0 text-foreground hover:bg-foreground/6",
        navy: "border border-white/10 bg-navy text-white hover:bg-navy/80",
        gold: "border-0 bg-gradient-to-r from-[#FFF200] to-[#AB7200] text-black hover:opacity-90",
        dark: "border border-white/20 bg-white/8 text-white backdrop-blur-sm hover:border-white/35 hover:bg-white/12 data-[popup-open]:ring-2 data-[popup-open]:ring-white/15",
        glass:
          "border-0 bg-white/6 text-white/85 backdrop-blur-3xl hover:bg-white/10 hover:text-white",
      },
      size: {
        sm: "h-9 gap-2.5 px-3.5 text-13",
        default: "h-9 gap-3 px-4 text-14",
        lg: "h-12 gap-3 px-5 text-16",
      },
    },
    defaultVariants: {
      variant: "dark",
      size: "default",
    },
  }
)

/* ── Types ────────────────────────────────────────────────── */
export interface SelectAsyncProps extends VariantProps<typeof triggerVariants> {
  /** Java backend path, vd. `/match/game-living-future` */
  endpoint: string
  /** Params tĩnh merge vào mỗi request, vd. `{ gameId: "202" }` */
  endpointParams?: ClientParams
  /** Convert raw API response → SelectOption[] */
  transformData?: (raw: unknown) => SelectOption[]
  /**
   * Dependency ID — chỉ call API khi có giá trị.
   * Khi thay đổi, fetch lại và reset selection.
   */
  trigger?: string | number | null
  value?: string
  defaultValue?: string
  onValueChange?: (value: string, option: SelectOption) => void
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  label?: string
  fullWidth?: boolean
  className?: string
  triggerClassName?: string
  popupClassName?: string
  /** Truyền vào để hiển thị label ngay khi value đã biết trước khi list load */
  initialOption?: SelectOption
  /** Option mặc định luôn hiện đầu tiên, filter duplicate nếu xuất hiện trong fetched list */
  defaultOption?: SelectOption
}

/* ── Component ────────────────────────────────────────────── */
export function SelectAsync({
  endpoint,
  endpointParams,
  transformData,
  trigger,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder = "Chọn...",
  clearable,
  disabled,
  label,
  variant,
  size,
  fullWidth,
  className,
  triggerClassName,
  popupClassName,
  initialOption,
  defaultOption,
}: SelectAsyncProps) {
  const [open, setOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<SelectOption | undefined>(initialOption)

  const value = valueProp ?? selectedOption?.value ?? defaultValue

  const hasTrigger = trigger !== undefined
  const triggerReady = !hasTrigger || (trigger !== null && trigger !== "")

  /* ── Reset selection khi trigger thay đổi ────────────────── */
  useEffect(() => {
    if (hasTrigger) startTransition(() => setSelectedOption(undefined))
  }, [trigger]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Query ────────────────────────────────────────────────── */
  const { data, isFetching } = useQuery({
    queryKey: [endpoint, endpointParams, trigger],
    queryFn: async () => {
      const raw = await javaGet(endpoint, { params: endpointParams })
      return (transformData ?? ((r) => r as SelectOption[]))(raw)
    },
    enabled: open && triggerReady,
    staleTime: Infinity,
  })

  const options = useMemo(() => {
    const fetched = (data ?? []).filter((o) => !(o.value === "" && o.label === ""))
    if (!defaultOption) return fetched
    const deduped = fetched.filter((o) => o.value !== defaultOption.value)
    return [defaultOption, ...deduped]
  }, [data, defaultOption])

  /* ── Sync selectedOption khi value thay đổi từ ngoài ─────── */
  useEffect(() => {
    if (!valueProp) return
    const found = options.find((o) => o.value === valueProp)
    if (found) startTransition(() => setSelectedOption(found))
  }, [valueProp, options])

  /* ── Select handler ───────────────────────────────────────── */
  const handleSelect = (opt: SelectOption) => {
    setSelectedOption(opt)
    onValueChange?.(opt.value, opt)
    setOpen(false)
  }

  const displayLabel = selectedOption?.label ?? (value ? String(value) : undefined)

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full", className)}>
      {label && (
        <span className="text-11 font-600 tracking-2 text-foreground/45 uppercase">{label}</span>
      )}

      <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
        {/* ── Trigger ── */}
        <Popover.Trigger
          disabled={disabled}
          className={cn(
            triggerVariants({ variant, size }),
            fullWidth && "w-full",
            triggerClassName
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className={cn("truncate", !displayLabel && "text-white/40")}>
              {displayLabel ?? placeholder}
            </span>
          </span>
          {clearable && selectedOption && !disabled ? (
            <span
              role="button"
              aria-label="Xoá"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedOption(undefined)
                onValueChange?.("", { value: "", label: "" })
              }}
              className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-3" />
            </span>
          ) : isFetching ? (
            <Loader2 className="size-3.5 animate-spin opacity-40" />
          ) : (
            <ChevronDown className="size-3.5 opacity-50 transition-all duration-200 group-data-[popup-open]/trigger:-rotate-180 group-data-[popup-open]/trigger:opacity-100" />
          )}
        </Popover.Trigger>

        {/* ── Dropdown ── */}
        <Popover.Portal>
          <Popover.Positioner side="bottom" align="start" sideOffset={5}>
            <Popover.Popup
              className={cn(
                "z-[999] w-(--anchor-width) min-w-56 overflow-hidden",
                "rounded-8 popup-bg border border-white/10",
                "shadow-[0_16px_48px_rgba(0,0,0,0.55)]",
                "origin-(--transform-origin)",
                "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97] data-open:slide-in-from-top-0.5",
                "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.97]",
                "data-closed:duration-100 data-open:duration-150",
                popupClassName
              )}
            >
              {isFetching ? (
                <div className="flex flex-col gap-1 px-2 py-2.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="rounded-6 h-7"
                      style={{ width: `${65 + ((i * 17) % 35)}%` }}
                    />
                  ))}
                </div>
              ) : options.length === 0 ? (
                <Empty
                  imageSize={80}
                  tip="Không có kết quả"
                  className="[&_p]:text-12 py-6 [&_img]:opacity-100 [&_p]:text-white/30"
                />
              ) : (
                <div
                  className="flex flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-2.5"
                  style={{
                    maxHeight: 280,
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255,255,255,0.08) transparent",
                  }}
                >
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-1",
                        "rounded-6 px-3 py-2 text-left outline-none select-none",
                        "text-14 font-400 leading-150 transition-colors duration-100",
                        opt.value === value
                          ? "bg-gold/15 font-600 text-gold"
                          : "text-white/50 hover:bg-white/8 hover:text-white",
                        opt.disabled && "pointer-events-none opacity-30"
                      )}
                    >
                      {opt.icon && <span className="flex shrink-0 items-center">{opt.icon}</span>}
                      <span className="flex min-w-0 flex-1 items-center gap-1">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge}
                      </span>
                      <Check
                        className={cn(
                          "text-gold size-3 shrink-0 transition-opacity",
                          opt.value === value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </button>
                  ))}
                </div>
              )}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}

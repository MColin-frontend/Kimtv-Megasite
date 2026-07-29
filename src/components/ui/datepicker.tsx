"use client"

import { useCallback, useState } from "react"
import type { ReactNode } from "react"
import { Popover } from "@base-ui/react/popover"
import { cva, type VariantProps } from "class-variance-authority"
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { Typography } from "@/components/ui/typography"

/* ─── Types ──────────────────────────────────────────────────── */
export interface DateRange {
  from: Date | null
  to: Date | null
}

/* ─── Helpers ────────────────────────────────────────────────── */
const VI_MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
]
const VI_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

/** Strip time component so all comparisons are date-only */
function ld(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function same(a: Date | null | undefined, b: Date | null | undefined) {
  return !!a && !!b && a.toDateString() === b.toDateString()
}

function fmt(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}/${d.getFullYear()}`
}

function daysIn(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate()
}

/** Monday-first offset (Mon=0 … Sun=6) */
function monthOffset(y: number, m: number) {
  return (new Date(y, m, 1).getDay() + 6) % 7
}

/* ─── Trigger variants ───────────────────────────────────────── */
const triggerVariants = cva(
  [
    "group/trigger inline-flex items-center justify-between",
    "rounded-8 border font-500 leading-100",
    "cursor-pointer select-none outline-none transition-all duration-150",
    "focus-visible:ring-2 focus-visible:ring-primary/30",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary text-white hover:bg-primary/85 data-[popup-open]:bg-primary/85",
        outline:
          "border-foreground/30 bg-transparent text-foreground hover:border-foreground/55 data-[popup-open]:border-foreground/55",
        "outline-dark":
          "border-white/25 bg-transparent text-white hover:border-white/50 data-[popup-open]:border-white/50",
        ghost:
          "border-transparent text-foreground hover:bg-foreground/6 data-[popup-open]:bg-foreground/6",
        navy: "border-white/10 bg-navy text-white hover:bg-navy/80 data-[popup-open]:bg-navy/80",
        gold: "border-transparent bg-gradient-to-r from-[#FFF200] to-[#AB7200] text-black hover:opacity-90",
        dark: "border-white/8 bg-white/[0.03] text-white transition-colors hover:border-white/15 data-[popup-open]:border-white/25",
      },
      size: {
        sm: "h-9! gap-2.5 px-3.5 text-13",
        default: "h-9! gap-3 px-4 text-14",
        input: "h-11! gap-2.5 px-4 text-14",
        lg: "h-12! gap-3 px-5 text-16",
      },
    },
    defaultVariants: { variant: "dark", size: "default" },
  }
)

/* ─── Internal: calendar grid ────────────────────────────────── */
interface CalendarGridProps {
  year: number
  month: number
  /** Single-date mode */
  selected?: Date | null
  /** Range mode */
  range?: DateRange
  hovered?: Date | null
  selecting?: boolean
  onDay: (d: Date) => void
  onHover?: (d: Date | null) => void
  onPrev: () => void
  onNext: () => void
  hidePrev?: boolean
  hideNext?: boolean
  maxDate?: Date | null
  minDate?: Date | null
}

function CalendarGrid({
  year,
  month,
  selected,
  range,
  hovered,
  selecting,
  onDay,
  onHover,
  onPrev,
  onNext,
  hidePrev,
  hideNext,
  maxDate,
  minDate,
}: CalendarGridProps) {
  const total = daysIn(year, month)
  const offset = monthOffset(year, month)
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prevDays = daysIn(prevYear, prevMonth)
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year

  const cells: Date[] = [
    ...Array.from(
      { length: offset },
      (_, i) => new Date(prevYear, prevMonth, prevDays - offset + i + 1)
    ),
    ...Array.from({ length: total }, (_, i) => new Date(year, month, i + 1)),
  ]
  let nextDay = 1
  while (cells.length % 7 !== 0) cells.push(new Date(nextYear, nextMonth, nextDay++))

  const today = ld(new Date())

  // Effective range including hover preview while user is selecting
  let effFrom = range?.from ? ld(range.from) : null
  let effTo = range?.to ? ld(range.to) : null
  if (selecting && effFrom && hovered) {
    const h = ld(hovered)
    if (h >= effFrom) {
      effTo = h
    } else {
      effTo = effFrom
      effFrom = h
    }
  }
  const singlePoint = same(effFrom, effTo)

  return (
    <div className="w-64 flex-none p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className={cn(
            "rounded-6 text-muted flex size-7 items-center justify-center transition-colors hover:bg-white/10 hover:text-white",
            hidePrev && "invisible"
          )}
        >
          <ChevronLeft className="size-4" />
        </button>
        <Typography as="span" variant="label" weight="600" className="text-white">
          {VI_MONTHS[month]} {year}
        </Typography>
        <button
          type="button"
          onClick={onNext}
          className={cn(
            "rounded-6 text-muted flex size-7 items-center justify-center transition-colors hover:bg-white/10 hover:text-white",
            hideNext && "invisible"
          )}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="mb-1 grid grid-cols-7">
        {VI_DAYS.map((d) => (
          <div
            key={d}
            className="font-600 text-muted flex h-7 items-center justify-center text-[10px] tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          const isOtherMonth = date.getMonth() !== month

          // Single mode
          const isSel = !!selected && same(date, selected)

          // Range mode — half-backgrounds form a continuous band between endpoints
          const isFrom = !!effFrom && same(date, effFrom)
          const isTo = !!effTo && same(date, effTo)
          const inRange = !singlePoint && !!effFrom && !!effTo && date > effFrom && date < effTo
          const showLeft = (isTo && !singlePoint) || inRange
          const showRight = (isFrom && !singlePoint) || inRange

          const isEndpoint = isSel || isFrom || isTo
          const isToday = same(date, today)

          const isDisabled =
            (!!maxDate && ld(date) > ld(maxDate)) ||
            (!!minDate && ld(date) < ld(minDate))

          const handleClick = () => {
            if (isDisabled) return
            if (isOtherMonth) {
              if (date < new Date(year, month, 1)) onPrev()
              else onNext()
            }
            onDay(date)
          }

          return (
            <div
              key={`${date.toISOString()}-${i}`}
              className="relative flex h-8 items-center justify-center"
            >
              {showLeft && <div className="bg-blue/15 absolute inset-y-1 right-1/2 left-0" />}
              {showRight && <div className="bg-blue/15 absolute inset-y-1 right-0 left-1/2" />}
              <button
                type="button"
                disabled={isDisabled}
                onClick={handleClick}
                onMouseEnter={() => onHover?.(date)}
                onMouseLeave={() => onHover?.(null)}
                className={cn(
                  "text-12 font-500 relative z-10 flex size-8 items-center justify-center rounded-full transition-colors",
                  isDisabled
                    ? "cursor-not-allowed text-white/20"
                    : isOtherMonth
                      ? "text-muted hover:text-muted hover:bg-white/10"
                      : isEndpoint
                        ? "bg-blue font-600 text-white"
                        : inRange
                          ? "text-white hover:bg-white/10"
                          : isToday
                            ? "font-700 text-gold hover:bg-white/10"
                            : "text-muted hover:bg-white/10 hover:text-white"
                )}
              >
                {date.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Internal: popup shell ──────────────────────────────────── */
function PickerPopup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Popover.Popup
      className={cn(
        "rounded-10 z-[999] overflow-hidden",
        "popup-bg border border-white/10",
        "shadow-[0_16px_48px_rgba(0,0,0,0.55)]",
        "origin-(--transform-origin)",
        "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97]",
        "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.97]",
        "data-closed:duration-100 data-open:duration-150",
        className
      )}
    >
      {children}
    </Popover.Popup>
  )
}

/* ─── Internal: footer ───────────────────────────────────────── */
function PickerFooter({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between border-t border-white/8 px-4 py-2.5">
      <Typography as="span" variant="caption" weight="600" className="text-white">
        {label}
      </Typography>
      <button
        type="button"
        onClick={onClear}
        className="text-12 font-500 text-muted transition-colors hover:text-white/90"
      >
        Xoá
      </button>
    </div>
  )
}

/* ─── DatePicker ─────────────────────────────────────────────── */
export interface DatePickerProps extends VariantProps<typeof triggerVariants> {
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  maxDate?: Date | null
  minDate?: Date | null
  className?: string
  triggerClassName?: string
  popupClassName?: string
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Chọn ngày",
  label,
  disabled,
  maxDate,
  minDate,
  variant = "dark",
  size,
  className,
  triggerClassName,
  popupClassName,
}: DatePickerProps) {
  const [internal, setInternal] = useState<Date | null>(() =>
    defaultValue ? ld(defaultValue) : null
  )
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(() => (defaultValue ?? new Date()).getFullYear())
  const [viewMonth, setViewMonth] = useState(() => (defaultValue ?? new Date()).getMonth())

  const selected = value !== undefined ? value : internal

  const update = useCallback(
    (d: Date | null) => {
      if (value === undefined) setInternal(d)
      onChange?.(d)
    },
    [value, onChange]
  )

  const handleDay = useCallback(
    (d: Date) => {
      update(ld(d))
      setOpen(false)
    },
    [update]
  )

  const handlePrev = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else setViewMonth((m) => m - 1)
  }, [viewMonth])

  const handleNext = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else setViewMonth((m) => m + 1)
  }, [viewMonth])

  const popover = (
    <Popover.Root open={open} onOpenChange={(v) => setOpen(v)}>
      <Popover.Trigger
        disabled={disabled}
        className={cn(triggerVariants({ variant, size }), triggerClassName)}
      >
        <span className={cn("flex-1 text-left", !selected && "text-white/40")}>
          {selected ? fmt(selected) : placeholder}
        </span>
        {selected ? (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation()
              update(null)
            }}
            className="flex size-3.5 items-center justify-center rounded-full opacity-50 hover:opacity-100"
          >
            <X className="size-3.5" />
          </span>
        ) : (
          <CalendarDays className="size-3.5 opacity-50" />
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={5}>
          <PickerPopup className={popupClassName}>
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selected={selected}
              onDay={handleDay}
              onPrev={handlePrev}
              onNext={handleNext}
              maxDate={maxDate}
              minDate={minDate}
            />
            {selected && <PickerFooter label={fmt(selected)} onClear={() => update(null)} />}
          </PickerPopup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )

  if (!label) return <div className={className}>{popover}</div>

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-11 font-600 tracking-2 text-foreground/45 uppercase">{label}</span>
      {popover}
    </div>
  )
}

/* ─── DateRangePicker ────────────────────────────────────────── */
export interface DateRangePickerProps extends VariantProps<typeof triggerVariants> {
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (range: DateRange) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  /** Show 1 or 2 calendar months side-by-side (default 2) */
  numberOfMonths?: 1 | 2
  className?: string
  triggerClassName?: string
  popupClassName?: string
}

export function DateRangePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Chọn khoảng ngày",
  label,
  disabled,
  variant = "dark",
  size,
  numberOfMonths = 2,
  className,
  triggerClassName,
  popupClassName,
}: DateRangePickerProps) {
  const [internal, setInternal] = useState<DateRange>(
    () => defaultValue ?? { from: null, to: null }
  )
  const [hovered, setHovered] = useState<Date | null>(null)
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(() => (defaultValue?.from ?? new Date()).getFullYear())
  const [viewMonth, setViewMonth] = useState(() => (defaultValue?.from ?? new Date()).getMonth())

  const range = value ?? internal
  const selecting = !!(range.from && !range.to)

  const update = useCallback(
    (next: DateRange) => {
      if (!value) setInternal(next)
      onChange?.(next)
    },
    [value, onChange]
  )

  const handleDay = useCallback(
    (d: Date) => {
      const clicked = ld(d)
      const { from, to } = range

      if (!from || (from && to)) {
        update({ from: clicked, to: null })
      } else {
        const [a, b] = clicked >= from ? [from, clicked] : [clicked, from]
        update({ from: a, to: b })
        setOpen(false)
      }
    },
    [range, update]
  )

  const handlePrev = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else setViewMonth((m) => m - 1)
  }, [viewMonth])

  const handleNext = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else setViewMonth((m) => m + 1)
  }, [viewMonth])

  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear

  const triggerText = (() => {
    const { from, to } = range
    if (from && to) return `${fmt(from)} – ${fmt(to)}`
    if (from) return `${fmt(from)} – ...`
    return null
  })()

  const footerText = (() => {
    const { from, to } = range
    if (from && to) return `${fmt(from)} → ${fmt(to)}`
    if (from) return `Từ ${fmt(from)}...`
    return null
  })()

  const popover = (
    <Popover.Root open={open} onOpenChange={(v) => setOpen(v)}>
      <Popover.Trigger
        disabled={disabled}
        className={cn(triggerVariants({ variant, size }), triggerClassName)}
      >
        <span className={cn("flex-1 text-left", !triggerText && "opacity-50")}>
          {triggerText ?? placeholder}
        </span>
        <CalendarDays className="size-3.5 opacity-50" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={5}>
          <PickerPopup className={popupClassName}>
            <div className={cn("flex", numberOfMonths === 2 && "divide-x divide-white/8")}>
              <CalendarGrid
                year={viewYear}
                month={viewMonth}
                range={range}
                hovered={hovered}
                selecting={selecting}
                onDay={handleDay}
                onHover={setHovered}
                onPrev={handlePrev}
                onNext={handleNext}
                hideNext={numberOfMonths === 2}
              />
              {numberOfMonths === 2 && (
                <CalendarGrid
                  year={nextYear}
                  month={nextMonth}
                  range={range}
                  hovered={hovered}
                  selecting={selecting}
                  onDay={handleDay}
                  onHover={setHovered}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  hidePrev
                />
              )}
            </div>
            {footerText && (
              <PickerFooter label={footerText} onClear={() => update({ from: null, to: null })} />
            )}
          </PickerPopup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )

  if (!label) return <div className={className}>{popover}</div>

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-11 font-600 tracking-2 text-foreground/45 uppercase">{label}</span>
      {popover}
    </div>
  )
}

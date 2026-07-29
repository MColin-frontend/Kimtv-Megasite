"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { DEFAULT_PAGE_SIZE } from "@/constants/common.constants"

import { Typography } from "@/components/ui/typography"

/* ── Types ─────────────────────────────────────────────────── */
export interface PaginationProps {
  page: number
  pageSize?: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  showSizeChanger?: boolean
  className?: string
}

/* ── Helpers ────────────────────────────────────────────────── */
function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "…")[] = [1]

  if (current > 3) pages.push("…")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push("…")

  pages.push(total)

  return pages
}

/* ── Page button ────────────────────────────────────────────── */
function PageBtn({
  children,
  onClick,
  disabled,
  active,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded-8 text-13 font-500 max-sm:text-12 flex size-8 items-center justify-center transition-all duration-150 max-sm:size-7",
        "disabled:pointer-events-none",
        active
          ? "bg-blue text-gold font-600 shadow-[0_0_14px_rgba(245,197,24,0.25),0_2px_8px_rgba(67,97,253,0.55)]"
          : "text-foreground/45 enabled:hover:bg-blue/40 enabled:hover:text-gold disabled:opacity-25"
      )}
    >
      {children}
    </button>
  )
}

/* ── Pagination ─────────────────────────────────────────────── */
export function Pagination({
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pages = buildPageList(page, totalPages)

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center gap-2 max-sm:gap-1">
        {/* Prev arrows */}
        <div className="flex items-center gap-0.5">
          <PageBtn onClick={() => onPageChange(1)} disabled={page <= 1} title="Trang đầu">
            <ChevronsLeft className="size-3.5 max-sm:size-3" />
          </PageBtn>
          <PageBtn onClick={() => onPageChange(page - 1)} disabled={page <= 1} title="Trang trước">
            <ChevronLeft className="size-3.5 max-sm:size-3" />
          </PageBtn>
        </div>

        {/* Page number track */}
        <div className="rounded-8 bg-foreground/5 flex items-center gap-0.5 px-1 py-1">
          {pages.map((p, i) =>
            p === "…" ? (
              <Typography
                as="span"
                key={`ellipsis-${i}`}
                variant="body-sm"
                color="foreground/30"
                className="flex size-8 items-center justify-center select-none max-sm:size-7"
              >
                …
              </Typography>
            ) : (
              <PageBtn
                key={p}
                onClick={() => onPageChange(p)}
                active={p === page}
                disabled={p === page}
              >
                {p}
              </PageBtn>
            )
          )}
        </div>

        {/* Next arrows */}
        <div className="flex items-center gap-0.5">
          <PageBtn
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Trang sau"
          >
            <ChevronRight className="size-3.5 max-sm:size-3" />
          </PageBtn>
          <PageBtn
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            title="Trang cuối"
          >
            <ChevronsRight className="size-3.5 max-sm:size-3" />
          </PageBtn>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn("text-14 flex flex-wrap items-center gap-1.5 text-white/60", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="size-3.5 shrink-0 text-white/30" aria-hidden="true" />
            )}
            {isLast || !item.href ? (
              <span className={cn("line-clamp-1", isLast ? "font-500 text-white/90" : "")}>
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

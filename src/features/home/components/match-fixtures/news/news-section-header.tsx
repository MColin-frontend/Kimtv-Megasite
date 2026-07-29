import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Typography } from "@/components/ui/typography"

interface NewsSectionHeaderProps {
  title: string
  href: string
  viewAllLabel: string
}

export function NewsSectionHeader({ title, href, viewAllLabel }: NewsSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Typography
        size="20"
        weight="700"
        className="text-gradient-white max-md:!text-17 max-sm:!text-14"
      >
        {title}
      </Typography>
      <Link
        href={href}
        className="group/btn hover:text-gold flex items-center gap-1 overflow-hidden pr-1 transition-colors"
      >
        <Typography
          as="span"
          variant="caption"
          weight="500"
          color="muted"
          className="group-hover/btn:text-gold transition-all duration-200 group-hover/btn:italic"
        >
          {viewAllLabel}
        </Typography>
        <ArrowRight
          size={16}
          className="-translate-x-4 opacity-0 transition-all duration-200 group-hover/btn:translate-x-0 group-hover/btn:opacity-100"
          aria-hidden
        />
      </Link>
    </div>
  )
}

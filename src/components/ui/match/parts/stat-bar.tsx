import type { ImageProps } from "next/image"

import { cn } from "@/lib/utils"

import { Img } from "@/components/ui/image"

export interface MatchStatItemInterface {
  icon: ImageProps["src"]
  alt: string
  label: string
  home: number
  away: number
}

interface MatchStatBarProps {
  stats: MatchStatItemInterface[]
  className?: string
}

export function MatchStatBar({ stats, className }: MatchStatBarProps) {
  return (
    <div
      className={cn(
        "rounded-8 flex items-center justify-between bg-white/5 px-2 py-1.5 backdrop-blur-[5px] [will-change:transform] max-sm:px-1 max-sm:py-0.5",
        className
      )}
    >
      {stats.map((s, i) => (
        <div key={i} className="flex flex-1 items-center">
          {i > 0 && <div className="h-4 w-px shrink-0 bg-white/20 max-sm:h-2.5" />}
          <div className="flex flex-1 flex-col items-center gap-0.5 px-4 max-sm:px-1">
            <div className="flex items-center gap-1 max-sm:gap-0.5">
              <Img
                src={s.icon}
                alt={s.alt}
                width={16}
                height={16}
                objectFit="contain"
                className="max-sm:!size-[10px]"
              />
              <span className="text-14 font-700 max-sm:!text-10 leading-150 text-white tabular-nums">
                {s.home}
              </span>
              <span className="text-12 font-400 tracking-1 leading-150 text-white/50">-</span>
              <span className="text-14 font-700 max-sm:!text-10 leading-150 text-white tabular-nums">
                {s.away}
              </span>
            </div>
            <span className="text-12 tracking-1 font-500 leading-150 whitespace-nowrap text-white/80 max-sm:!text-[9px]">
              {s.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

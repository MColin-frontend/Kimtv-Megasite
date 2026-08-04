import { cn } from "@/lib/utils"

import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

import imgEmpty from "@assets/images/common/img-empty.png"

interface EmptyProps {
  tip?: string
  image?: string
  imageSize?: number
  className?: string
}

export function Empty({ tip, image, imageSize = 120, className }: EmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 max-sm:gap-2 max-sm:py-6",
        className
      )}
    >
      <Img
        src={image ?? imgEmpty}
        alt="empty"
        width={imageSize}
        height={imageSize}
        objectFit="contain"
        className="opacity-60"
        quality={40}
      />
      {tip && (
        <Typography size="16" weight="500" className="max-sm:!text-14 text-center text-white/40">
          {tip}
        </Typography>
      )}
    </div>
  )
}

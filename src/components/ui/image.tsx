"use client"

import { useState } from "react"
import NextImage, { type ImageProps } from "next/image"

import { cn } from "@/lib/utils"

const FALLBACK_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Cpath d='M35 40a8 8 0 1 1 16 0 8 8 0 0 1-16 0zm-10 25c0-8.284 6.716-15 15-15h20c8.284 0 15 6.716 15 15v5H25v-5z' fill='%23d1d5db'/%3E%3C/svg%3E"

type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down"
type Rounded = "0" | "2" | "4" | "6" | "8" | "10" | "12" | "16" | "20" | "24" | "full"

interface AppImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: ImageProps["src"] | null
  alt?: string
  fallback?: string
  objectFit?: ObjectFit
  rounded?: Rounded
  wrapperClassName?: string
}

/** Normalize: null | undefined | "" đều về null → dùng fallback. */
function normalizeSrc(src: AppImageProps["src"]): ImageProps["src"] | null {
  if (!src) return null
  return src
}

export function Img({
  src,
  alt = "",
  fallback = FALLBACK_SRC,
  objectFit = "cover",
  rounded,
  fill,
  sizes,
  style,
  className,
  wrapperClassName,
  ...props
}: AppImageProps) {
  const resolved = normalizeSrc(src)
  const [prevSrc, setPrevSrc] = useState(resolved)
  const [imgSrc, setImgSrc] = useState<ImageProps["src"]>(resolved ?? fallback)

  if (prevSrc !== resolved) {
    setPrevSrc(resolved)
    setImgSrc(resolved ?? fallback)
  }

  const roundedClass = rounded ? `rounded-${rounded}` : undefined

  // Khi truyền width/height (không dùng fill), tự enforce CSS size để không cần
  // thêm className="w-[Xpx] h-[Ypx]" redundant bên ngoài.
  // Consumer style vẫn có thể override (ví dụ: height: "auto" cho logo).
  const sizeStyle: React.CSSProperties =
    !fill && props.width && props.height
      ? { width: Number(props.width), height: Number(props.height) }
      : {}

  const mergedStyle: React.CSSProperties = { objectFit, ...sizeStyle, ...style }

  const sharedProps = {
    alt,
    style: mergedStyle,
    onError: () => setImgSrc(fallback),
  }

  if (fill) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { width: _w, height: _h, ...fillProps } = props
    return (
      <div className={cn("relative overflow-hidden", roundedClass, wrapperClassName)}>
        <NextImage
          {...fillProps}
          {...sharedProps}
          src={imgSrc}
          fill
          sizes={sizes ?? "100vw"}
          className={cn("transition-opacity duration-300", className)}
        />
      </div>
    )
  }

  return (
    <NextImage
      {...props}
      {...sharedProps}
      src={imgSrc}
      sizes={sizes}
      className={cn(roundedClass, "transition-opacity duration-300", className)}
    />
  )
}

import type { ElementType, HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const typographyVariants = cva("text-primary", {
  variants: {
    variant: {
      display: "text-36 sm:text-48 md:text-60 lg:text-72 font-700 leading-100 tracking-n2",
      h1: "text-24 sm:text-30 md:text-36 lg:text-48 font-700 leading-125 tracking-n1",
      h2: "text-16 sm:text-18 md:text-20 lg:text-22 font-700 leading-163 tracking-0",
      h3: "text-18 sm:text-20 md:text-24 lg:text-30 font-600 leading-138 tracking-n1",
      h4: "text-16 sm:text-18 md:text-20 lg:text-24 font-600 leading-138",
      h5: "text-14 sm:text-16 md:text-17 lg:text-20 font-500 leading-138",
      h6: "text-14 sm:text-16 lg:text-18 font-500 leading-150",
      "body-lg": "text-14 sm:text-16 lg:text-18 font-400 leading-163",
      body: "text-14 sm:text-16 font-400 leading-163",
      "body-sm": "text-12 sm:text-14 font-400 leading-150",
      caption: "text-12 font-400 leading-150 tracking-1",
      overline: "text-12 font-600 leading-150 tracking-4 uppercase",
      label: "text-12 sm:text-14 font-500 leading-1.2",
    },
  },
  defaultVariants: {
    variant: "body",
  },
})

const defaultTag: Record<string, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  "body-lg": "p",
  body: "p",
  "body-sm": "p",
  caption: "span",
  overline: "span",
  label: "span",
}

type Variant = NonNullable<VariantProps<typeof typographyVariants>["variant"]>
type FontSize =
  | "10"
  | "12"
  | "13"
  | "14"
  | "16"
  | "17"
  | "18"
  | "20"
  | "22"
  | "24"
  | "30"
  | "36"
  | "48"
  | "60"
  | "72"
type FontWeight = "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  variant?: Variant
  size?: FontSize
  weight?: FontWeight
  color?: string
}

const TEXT_SIZE_RE = /(?:^|\s)(?:[a-z0-9-]+:)*!?text-\d+(?=\s|$)/g

function Typography({
  as,
  variant = "body",
  size,
  weight,
  color,
  className,
  style,
  ...props
}: TypographyProps) {
  const Tag = as ?? defaultTag[variant] ?? "p"

  const isRawColor = color?.startsWith("#") || color?.startsWith("rgb")

  const variantClasses = size
    ? typographyVariants({ variant }).replace(TEXT_SIZE_RE, "").trim()
    : typographyVariants({ variant })

  return (
    <Tag
      className={cn(
        variantClasses,
        size && `text-${size}`,
        weight && `font-${weight}`,
        color && !isRawColor && `text-${color}`,
        className
      )}
      style={{
        ...(color && isRawColor ? { color } : {}),
        ...style,
      }}
      {...props}
    />
  )
}

export { Typography, typographyVariants }
export type { TypographyProps, Variant, FontSize, FontWeight }

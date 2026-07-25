import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-14 font-600 leading-[20px] tracking-0 whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-16",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "relative overflow-hidden rounded-full bg-gradient-button text-btn-primary-text h-9 px-5 gap-1.5 shadow-[0_2px_10px_theme(colors.gold/0.25)] hover:scale-[1.03] hover:shadow-[0_0_20px_4px_theme(colors.gold/0.35)] active:scale-95 before:absolute before:inset-0 before:w-1/2 before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] before:opacity-0 before:-translate-x-full hover:before:opacity-100 hover:before:[animation:shine_0.6s_ease-in-out]",
        cancel:
          "relative overflow-hidden rounded-full border border-white/15 bg-white/5 text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:scale-[1.03] hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-95 before:absolute before:inset-0 before:w-1/2 before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] before:opacity-0 before:-translate-x-full hover:before:opacity-100 hover:before:[animation:shine_0.6s_ease-in-out]",
        tab: "rounded-full border-white/10 bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white/80",
      },

      size: {
        default: "h-9 gap-1.5 py-2 px-3 rounded-6",
        sm: "h-9 gap-1 py-2 px-2.5 rounded-6",
        lg: "h-11 gap-1.5 py-3 px-4 rounded-6",
        icon: "size-9 rounded-6",
        "icon-sm": "size-9 rounded-6",
        "icon-lg": "size-11 rounded-6",
        tab: "h-auto gap-1.5 py-1.5 px-4 rounded-full text-13 font-500",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

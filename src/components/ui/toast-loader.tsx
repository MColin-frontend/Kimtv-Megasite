"use client"

import dynamic from "next/dynamic"

export const Toaster = dynamic(
  () => import("@/components/ui/toast").then((m) => ({ default: m.Toaster })),
  { ssr: false }
)

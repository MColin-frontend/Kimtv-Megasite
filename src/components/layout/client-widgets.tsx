"use client"

import dynamic from "next/dynamic"

const BackToTop = dynamic(() => import("@/components/ui/back-to-top").then((m) => m.BackToTop), { ssr: false })
const PollFloatButton = dynamic(() => import("@/components/ui/poll-float-button").then((m) => m.PollFloatButton), { ssr: false })
const Toaster = dynamic(() => import("@/components/ui/toast").then((m) => m.Toaster), { ssr: false })

export function ClientWidgets() {
  return (
    <>
      <BackToTop />
      <PollFloatButton />
      <Toaster />
    </>
  )
}

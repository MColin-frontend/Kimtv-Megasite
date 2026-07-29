"use client"

import { guardConditions, withLayoutGuard } from "@/components/layout/layout-guard"

function BroadcastLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export default withLayoutGuard(BroadcastLayout, {
  condition: guardConditions.requireAuth,
})

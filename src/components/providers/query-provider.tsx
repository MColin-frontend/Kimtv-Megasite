"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { useAdPlacements } from "@/hooks/tanstack/use-ad-placements"

/** Trigger các query cần fetch sớm ngay khi app mount. */
function AppBootstrap() {
  useAdPlacements()
  return null
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            gcTime: Infinity,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
      {children}
    </QueryClientProvider>
  )
}

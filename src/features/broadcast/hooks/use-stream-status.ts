import { useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchIsBroadcast } from "@/features/broadcast/broadcast.api"

export const STREAM_STATUS_KEY = ["is-broadcast"] as const

export function useStreamStatus() {
  const queryClient = useQueryClient()

  const { data, isFetching, isLoading } = useQuery({
    queryKey: STREAM_STATUS_KEY,
    queryFn: fetchIsBroadcast,
    staleTime: 0,
    refetchInterval: 30_000,
  })

  const streaming = data?.hasLive ?? false
  const liveUrlItem = data?.responseVo?.liveUrlList?.[0] ?? null

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: STREAM_STATUS_KEY })
  }

  return { streaming, liveUrlItem, isFetching, isLoading, invalidate }
}

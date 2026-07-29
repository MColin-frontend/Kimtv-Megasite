import { useQuery } from "@tanstack/react-query"

import { javaGet } from "@/server/services/client-request"

import { QUERY_KEYS } from "@/constants/query-keys.constants"
import type { AdPlacementsInterface } from "@/models/ad.models"

const AD_API = {
  PLACEMENTS: "/advertise/placements",
} as const

export function useAdPlacements() {
  return useQuery({
    queryKey: QUERY_KEYS.adPlacements,
    queryFn: () => javaGet<AdPlacementsInterface>(AD_API.PLACEMENTS),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

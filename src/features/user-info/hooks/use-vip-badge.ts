"use client"

import { useQuery } from "@tanstack/react-query"

import { javaGet } from "@/server/services/client-request"

import { QUERY_KEYS } from "@/constants/query-keys.constants"

import { USER_INFO_API } from "../user-info.constants"
import type { VipBadgeModel } from "../user-info.models"

async function fetchVipBadge(userId: string): Promise<VipBadgeModel | null> {
  return javaGet<VipBadgeModel>(USER_INFO_API.VIP_BADGE, {
    params: { userId },
    isMessageError: false,
  })
}

export function useVipBadge(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.vipBadge(userId),
    queryFn: () => fetchVipBadge(userId),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  })
}

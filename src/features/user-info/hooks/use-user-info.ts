"use client"

import { useQuery } from "@tanstack/react-query"

import { javaGet } from "@/server/services/client-request"

import { QUERY_KEYS } from "@/constants/query-keys.constants"

import { USER_INFO_API } from "../user-info.constants"
import type { UserInfoModel } from "../user-info.models"

async function fetchUserInfo(userId: string, loginUserId: string): Promise<UserInfoModel | null> {
  return javaGet<UserInfoModel>(USER_INFO_API.PROFILE, {
    params: { userId, loginUserId },
    isMessageError: false,
  })
}

export function useUserInfo(userId: string, loginUserId = "") {
  return useQuery({
    queryKey: QUERY_KEYS.userInfo(userId, loginUserId),
    queryFn: () => fetchUserInfo(userId, loginUserId),
    staleTime: 5 * 60 * 1000,
  })
}

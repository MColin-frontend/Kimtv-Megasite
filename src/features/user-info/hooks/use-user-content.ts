"use client"

import { useQuery } from "@tanstack/react-query"

import { javaGet } from "@/server/services/client-request"

import { QUERY_KEYS } from "@/constants/query-keys.constants"

import { USER_INFO_API } from "../user-info.constants"
import type { UserContentResult } from "../user-info.models"

async function fetchUserContent(
  userId: string,
  type: "article" | "video",
  page: number,
  loginUserId: string
): Promise<UserContentResult> {
  const res = await javaGet<UserContentResult>(USER_INFO_API.CONTENT(userId, type, page), {
    params: { loginUserId },
    isMessageError: false,
  })
  return res ?? { records: [], total: 0 }
}

export function useUserContent(
  userId: string,
  type: "article" | "video",
  page: number,
  loginUserId = ""
) {
  return useQuery({
    queryKey: QUERY_KEYS.userContent(userId, type, page),
    queryFn: () => fetchUserContent(userId, type, page, loginUserId),
    staleTime: 2 * 60 * 1000,
  })
}

import "server-only"

import { cookies } from "next/headers"

import { getLoginUserIdFromUser, parseUserInfoCookie } from "@/lib/auth-cookie"

export async function getServerLoginUserId(): Promise<string> {
  try {
    const store = await cookies()
    return getLoginUserIdFromUser(parseUserInfoCookie(store.get("userInfo")?.value))
  } catch {
    return ""
  }
}

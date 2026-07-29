import { NextRequest, NextResponse } from "next/server"

import {
  buildKimtvAuthCookieHeader,
  buildKimtvBackendHeaders,
  httpClient,
  KIMTV_DEFAULT_REFERER_PATH,
} from "@/server/services/request"

import { assertServerEnv, env } from "@/config/env"

type RouteContext = { params: Promise<{ path: string[] }> }

/**
 * Proxy /java/* → {API_BASE_URL}/*
 *
 * Browser chỉ thấy localhost:3000/java/... nhưng server forward tới kimtv.net
 * với Origin/Referer/Cookie giả lập như KIMTV-PC nuxt proxy (changeOrigin).
 */
async function proxyToJava(req: NextRequest, context: RouteContext) {
  assertServerEnv()

  const { path } = await context.params
  const backendPath = `/${path.join("/")}`
  const params = Object.fromEntries(req.nextUrl.searchParams.entries())
  delete params._t

  const token = req.headers.get("token") ?? req.cookies.get("token")?.value ?? ""
  const cookieHeader = buildKimtvAuthCookieHeader(req.cookies)

  const headers = buildKimtvBackendHeaders({
    apiOrigin: env.apiOrigin,
    token: token || null,
    refererPath: KIMTV_DEFAULT_REFERER_PATH,
    cookieHeader,
  })

  try {
    let data: unknown
    const extraHeaders: Record<string, string> = {}

    const contentType = req.headers.get("content-type") ?? ""

    if (req.method !== "GET" && req.method !== "HEAD") {
      if (contentType.includes("multipart/form-data")) {
        // Forward FormData as-is — let axios set Content-Type with boundary
        const formData = await req.formData()
        const upstream = new FormData()
        formData.forEach((value, key) => upstream.append(key, value))
        data = upstream
        extraHeaders["Content-Type"] = "multipart/form-data"
      } else {
        const raw = await req.text()
        data = raw ? JSON.parse(raw) : undefined
      }
    }

    const res = await httpClient.request({
      method: req.method,
      url: backendPath,
      params,
      data,
      headers: { ...headers, ...extraHeaders },
    })

    return NextResponse.json(res.data)
  } catch (error) {
    if (env.isDev) {
      console.error("[java proxy] backend error:", backendPath, error)
    }
    return NextResponse.json(
      { status: "fail", errorMsg: "Backend unavailable", result: null },
      { status: 502 }
    )
  }
}

export const GET = proxyToJava
export const POST = proxyToJava
export const PUT = proxyToJava
export const PATCH = proxyToJava
export const DELETE = proxyToJava

import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios"

import type {
  ApiEnvelopeInterface,
  NormalizedErrorInterface,
  RequestOptionsInterface,
  RequestResultInterface,
} from "@/server/request.models"

import { assertServerEnv, env } from "@/config/env"

import { toast } from "@/components/ui/toast"

/**
 * HTTP client (axios) gọi backend KimTV (Java) — CHỈ chạy trên server.
 *
 * Vì sao server-only:
 * - Backend/Cloudflare kiểm tra `Origin`/`Referer` → browser cấm set các header này.
 * - Gọi thẳng từ browser sẽ dính CORS (khác origin với kimtv.net).
 * → Mọi request đi qua Server Component / Route Handler / Server Action.
 *
 * Helper tái sử dụng (LUÔN return result, không throw):
 *   getRequest / postRequest / putRequest / patchRequest / deleteRequest
 */

const KIMTV_API_HEADERS = {
  Accept: "application/json, text/plain, */*",
  lan: "vi",
  sysType: "PC",
} as const

export const KIMTV_DEFAULT_REFERER_PATH = "/videos/hot"

export function buildKimtvBackendHeaders(options: {
  apiOrigin: string
  token?: string | null
  refererPath?: string
  cookieHeader?: string | null
}): Record<string, string> {
  const origin = options.apiOrigin.replace(/\/$/, "")
  const path = options.refererPath ?? KIMTV_DEFAULT_REFERER_PATH
  const referer = path.startsWith("http")
    ? path
    : `${origin}${path.startsWith("/") ? path : `/${path}`}`

  return {
    ...KIMTV_API_HEADERS,
    Origin: origin,
    Referer: referer,
    ...(options.token ? { token: options.token } : {}),
    ...(options.cookieHeader ? { Cookie: options.cookieHeader } : {}),
  }
}

export function buildKimtvAuthCookieHeader(cookies: {
  get: (name: string) => { value: string } | undefined
}): string | undefined {
  const parts: string[] = []
  const lang = cookies.get("lang")?.value ?? "vi"
  parts.push(`lang=${lang}`)
  const token = cookies.get("token")?.value
  if (token) parts.push(`token=${token}`)
  const userInfo = cookies.get("userInfo")?.value
  if (userInfo) parts.push(`userInfo=${encodeURIComponent(userInfo)}`)
  return parts.length ? parts.join("; ") : undefined
}

const DEFAULT_HEADERS: Readonly<Record<string, string>> = {
  ...KIMTV_API_HEADERS,
  "Content-Type": "application/json",
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  timeoutErrorMessage: `Request timeout sau ${env.apiTimeoutMs}ms`,
  headers: DEFAULT_HEADERS,
})

// Cache-buster `_t` + token + Origin/Referer giả lập kimtv.net (không dùng localhost).
httpClient.interceptors.request.use(async (config) => {
  config.params = { ...config.params, _t: Date.now() }
  const headers = config.headers as Record<string, string>

  if (env.apiOrigin) {
    const origin = env.apiOrigin.replace(/\/$/, "")
    headers.Origin = origin
    if (!headers.Referer) headers.Referer = `${origin}/`
  }

  try {
    const { cookies } = await import("next/headers")
    const store = await cookies()
    const token = store.get("token")?.value
    if (token && !headers.token) headers.token = token

    if (!headers.Cookie) {
      const cookieHeader = buildKimtvAuthCookieHeader(store)
      if (cookieHeader) headers.Cookie = cookieHeader
    }
  } catch {
    // không có next/headers
  }
  return config
})

function normalizeError(error: unknown): NormalizedErrorInterface {
  if (error instanceof AxiosError) {
    // Timeout: axios set code ECONNABORTED hoặc ETIMEDOUT.
    if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
      return { message: error.message, httpStatus: 408, errorCode: null }
    }
    // Có response từ server (4xx/5xx).
    if (error.response) {
      const envelope = error.response.data as Partial<ApiEnvelopeInterface<unknown>> | undefined
      return {
        message: envelope?.errorMsg ?? envelope?.message ?? error.message,
        httpStatus: error.response.status,
        errorCode: envelope?.errorCode ?? null,
      }
    }
    // Không kết nối được (DNS, refused, network down).
    return { message: error.message, httpStatus: 0, errorCode: null }
  }
  return { message: "Unknown request error", httpStatus: 0, errorCode: null }
}

/** Lõi chung: gọi axios và gói thành RequestResultInterface, không throw. */
async function request<T>(
  config: AxiosRequestConfig,
  options: RequestOptionsInterface = {}
): Promise<RequestResultInterface<T>> {
  const {
    successMessage,
    errorMessage,
    showSuccess = false,
    showError = true,
    isMessageSuccess = false,
    isMessageError = false,
    messageSuccess,
    messageError,
  } = options

  try {
    assertServerEnv()

    const res = await httpClient.request<ApiEnvelopeInterface<T>>(config)
    const envelope = res.data

    if (envelope?.status !== "success") {
      const serverMsg = envelope?.errorMsg ?? envelope?.message ?? "Yêu cầu thất bại"
      const errMsg = messageError ?? errorMessage ?? serverMsg
      if (isMessageError) toast.error(errMsg)
      return {
        success: false,
        data: null,
        message: showError ? errMsg : null,
        errorCode: envelope?.errorCode ?? null,
        httpStatus: res.status,
      }
    }

    const sucMsg = messageSuccess ?? successMessage ?? null
    if (isMessageSuccess && sucMsg) toast.success(sucMsg)
    return {
      success: true,
      data: envelope.result,
      message: showSuccess ? sucMsg : null,
      errorCode: null,
      httpStatus: res.status,
    }
  } catch (error) {
    const normalized = normalizeError(error)
    const errMsg = messageError ?? errorMessage ?? normalized.message
    if (isMessageError) toast.error(errMsg)
    return {
      success: false,
      data: null,
      message: showError ? errMsg : null,
      errorCode: normalized.errorCode,
      httpStatus: normalized.httpStatus,
    }
  }
}

function unwrap<T>(res: RequestResultInterface<T>): T | null {
  return res.success ? (res.data ?? null) : null
}

export function getRequest<T>(path: string, options?: RequestOptionsInterface): Promise<T | null> {
  return request<T>({ ...options, method: "GET", url: path }, options).then(unwrap)
}

export function postRequest<T>(
  path: string,
  body?: unknown,
  options?: RequestOptionsInterface
): Promise<T | null> {
  return request<T>({ ...options, method: "POST", url: path, data: body }, options).then(unwrap)
}

export function putRequest<T>(
  path: string,
  body?: unknown,
  options?: RequestOptionsInterface
): Promise<T | null> {
  return request<T>({ ...options, method: "PUT", url: path, data: body }, options).then(unwrap)
}

export function patchRequest<T>(
  path: string,
  body?: unknown,
  options?: RequestOptionsInterface
): Promise<T | null> {
  return request<T>({ ...options, method: "PATCH", url: path, data: body }, options).then(unwrap)
}

export function deleteRequest<T>(
  path: string,
  options?: RequestOptionsInterface
): Promise<T | null> {
  return request<T>({ ...options, method: "DELETE", url: path }, options).then(unwrap)
}

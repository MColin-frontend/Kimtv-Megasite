/**
 * Client-side HTTP — gọi `/java/*` (proxy backend) hoặc `/api/*` (Next routes).
 * Dùng fetch + KimTV headers, luôn resolve không throw.
 */

import type { ApiEnvelopeInterface } from "@/server/request.models"
import { getTokenFromCookie } from "@/lib/auth-cookie"

import { toast } from "@/components/ui/toast"

export type ClientParams = Record<string, string | number | boolean | null | undefined>

export interface ClientRequestResult<T> {
  success: boolean
  data: T | null
  httpStatus: number
}

export interface ClientRequestOptions {
  params?: ClientParams
  isMessageSuccess?: boolean
  isMessageError?: boolean
  messageSuccess?: string
  messageError?: string
}

function buildHeaders(extra?: Record<string, string | undefined>): Record<string, string> {
  const token = getTokenFromCookie()
  const headers: Record<string, string> = {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    lan: "vi",
    sysType: "PC",
    ...(token ? { token } : {}),
  }
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v === undefined) delete headers[k]
      else headers[k] = v
    }
  }
  return headers
}

function buildUrl(url: string, params?: ClientParams): string {
  if (!params) return url
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined) sp.set(k, String(v))
  }
  const qs = sp.toString()
  return qs ? `${url}${url.includes("?") ? "&" : "?"}${qs}` : url
}

interface RequestConfig {
  method: string
  url: string
  params?: ClientParams
  data?: unknown
  headers?: Record<string, string | undefined>
}

async function request<T>(
  config: RequestConfig,
  options: ClientRequestOptions = {}
): Promise<ClientRequestResult<T>> {
  const { isMessageError, isMessageSuccess, messageSuccess, messageError } = options
  const isFormData = config.data instanceof FormData

  const headers = buildHeaders(
    isFormData ? { ...config.headers, "Content-Type": undefined } : config.headers
  )

  const init: RequestInit = {
    method: config.method,
    headers,
    credentials: "include",
  }
  if (config.data !== undefined) {
    init.body = isFormData ? (config.data as FormData) : JSON.stringify(config.data)
  }

  try {
    const res = await fetch(buildUrl(config.url, config.params), init)
    const data = (await res.json().catch(() => null)) as T | null

    if (!res.ok) {
      if (isMessageError === true) toast.error(messageError ?? "Yêu cầu thất bại")
      return { success: false, data, httpStatus: res.status }
    }

    if (isMessageSuccess && messageSuccess) toast.success(messageSuccess)
    return { success: true, data: data!, httpStatus: res.status }
  } catch {
    if (isMessageError === true) toast.error(messageError ?? "Yêu cầu thất bại")
    return { success: false, data: null, httpStatus: 0 }
  }
}

/** Prefix backend path → Next.js Java proxy URL. Vd. `/news/foo` → `/java/news/foo` */
export function javaUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `/java${normalized}`
}

export function isJavaSuccess(res: ApiEnvelopeInterface<unknown> | null | undefined): boolean {
  return res?.status === "success"
}

export function getJavaErrorMessage(
  res: ApiEnvelopeInterface<unknown> | null | undefined
): string | null {
  if (!res || res.status === "success") return null
  return res.errorMsg ?? res.message ?? null
}

export function clientGet<T>(
  url: string,
  options?: ClientRequestOptions
): Promise<ClientRequestResult<T>> {
  return request<T>({ method: "GET", url, params: options?.params }, options)
}

export function clientPost<T>(
  url: string,
  body?: unknown,
  options?: ClientRequestOptions
): Promise<ClientRequestResult<T>> {
  return request<T>({ method: "POST", url, params: options?.params, data: body }, options)
}

/** Upload multipart/form-data — bỏ Content-Type để browser tự set boundary. */
export function clientUpload<T>(
  url: string,
  formData: FormData,
  options?: ClientRequestOptions
): Promise<ClientRequestResult<T>> {
  return request<T>({ method: "POST", url, data: formData }, options)
}

export function clientDelete<T>(
  url: string,
  options?: ClientRequestOptions
): Promise<ClientRequestResult<T>> {
  return request<T>({ method: "DELETE", url, params: options?.params }, options)
}

type ToastOpts = Pick<
  ClientRequestOptions,
  "isMessageSuccess" | "messageSuccess" | "isMessageError" | "messageError"
>

function handleJavaToast<T>(
  res: ClientRequestResult<ApiEnvelopeInterface<T>>,
  opts: ToastOpts
): T | null {
  const envelope = res.data
  if (res.success && isJavaSuccess(envelope)) {
    if (opts.isMessageSuccess && opts.messageSuccess) toast.success(opts.messageSuccess)
    return (envelope?.result ?? null) as T | null
  }
  if (opts.isMessageError === true) {
    const errMsg = opts.messageError ?? getJavaErrorMessage(envelope) ?? "Yêu cầu thất bại"
    toast.error(errMsg)
  }
  return null
}

function splitToastOpts(options?: ClientRequestOptions) {
  const { isMessageSuccess, messageSuccess, isMessageError, messageError, ...rest } = options ?? {}
  return { toastOpts: { isMessageSuccess, messageSuccess, isMessageError, messageError }, rest }
}

export function javaGet<T>(path: string, options?: ClientRequestOptions): Promise<T | null> {
  const { toastOpts, rest } = splitToastOpts(options)
  return clientGet<ApiEnvelopeInterface<T>>(javaUrl(path), rest).then((res) =>
    handleJavaToast(res, toastOpts)
  )
}

export function javaPost<T>(
  path: string,
  body?: unknown,
  options?: ClientRequestOptions
): Promise<T | null> {
  const { toastOpts, rest } = splitToastOpts(options)
  return clientPost<ApiEnvelopeInterface<T>>(javaUrl(path), body, rest).then((res) =>
    handleJavaToast(res, toastOpts)
  )
}

export function javaDelete<T>(path: string, options?: ClientRequestOptions): Promise<T | null> {
  const { toastOpts, rest } = splitToastOpts(options)
  return clientDelete<ApiEnvelopeInterface<T>>(javaUrl(path), rest).then((res) =>
    handleJavaToast(res, toastOpts)
  )
}

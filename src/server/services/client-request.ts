/**
 * Client-side HTTP — gọi `/java/*` (proxy backend) hoặc `/api/*` (Next routes).
 * Dùng axios + KimTV headers, luôn resolve không throw.
 */

import axios, { type AxiosRequestConfig } from "axios"

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

const clientHttp = axios.create({
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

clientHttp.interceptors.request.use((config) => {
  const token = getTokenFromCookie()
  Object.assign(config.headers, {
    Accept: "application/json, text/plain, */*",
    lan: "vi",
    sysType: "PC",
    ...(token ? { token } : {}),
  })
  return config
})

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

async function request<T>(
  config: AxiosRequestConfig,
  options: ClientRequestOptions = {}
): Promise<ClientRequestResult<T>> {
  const { isMessageError, messageSuccess, messageError } = options
  try {
    const res = await clientHttp.request<T>(config)
    if (messageSuccess) toast.success(messageSuccess)
    return { success: true, data: res.data, httpStatus: res.status }
  } catch (error) {
    const httpStatus = axios.isAxiosError(error) ? (error.response?.status ?? 0) : 0
    const errMsg = messageError ?? "Yêu cầu thất bại"
    if (isMessageError) toast.error(errMsg)
    return { success: false, data: null, httpStatus }
  }
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

/** Upload multipart/form-data — bỏ Content-Type để axios/browser tự set boundary. */
export function clientUpload<T>(
  url: string,
  formData: FormData,
  options?: ClientRequestOptions
): Promise<ClientRequestResult<T>> {
  return request<T>(
    {
      method: "POST",
      url,
      data: formData,
      headers: { "Content-Type": undefined },
    },
    options
  )
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
  if (opts.isMessageError !== false) {
    const errMsg = opts.messageError ?? getJavaErrorMessage(envelope) ?? "Yêu cầu thất bại"
    toast.error(errMsg)
  }
  return null
}

export function javaGet<T>(path: string, options?: ClientRequestOptions): Promise<T | null> {
  const { isMessageSuccess, messageSuccess, isMessageError, messageError, ...rest } = options ?? {}
  return clientGet<ApiEnvelopeInterface<T>>(javaUrl(path), rest).then((res) =>
    handleJavaToast(res, { isMessageSuccess, messageSuccess, isMessageError, messageError })
  )
}

export function javaPost<T>(
  path: string,
  body?: unknown,
  options?: ClientRequestOptions
): Promise<T | null> {
  const { isMessageSuccess, messageSuccess, isMessageError, messageError, ...rest } = options ?? {}
  return clientPost<ApiEnvelopeInterface<T>>(javaUrl(path), body, rest).then((res) =>
    handleJavaToast(res, { isMessageSuccess, messageSuccess, isMessageError, messageError })
  )
}

export function javaDelete<T>(path: string, options?: ClientRequestOptions): Promise<T | null> {
  const { isMessageSuccess, messageSuccess, isMessageError, messageError, ...rest } = options ?? {}
  return clientDelete<ApiEnvelopeInterface<T>>(javaUrl(path), rest).then((res) =>
    handleJavaToast(res, { isMessageSuccess, messageSuccess, isMessageError, messageError })
  )
}

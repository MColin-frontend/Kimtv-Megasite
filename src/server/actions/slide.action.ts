"use server"

import { getRequest, postRequest } from "@/server/services/request"

export interface PageResult<T> {
  data: T[]
  total: number
}

function extractRecords<T>(raw: unknown): { data: T[]; total: number } {
  if (Array.isArray(raw)) return { data: raw as T[], total: (raw as T[]).length }
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.records)) {
      return {
        data: obj.records as T[],
        total: typeof obj.total === "number" ? obj.total : (obj.records as T[]).length,
      }
    }
  }
  return { data: [], total: 0 }
}

/**
 * Trả về mảng kết quả (không kèm total) — dùng cho các chỗ không cần phân trang.
 */
export async function fetchSlideAction<T>(
  endpoint: string,
  method: "GET" | "POST",
  params: Record<string, unknown>,
  page: number,
  pageSize: number
): Promise<T[]> {
  const payload = { ...params, page, pageSize }
  const data =
    method === "GET"
      ? await getRequest<unknown>(endpoint, { params: payload })
      : await postRequest<unknown>(endpoint, payload)
  return extractRecords<T>(data).data
}

/**
 * Trả về toàn bộ kết quả mà không thêm bất kỳ params phân trang nào.
 * Dùng cho các endpoint tự trả về tất cả (vd: live matches).
 */
export async function fetchAllAction<T>(
  endpoint: string,
  method: "GET" | "POST",
  params: Record<string, unknown>
): Promise<T[]> {
  const data =
    method === "GET"
      ? await getRequest<unknown>(endpoint, { params })
      : await postRequest<unknown>(endpoint, params)
  return extractRecords<T>(data).data
}

/**
 * Trả về { data, total } — dùng cho các chỗ cần phân trang.
 */
export async function fetchPageAction<T>(
  endpoint: string,
  method: "GET" | "POST",
  params: Record<string, unknown>,
  page: number,
  pageSize: number
): Promise<PageResult<T>> {
  const payload = { ...params, page, pageSize }
  const data =
    method === "GET"
      ? await getRequest<unknown>(endpoint, { params: payload })
      : await postRequest<unknown>(endpoint, payload)
  return extractRecords<T>(data)
}

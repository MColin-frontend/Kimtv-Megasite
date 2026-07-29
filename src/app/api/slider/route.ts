import { NextRequest, NextResponse } from "next/server"

import { getRequest, postRequest } from "@/server/services/request"

export interface SliderRouteRequestInterface {
  endpoint: string
  method?: "GET" | "POST"
  /** Params cố định merge vào mỗi request (vd: { gameId: [] }). */
  params?: Record<string, unknown>
  page: number
  pageSize: number
}

/**
 * Internal proxy: Slider client gọi route này, route gọi backend qua server-only request.ts.
 * Backend URL không bao giờ lộ ra client.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as SliderRouteRequestInterface
  const { endpoint, method = "GET", params = {}, page, pageSize } = body

  const payload = { ...params, page, pageSize }

  const data =
    method === "GET"
      ? await getRequest<unknown[]>(endpoint, { params: payload })
      : await postRequest<unknown[]>(endpoint, payload)

  return NextResponse.json(data ?? [])
}

import { type NextRequest, NextResponse } from "next/server"

const OSS_BASE = "https://kimtv-oss.99kimtvs.top"

// One year for immutable assets (images/video whose URLs contain a hash or
// timestamp); one day for assets whose filenames can change (e.g. live thumbnails).
const CACHE_TTL_IMMUTABLE = 31_536_000 // 365 days
const CACHE_TTL_LIVE = 86_400 // 1 day

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const ossPath = path.join("/")

  const upstream = await fetch(`${OSS_BASE}/${ossPath}`, {
    headers: { "User-Agent": "KimTV-Proxy/1.0" },
    // Reuse OSS connection from the edge pool
    next: { revalidate: CACHE_TTL_LIVE },
  }).catch(() => null)

  if (!upstream?.ok) {
    return new NextResponse(null, { status: upstream?.status ?? 502 })
  }

  const isLive = ossPath.startsWith("live/")
  const maxAge = isLive ? CACHE_TTL_LIVE : CACHE_TTL_IMMUTABLE
  const contentType = upstream.headers.get("Content-Type") ?? "application/octet-stream"

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=86400`,
      "X-Proxied-From": "kimtv-oss",
    },
  })
}

import type { NextConfig } from "next"

const withBundleAnalyzer =
  process.env.ANALYZE === "true"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@next/bundle-analyzer")({ enabled: true })
    : (c: NextConfig) => c

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.mp4": { type: "asset" },
      "*.mov": { type: "asset" },
      "*.webm": { type: "asset" },
    },
  },
  reactStrictMode: false,
  experimental: {
    // Inline CSS chunks as <style> tags instead of render-blocking <link rel="stylesheet">.
    // Eliminates the extra HTTP round-trip for the font CSS chunk and the compiled
    // Tailwind CSS chunk — both currently block first paint by ~540 ms (Lighthouse).
    inlineCss: true,
  },
  // Bundle server tối giản cho Docker — chỉ copy `.next/standalone` vào image runner.
  output: "standalone",
  images: {
    // Cache optimized images for 30 days on the /_next/image CDN edge.
    // The OSS origin serves no Cache-Control header; this ensures at least
    // the Next.js-optimized copies are cached long-term.
    minimumCacheTTL: 2592000,
    // All quality values used in the codebase — Next.js 16 requires explicit enumeration.
    qualities: [20, 60, 65, 75],
    // 168 matches the fixed thumbnail size used in NewsItemRow so /_next/image serves
    // exactly 168px instead of falling back to the next slot (256px) — saves ~55% bytes.
    imageSizes: [16, 32, 48, 64, 96, 128, 168, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kimtv-oss.99kimtvs.top",
      },
      {
        protocol: "https",
        hostname: "oss.fqhur.com",
      },
      {
        protocol: "https",
        hostname: "imga.fqhur.com",
      },
      {
        protocol: "https",
        hostname: "news.esportsdata.cc",
      },
      {
        protocol: "https",
        hostname: "dev.kimtv.net",
      },
      {
        protocol: "https",
        hostname: "cdn.99kim.llc",
      },
      {
        protocol: "https",
        hostname: "img.antdata.cc",
      },
    ],
  },
  async headers() {
    return [
      {
        // Next.js static assets are content-hashed — safe to cache indefinitely
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Disable nginx/proxy response buffering for all pages so React's
        // streaming SSR (Suspense) actually streams — buffered proxies hold
        // the entire response in memory and only forward it once the stream
        // closes, turning a fast first-flush into a slow full-page TTFB.
        source: "/(.*)",
        headers: [{ key: "X-Accel-Buffering", value: "no" }],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)

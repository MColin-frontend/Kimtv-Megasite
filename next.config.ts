import path from "path"
import type { NextConfig } from "next"

const POLYFILL_STUB = path.resolve("./src/lib/empty-polyfill.js")

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.mp4": { type: "asset" },
      "*.mov": { type: "asset" },
      "*.webm": { type: "asset" },
    },
    resolveAlias: {
      // Replace Next.js built-in polyfills with a no-op.
      // All listed features are Baseline and supported by our .browserslistrc targets.
      "next/dist/build/polyfills/polyfill-module": POLYFILL_STUB,
    },
  },
  webpack(config, { webpack: wp, isServer }) {
    if (!isServer) {
      // NormalModuleReplacementPlugin intercepts the raw import request before
      // webpack resolves it, so it catches both the bare name and the relative
      // path ("../build/polyfills/polyfill-module") used inside Next.js internals.
      config.plugins!.push(
        new wp.NormalModuleReplacementPlugin(
          /polyfills[\\/]polyfill-module(\.js)?$/,
          POLYFILL_STUB
        )
      )
    }
    return config
  },
  reactStrictMode: false,
  // Bundle server tối giản cho Docker — chỉ copy `.next/standalone` vào image runner.
  output: "standalone",
  images: {
    // Cache optimized images for 30 days on the /_next/image CDN edge.
    // The OSS origin serves no Cache-Control header; this ensures at least
    // the Next.js-optimized copies are cached long-term.
    minimumCacheTTL: 2592000,
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

export default nextConfig

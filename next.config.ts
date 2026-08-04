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
      // Replace Next.js built-in polyfills (Array.prototype.at, Object.hasOwn, etc.)
      // with a no-op — all are Baseline features covered by our .browserslistrc targets.
      "next/dist/build/polyfills/polyfill-module": POLYFILL_STUB,
    },
  },
  webpack(config) {
    // Same replacement for non-Turbopack builds
    config.resolve.alias = {
      ...config.resolve.alias,
      "next/dist/build/polyfills/polyfill-module": POLYFILL_STUB,
    }
    return config
  },
  reactStrictMode: false,
  // Bundle server tối giản cho Docker — chỉ copy `.next/standalone` vào image runner.
  output: "standalone",
  images: {
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
}

export default nextConfig

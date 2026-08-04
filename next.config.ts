import path from "path"
import type { NextConfig } from "next"

// All 62 core-js modules imported by xgplayer — natively supported in
// Chrome 90+, Safari 15+, Firefox 90+. Aliasing to an empty module
// eliminates the polyfill check-and-patch overhead on every page load.
const XGPLAYER_CORE_JS = [
  "core-js/modules/es.array.at.js",
  "core-js/modules/es.array.concat.js",
  "core-js/modules/es.array.filter.js",
  "core-js/modules/es.array.find-index.js",
  "core-js/modules/es.array.find.js",
  "core-js/modules/es.array.flat-map.js",
  "core-js/modules/es.array.flat.js",
  "core-js/modules/es.array.iterator.js",
  "core-js/modules/es.array.join.js",
  "core-js/modules/es.array.map.js",
  "core-js/modules/es.array.slice.js",
  "core-js/modules/es.array.sort.js",
  "core-js/modules/es.array.splice.js",
  "core-js/modules/es.function.name.js",
  "core-js/modules/es.json.stringify.js",
  "core-js/modules/es.number.constructor.js",
  "core-js/modules/es.number.is-nan.js",
  "core-js/modules/es.number.to-fixed.js",
  "core-js/modules/es.object.assign.js",
  "core-js/modules/es.object.entries.js",
  "core-js/modules/es.object.from-entries.js",
  "core-js/modules/es.object.has-own.js",
  "core-js/modules/es.object.keys.js",
  "core-js/modules/es.object.to-string.js",
  "core-js/modules/es.promise.js",
  "core-js/modules/es.regexp.constructor.js",
  "core-js/modules/es.regexp.exec.js",
  "core-js/modules/es.regexp.sticky.js",
  "core-js/modules/es.regexp.test.js",
  "core-js/modules/es.regexp.to-string.js",
  "core-js/modules/es.string.iterator.js",
  "core-js/modules/es.string.match.js",
  "core-js/modules/es.string.repeat.js",
  "core-js/modules/es.string.replace.js",
  "core-js/modules/es.string.split.js",
  "core-js/modules/es.string.starts-with.js",
  "core-js/modules/es.string.trim-end.js",
  "core-js/modules/es.string.trim-start.js",
  "core-js/modules/es.string.trim.js",
  "core-js/modules/es.symbol.js",
  "core-js/modules/es.typed-array.copy-within.js",
  "core-js/modules/es.typed-array.every.js",
  "core-js/modules/es.typed-array.fill.js",
  "core-js/modules/es.typed-array.filter.js",
  "core-js/modules/es.typed-array.find-index.js",
  "core-js/modules/es.typed-array.find.js",
  "core-js/modules/es.typed-array.for-each.js",
  "core-js/modules/es.typed-array.includes.js",
  "core-js/modules/es.typed-array.index-of.js",
  "core-js/modules/es.typed-array.iterator.js",
  "core-js/modules/es.typed-array.join.js",
  "core-js/modules/es.typed-array.last-index-of.js",
  "core-js/modules/es.typed-array.map.js",
  "core-js/modules/es.typed-array.reduce-right.js",
  "core-js/modules/es.typed-array.reduce.js",
  "core-js/modules/es.typed-array.reverse.js",
  "core-js/modules/es.typed-array.set.js",
  "core-js/modules/es.typed-array.slice.js",
  "core-js/modules/es.typed-array.some.js",
  "core-js/modules/es.typed-array.sort.js",
  "core-js/modules/es.typed-array.subarray.js",
  "core-js/modules/es.typed-array.to-locale-string.js",
  "core-js/modules/es.typed-array.to-string.js",
  "core-js/modules/es.typed-array.uint8-array.js",
  "core-js/modules/esnext.typed-array.at.js",
  "core-js/modules/esnext.typed-array.find-last-index.js",
  "core-js/modules/esnext.typed-array.find-last.js",
  "core-js/modules/web.dom-collections.for-each.js",
  "core-js/modules/web.dom-collections.iterator.js",
  "core-js/modules/web.url-search-params.js",
  "core-js/modules/web.url.js",
]

const EMPTY_MODULE = path.resolve("src/lib/empty-module.js")

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: Object.fromEntries(XGPLAYER_CORE_JS.map((m) => [m, EMPTY_MODULE])),
    rules: {
      "*.mp4": { type: "asset" },
      "*.mov": { type: "asset" },
      "*.webm": { type: "asset" },
    },
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // NormalModuleReplacementPlugin replaces ALL core-js/modules/* in one shot
      // instead of aliasing 62 individual entries.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { NormalModuleReplacementPlugin } = require("next/dist/compiled/webpack/webpack")
      config.plugins.push(
        new NormalModuleReplacementPlugin(/^core-js\/modules\//, EMPTY_MODULE)
      )
    }
    return config
  },
  reactStrictMode: false,
  // Bundle server tối giản cho Docker — chỉ copy `.next/standalone` vào image runner.
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
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

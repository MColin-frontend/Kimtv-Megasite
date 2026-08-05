// Turbopack webpack-compat loader that returns an empty module.
// Used by the "**/build/polyfills/polyfill-module.js" rule in next.config.ts
// to strip Next.js's built-in polyfills from the Turbopack production bundle.
//
// Why a loader instead of resolveAlias:
//   app-globals.js imports polyfill-module via a RELATIVE path ("../build/polyfills/…").
//   Turbopack's resolveAlias matches raw import specifiers, so a package-name key like
//   "next/dist/build/polyfills/polyfill-module" never fires for relative imports inside
//   node_modules/next. A loader rule matches on the resolved file path, bypassing that gap.
module.exports = function () {
  return ""
}

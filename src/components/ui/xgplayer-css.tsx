"use client"

// Isolated CSS import so VideoPlayer can load it via dynamic({ ssr: false }).
// Keeps xgplayer styles out of the initial render-blocking CSS bundle.
import "xgplayer/dist/index.min.css"

export function XgplayerCSS() {
  return null
}

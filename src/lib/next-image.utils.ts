/**
 * Build a /_next/image optimizer URL for a given source, width, and quality.
 * Use this whenever you need to manually construct a Next.js image URL
 * (e.g. CSS background-image, <link rel="preload"> imagesrcset).
 */
export function nextImgUrl(src: string, w: number, q: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${q}`
}

/**
 * Build an imagesrcset string for <link rel="preload"> that matches the srcset
 * Next.js Image emits for a given source.
 */
export function buildNextImgSrcset(src: string, widths: number[], quality: number): string {
  return widths.map((w) => `${nextImgUrl(src, w, quality)} ${w}w`).join(", ")
}

// ── Match card image config ───────────────────────────────────────────────────
// Shared between CardBackground (quality/sizes props) and HeroVideo LCP preload.
// Keep these in sync whenever CardBackground's quality or sizes props change.

/** quality prop used on all match card background images. */
export const MATCH_CARD_IMG_QUALITY = 65

/** sizes prop used on all match card background images. */
export const MATCH_CARD_IMG_SIZES = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"

/**
 * Subset of Next.js deviceSizes used to build the LCP preload imagesrcset.
 * Covers the widths the browser will actually request for match card images.
 */
export const MATCH_CARD_IMG_WIDTHS = [640, 750, 828, 1080, 1920]

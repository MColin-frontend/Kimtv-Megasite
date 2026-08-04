/**
 * Routes any image URL through Next.js optimizer so CSS background-image
 * benefits from WebP/AVIF conversion and compression — same as <Image />.
 */
export function getOptimizedBgUrl(src: string, width: number, quality = 60): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
}

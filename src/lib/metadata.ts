import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

function resolveTitle(title: Metadata["title"]): string {
  if (typeof title === "string") return title
  if (
    title &&
    typeof title === "object" &&
    "default" in title &&
    typeof title.default === "string"
  ) {
    return title.default
  }
  return siteConfig.name
}

/**
 * Tạo metadata cho từng page, merge với default.
 *
 * @example
 * export const metadata = createMetadata({
 *   title: "Lịch thi đấu",
 *   description: "...",
 *   alternates: { canonical: "/vi/lich-thi-dau" },
 * })
 */
export function createMetadata(override: Metadata = {}): Metadata {
  const titleStr = resolveTitle(override.title)
  const description = override.description ?? siteConfig.description
  const ogImage = {
    url: siteConfig.og.image,
    width: siteConfig.og.width,
    height: siteConfig.og.height,
    alt: titleStr,
  }

  return {
    metadataBase: new URL(siteConfig.url),
    title: override.title ?? {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    keywords: override.keywords ?? [...siteConfig.keywords],
    authors: override.authors ?? [...siteConfig.authors],
    creator: override.creator ?? siteConfig.name,
    publisher: override.publisher ?? siteConfig.name,
    applicationName: siteConfig.name,
    category: "sports",

    alternates: {
      canonical: "/",
      ...override.alternates,
    },

    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: titleStr,
      description,
      images: [ogImage],
      ...override.openGraph,
    },

    twitter: {
      card: "summary_large_image",
      title: titleStr,
      description,
      images: [siteConfig.og.image],
      ...override.twitter,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
      ...(typeof override.robots === "object" && override.robots !== null ? override.robots : {}),
    },
  }
}

/** Metadata dùng cho các trang không muốn index (login, admin, ...) */
export const noIndexMetadata: Pick<Metadata, "robots"> = {
  robots: { index: false, follow: false },
}

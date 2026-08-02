import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/java/",
        "/callback",
        "/silent-callback",
        "/vi/dang-nhap",
        "/vi/dang-ky",
        "/vi/ho-so",
        "/vi/nguoi-dung/",
        "/vi/truc-tiep/",
        "/vi/moi-ban",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}

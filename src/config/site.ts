export const siteConfig = {
  name: "KimTV",
  description:
    "KimTV — xem bóng đá trực tiếp, tỉ số online, lịch thi đấu, tin tức và highlight thể thao mới nhất.",
  url: "https://kimtv.net",
  locale: "vi_VN",
  authors: [{ name: "KimTV" }],
  keywords: [
    "KimTV",
    "bóng đá trực tiếp",
    "xem bóng đá online",
    "tỉ số trực tuyến",
    "lịch thi đấu",
    "highlight bóng đá",
    "tin tức bóng đá",
    "World Cup",
    "phát sóng trực tiếp",
    "dự đoán tỷ số",
  ],

  og: {
    width: 1200,
    height: 630,
    image: "/opengraph-image",
  },

  links: {
    twitter: "https://twitter.com/kimtv",
    promotion: "https://www.kim66.plus/pc/?dl=7t1fn4",
  },

  socials: {
    telegram: "https://t.me/anhemkimtv",
    facebook: "https://www.facebook.com/groups/5814050098675787",
    zalo: "https://zalo.me/0582963553",
  },
} as const

export type SiteConfig = typeof siteConfig

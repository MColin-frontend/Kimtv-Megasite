export const QUERY_KEYS = {
  adPlacements: ["ad-placements"] as const,
  leagues: ["leagues"] as const,
  userArticles: (userId: string | number, type: "news" | "video", page: number) =>
    ["user-articles", String(userId), type, page] as const,
  userInfo: (userId: string, loginUserId: string) => ["user-info", userId, loginUserId] as const,
  userContent: (userId: string, type: "article" | "video", page: number) =>
    ["user-content", userId, type, page] as const,
  hotNews: ["hot-news"] as const,
  vipBadge: (userId: string) => ["vip-badge", userId] as const,
} as const

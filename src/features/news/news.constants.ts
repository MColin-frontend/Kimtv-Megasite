import {
  normalizeCommentList,
  resolvePostedCommentId,
} from "@/features/highlights/highlights.utils"
import type { NewsComment } from "@/features/news/news.models"

function extractRecords(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.records)) return obj.records
    if (Array.isArray(obj.list)) return obj.list
    if (Array.isArray(obj.data)) return obj.data
  }
  return []
}

function ncidNum(id: string | number | undefined): number {
  return Number(id ?? 0)
}

function resolveProfileId(item: NewsComment): string {
  const raw = item as unknown as Record<string, unknown>
  const candidates = [raw.operatorId, raw.userId, item.userSourceId]
  for (const id of candidates) {
    if (id == null || id === "") continue
    const normalized = String(id).trim()
    if (!normalized || normalized === "0") continue
    return normalized
  }
  return ""
}

function normalizePostedRecord(
  result: unknown,
  content: string,
  replyUserName: string,
  loginUserId: string,
  user: { name?: string; avatar?: string }
): NewsComment | null {
  const postedId = resolvePostedCommentId(result)
  const payload =
    result && typeof result === "object" && !Array.isArray(result)
      ? (result as Record<string, unknown>)
      : {}

  const normalized = normalizeCommentList([
    {
      ncid: postedId ?? payload.ncid ?? payload.commentId ?? payload.id,
      content: payload.content ?? content,
      userName: payload.userName ?? user.name ?? "",
      avatar: payload.avatar ?? user.avatar ?? "",
      publishTime: payload.publishTime ?? payload.createTime ?? Math.floor(Date.now() / 1000),
      likeCount: Number(payload.likeCount) || 0,
      isLike: false,
      userSourceId: payload.userSourceId ?? payload.operatorId ?? loginUserId,
      replyUserName: replyUserName || payload.replyUserName || "",
      children: [],
    },
  ])

  return (normalized[0] as NewsComment | undefined) ?? null
}

export { extractRecords, ncidNum, resolveProfileId, normalizePostedRecord }

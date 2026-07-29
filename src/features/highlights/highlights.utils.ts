import { FeedMenu } from "@/enums/highlights.enum"

import type {
  CommentItemInterface,
  CommentListResultInterface,
  CommentRecordInterface,
  HighlightVideoInterface,
  VideoFeedResultInterface,
  VideoResultRawInterface,
} from "./highlight.models"
import {
  LATEST_VIDEO_PAGE_SIZE,
  NEWS_TAB_MAP,
  TRENDING_WINDOW_MS,
  VIDEO_NEWS_TYPE,
} from "./highlights.constants"

type RawVideo = Record<string, unknown>

// ─── Shared boolean normalizers ───────────────────────────────────────────────

/** Backend có thể trả boolean, 1/0, "1"/"0", "true"/"false". */
function resolveIsLiked(v: unknown): boolean {
  return v === true || v === 1 || v === "1" || v === "true"
}

// ─── Video filters ────────────────────────────────────────────────────────────

function toVideoTimestamp(value: unknown): number {
  const numeric = Number(value)
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric > 1e11 ? numeric : numeric * 1000
  }
  const parsed = new Date(String(value ?? "")).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

function isVideoPinned(item: RawVideo): boolean {
  const v = item.isTop
  return v === true || v === 1 || v === "1" || v === "true"
}

function isVideoItem(item: RawVideo): boolean {
  if (!item) return false
  const ct = String((item.type ?? item.contentType ?? "") as string).toLowerCase()
  if (ct === "news" || ct === "new" || ct === "article") return false
  if (ct === "video") return true
  const newsType = Number(item.newsType)
  if (Number.isFinite(newsType) && newsType > 0) return newsType === VIDEO_NEWS_TYPE
  return Boolean(item.videoUrl || item.playUrl || item.videoKey || item.durationMillis)
}

function filterFeaturedVideos(videos: RawVideo[]): HighlightVideoInterface[] {
  const cutoff = Date.now() - TRENDING_WINDOW_MS
  return videos
    .filter(isVideoItem)
    .filter((item) => toVideoTimestamp(item.publishTime) >= cutoff)
    .sort(
      (a, b) => (Number(b.commentCount) || 0) - (Number(a.commentCount) || 0)
    ) as unknown as HighlightVideoInterface[]
}

function filterTrendingVideos(videos: RawVideo[]): HighlightVideoInterface[] {
  return videos.filter(isVideoItem).sort((a, b) => {
    const topDiff = (Number(b.topTime) || 0) - (Number(a.topTime) || 0)
    if (topDiff) return topDiff
    return toVideoTimestamp(b.publishTime) - toVideoTimestamp(a.publishTime)
  }) as unknown as HighlightVideoInterface[]
}

function filterLatestVideos(records: RawVideo[]): HighlightVideoInterface[] {
  return records
    .filter(isVideoItem)
    .filter((item) => !isVideoPinned(item))
    .sort(
      (a, b) => toVideoTimestamp(b.publishTime) - toVideoTimestamp(a.publishTime)
    ) as unknown as HighlightVideoInterface[]
}

function resolveLatestVideoFlagIndex(tabIndices: number[]): number {
  const tabs = tabIndices
    .map((idx) => NEWS_TAB_MAP[idx])
    .filter(Boolean)
    .filter((t) => t.abbr !== "basketball" && t.gameId !== 201)

  const hotTab = tabs.find((t) => t.abbr === "hot") ?? tabs[0]
  return hotTab?.index ?? 0
}

/** Map raw backend payload → feed result (dùng chung server + client). */
function buildVideoFeedFromRaw(
  menu: FeedMenu,
  data: VideoResultRawInterface | null | undefined
): VideoFeedResultInterface {
  if (!data) return { videos: [], hasMore: false }

  switch (menu) {
    case FeedMenu.Featured:
      return {
        videos: filterFeaturedVideos((data.videos ?? []) as unknown as RawVideo[]),
        hasMore: false,
      }
    case FeedMenu.Trending:
      return {
        videos: filterTrendingVideos((data.videos ?? []) as unknown as RawVideo[]),
        hasMore: false,
      }
    case FeedMenu.Latest: {
      const raw = (data.records ?? []) as unknown as RawVideo[]
      return {
        videos: filterLatestVideos(raw),
        hasMore: raw.length >= LATEST_VIDEO_PAGE_SIZE,
      }
    }
  }
}

// ─── Comment normalizers ──────────────────────────────────────────────────────

function parseCommentListResult(data: unknown): CommentListResultInterface {
  if (Array.isArray(data)) {
    return { records: data as CommentListResultInterface["records"], total: data.length }
  }
  const obj = data as Record<string, unknown> | null
  const records = (obj?.records ?? obj?.list ?? []) as CommentListResultInterface["records"]
  return { records, total: Number(obj?.total ?? records.length) }
}

function normalizeCommentList(list: unknown[]): CommentItemInterface[] {
  return (Array.isArray(list) ? list : [])
    .filter((c: unknown) => {
      const item = c as Record<string, unknown>
      return item && item.ncid != null && !item.isDeleted
    })
    .map((c: unknown) => {
      const item = c as Record<string, unknown>
      return {
        ...item,
        ncid: item.ncid as string | number,
        isLike: resolveIsLiked(item.isLike),
        children: Array.isArray(item.children)
          ? (item.children as unknown[])
              .filter((r: unknown) => {
                const reply = r as Record<string, unknown>
                return reply && reply.ncid != null && !reply.isDeleted
              })
              .map((r: unknown) => {
                const reply = r as Record<string, unknown>
                return { ...reply, isLike: resolveIsLiked(reply.isLike) } as CommentRecordInterface
              })
          : [],
      } as CommentItemInterface
    })
}

function resolvePostedCommentId(result: unknown): number | null {
  if (result == null || result === "") return null

  if (typeof result === "number" && Number.isFinite(result) && result > 0) {
    return Math.floor(result)
  }

  if (typeof result === "string") {
    const trimmed = result.trim()
    if (/^\d+$/.test(trimmed)) return Number(trimmed)
    try {
      return resolvePostedCommentId(JSON.parse(trimmed))
    } catch {
      return null
    }
  }

  if (typeof result === "object" && !Array.isArray(result)) {
    const r = result as Record<string, unknown>
    const d = r.data as Record<string, unknown> | null | undefined
    const comment = r.comment as Record<string, unknown> | null | undefined
    const vo = r.vo as Record<string, unknown> | null | undefined

    const candidates: unknown[] = [
      r.ncid,
      r.commentId,
      r.id,
      r.typeId,
      r.commentNewsId,
      r.newsCommentId,
      r.data,
      d?.ncid,
      d?.commentId,
      d?.id,
      comment?.ncid,
      comment?.commentId,
      comment?.id,
      vo?.ncid,
      vo?.commentId,
      vo?.id,
      r.result,
    ]

    for (const raw of candidates) {
      const nested = resolvePostedCommentId(raw)
      if (nested) return nested
      const id = Number(raw)
      if (Number.isFinite(id) && id > 0) return id
    }
  }

  return null
}

function stripCommentContent(content: unknown): string {
  return String(content ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function createPendingKey(): string {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function buildPendingPlaceholder(opts: {
  clientKey: string
  content: string
  replyUserName?: string
  userName?: string
  avatar?: string
}): CommentRecordInterface {
  return {
    ncid: opts.clientKey,
    content: opts.content,
    _pending: true,
    _clientKey: opts.clientKey,
    userName: opts.userName ?? "",
    avatar: opts.avatar ?? "",
    replyUserName: opts.replyUserName ?? "",
    children: [],
    publishTime: Math.floor(Date.now() / 1000),
    likeCount: 0,
    isLike: false,
  }
}

function removePendingByKey(
  comments: CommentItemInterface[],
  clientKey: string
): CommentItemInterface[] {
  return comments
    .filter((c) => c._clientKey !== clientKey)
    .map((c) => {
      if (!c.children?.length) return c
      const children = c.children.filter((r) => r._clientKey !== clientKey)
      if (children.length === c.children.length) return c
      return { ...c, children }
    })
}

function replacePendingWithRecord(
  comments: CommentItemInterface[],
  clientKey: string,
  record: CommentRecordInterface,
  parentNcid?: number
): { comments: CommentItemInterface[]; replaced: boolean } {
  let replaced = false

  if (parentNcid) {
    const next = comments.map((c) => {
      if (Number(c.ncid) !== parentNcid) return c
      const children = (c.children ?? []).map((child) => {
        if (child._clientKey !== clientKey) return child
        replaced = true
        return { ...record, children: [] }
      })
      return { ...c, children }
    })
    return { comments: next, replaced }
  }

  const next = comments.map((c) => {
    if (c._clientKey !== clientKey) return c
    replaced = true
    return {
      ...record,
      children: Array.isArray(record.children) ? record.children : [],
    } as CommentItemInterface
  })
  return { comments: next, replaced }
}

function toCommentTimestamp(record: CommentRecordInterface): number {
  const n = Number(record?.publishTime) || 0
  if (!n) return 0
  return n < 1e12 ? n : Math.floor(n / 1000)
}

function isRecentPostedComment(record: CommentRecordInterface, maxAgeSec = 180): boolean {
  const ts = toCommentTimestamp(record)
  if (!ts) return true
  return Math.floor(Date.now() / 1000) - ts <= maxAgeSec
}

function collectKnownCommentIds(comments: CommentItemInterface[]): Set<number> {
  const ids = new Set<number>()
  const walk = (items: CommentRecordInterface[]) => {
    for (const item of items) {
      if (item && item.ncid != null && !item._pending) {
        ids.add(Number(item.ncid))
      }
      if (Array.isArray((item as CommentItemInterface).children)) {
        walk((item as CommentItemInterface).children ?? [])
      }
    }
  }
  walk(comments)
  return ids
}

function pickPostedCommentRecord(
  list: CommentRecordInterface[],
  content: string,
  postedId: number | null,
  knownIds: Set<number>,
  loginUserId: string
): CommentRecordInterface | null {
  if (!list.length) return null
  const normalizedContent = stripCommentContent(content)

  if (postedId) {
    return list.find((r) => Number(r.ncid) === postedId) ?? null
  }

  const candidates = list.filter(
    (r) =>
      String(r.userSourceId) === loginUserId &&
      stripCommentContent(String(r.content ?? "")) === normalizedContent
  )
  if (!candidates.length) return null
  if (candidates.length === 1) return candidates[0]

  const fresh = candidates.filter((r) => r.ncid != null && !knownIds.has(Number(r.ncid)))
  const pool = fresh.length ? fresh : candidates.filter((r) => isRecentPostedComment(r))
  if (!pool.length) return null

  return pool.reduce<CommentRecordInterface | null>((best, r) => {
    if (!best) return r
    return toCommentTimestamp(r) >= toCommentTimestamp(best) ? r : best
  }, null)
}

export type { RawVideo }
export {
  resolveIsLiked,
  filterFeaturedVideos,
  filterTrendingVideos,
  filterLatestVideos,
  resolveLatestVideoFlagIndex,
  buildVideoFeedFromRaw,
  parseCommentListResult,
  normalizeCommentList,
  resolvePostedCommentId,
  stripCommentContent,
  createPendingKey,
  buildPendingPlaceholder,
  removePendingByKey,
  replacePendingWithRecord,
  collectKnownCommentIds,
  pickPostedCommentRecord,
}

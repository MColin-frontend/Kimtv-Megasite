import "server-only"

import { getRequest } from "@/server/services/request"
import { getServerLoginUserId } from "@/lib/auth-server"

import { FeedMenu } from "@/enums/highlights.enum"

import type { InitialHighlightsDataInterface, VideoResultRawInterface } from "../highlight.models"
import { HIGHLIGHTS_API } from "../highlights.constants"
import { buildVideoFeedFromRaw, resolveLatestVideoFlagIndex } from "../highlights.utils"

const EMPTY: InitialHighlightsDataInterface = { videos: [], hasMore: false }

function getLatestVideoFlagIndex(): Promise<number> {
  return getRequest<number[]>(HIGHLIGHTS_API.VIDEO.NEWS_TAB)
    .then((data) => (Array.isArray(data) ? resolveLatestVideoFlagIndex(data) : 0))
    .catch(() => 0)
}

function fetchInitialHighlights(
  menu: FeedMenu = FeedMenu.Featured
): Promise<InitialHighlightsDataInterface> {
  return getServerLoginUserId().then((loginUserId) => {
    switch (menu) {
      case FeedMenu.Featured:
        return getRequest<VideoResultRawInterface>(HIGHLIGHTS_API.VIDEO.POPULAR, {
          params: { gameIds: "", loginUserId },
        }).then((data) => (data ? buildVideoFeedFromRaw(menu, data) : EMPTY))

      case FeedMenu.Trending:
        return getRequest<VideoResultRawInterface>(HIGHLIGHTS_API.VIDEO.FEATURED, {
          params: { gameIds: "", loginUserId },
        }).then((data) => (data ? buildVideoFeedFromRaw(menu, data) : EMPTY))

      case FeedMenu.Latest:
        return getLatestVideoFlagIndex().then((flagIndex) =>
          getRequest<VideoResultRawInterface>(HIGHLIGHTS_API.VIDEO.LATEST(flagIndex, 1), {
            params: { tabType: flagIndex, type: "video", pageIndex: 1, loginUserId },
          }).then((data) => (data ? buildVideoFeedFromRaw(menu, data) : EMPTY))
        )
    }
  })
}

export { fetchInitialHighlights }

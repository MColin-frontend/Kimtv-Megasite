import { resolveInitialMenu } from "@/features/highlights/api/highlights.api"
import { fetchInitialHighlights } from "@/features/highlights/api/highlights.server"

import { HighlightsFeed } from "./feed"

interface HighlightsPageProps {
  highlightStatus?: string
}

export async function HighlightsPage({ highlightStatus }: HighlightsPageProps) {
  const menu = resolveInitialMenu(highlightStatus)
  const { videos, hasMore } = await fetchInitialHighlights(menu)

  return (
    <section className="flex min-h-[calc(100vh-72px)] flex-col bg-black max-md:h-full max-md:overflow-hidden">
      <div className="container mx-auto flex flex-1 flex-col px-4 py-2.5 max-md:h-full max-md:px-0 max-md:py-0">
        <HighlightsFeed initialVideos={videos} initialMenu={menu} initialHasMore={hasMore} />
      </div>
    </section>
  )
}

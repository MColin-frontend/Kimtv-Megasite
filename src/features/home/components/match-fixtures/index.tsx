import { Suspense } from "react"

import { fetchFeaturedNewsAction, fetchPopularNewsAction } from "@/features/home/home.api"

import Fixtures from "./fixtures"
import News from "./news"
import { HighlightsSkeleton, NewsSectionSkeleton } from "./news/skeleton"

function NewsSidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <HighlightsSkeleton />
      <NewsSectionSkeleton />
    </div>
  )
}

async function hasNewsContent(): Promise<boolean> {
  const [popular, featured] = await Promise.all([
    fetchPopularNewsAction(),
    fetchFeaturedNewsAction(),
  ])
  return popular.length > 0 || featured.length > 0
}

export default async function MatchFixtures() {
  const showSidebar = await hasNewsContent()

  return (
    <section className="flex w-full gap-4 max-lg:flex-col">
      {/* Fixtures */}
      <div className={showSidebar ? "min-w-0 flex-1 max-lg:order-2" : "w-full"}>
        <Fixtures />
      </div>

      {/* News sidebar — mobile: lên trên full width, desktop: sticky sidebar */}
      {showSidebar && (
        <div className="news-sidebar sticky top-23 w-[min(30vw,420px)] shrink-0 self-start max-lg:static max-lg:order-1 max-lg:w-full">
          <Suspense fallback={<NewsSidebarSkeleton />}>
            <News />
          </Suspense>
        </div>
      )}
    </section>
  )
}

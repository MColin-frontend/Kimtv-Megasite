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
    <section className="grid grid-cols-10 gap-4 max-lg:flex max-lg:flex-col">
      {/* Fixtures */}
      <div className={showSidebar ? "col-span-7 max-lg:order-2" : "col-span-10"}>
        <Fixtures />
      </div>

      {/* News sidebar — mobile: lên trên full width, desktop: sticky sidebar */}
      {showSidebar && (
        <div className="news-sidebar col-span-3 self-start lg:sticky lg:top-19">
          <Suspense fallback={<NewsSidebarSkeleton />}>
            <News />
          </Suspense>
        </div>
      )}
    </section>
  )
}

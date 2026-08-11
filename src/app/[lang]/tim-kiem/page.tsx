import { Suspense } from "react"

import { createMetadata } from "@/lib/metadata"

import { getDictionary } from "@/i18n"
import type { LocaleType } from "@/i18n"
import { getRoutes } from "@/config/routes"

import { SearchPage } from "@/features/search/components"
import { SEARCH_QUERY_KEY } from "@/features/search/search.schema"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { lang } = await params
  const { [SEARCH_QUERY_KEY]: q } = await searchParams
  const dict = await getDictionary(lang as LocaleType)
  const routes = getRoutes(lang as LocaleType)
  const query = typeof q === "string" ? q.trim() : ""
  const { meta } = dict.search

  return createMetadata({
    title: query ? meta["title-with-query"].replace("{query}", query) : meta.title,
    description: meta.description,
    keywords: ["tìm kiếm bóng đá", "KimTV"],
    alternates: { canonical: routes.search },
  })
}

export default function TimKiemPage() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  )
}

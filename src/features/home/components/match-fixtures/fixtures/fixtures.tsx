"use client"

import { useMemo } from "react"

import { useFixtureData } from "@/hooks/use-fixture-data"
import { useFixturesFilter } from "@/hooks/use-fixtures-filter"

import { FixtureList, groupMatches } from "@/components/ui/match/fixture-list"

function FixturesList() {
  const filter = useFixturesFilter()
  const { filteredMatches, total, loading } = useFixtureData(filter)
  const groups = useMemo(() => groupMatches(filteredMatches), [filteredMatches])

  return (
    <FixtureList
      groups={groups}
      loading={loading}
      page={filter.page}
      pageSize={filter.pageSize}
      total={total}
      onPageChange={filter.setPage}
    />
  )
}

export default FixturesList

"use client"

import { useMemo } from "react"

import { useFixtureData } from "@/hooks/use-fixture-data"
import { useFixturesFilter } from "@/hooks/use-fixtures-filter"

import { groupMatches, Fixtures } from "@/components/ui/match/fixtures"

function FixturesList() {
  const filter = useFixturesFilter()
  const { filteredMatches, total, loading } = useFixtureData(filter)
  const groups = useMemo(() => groupMatches(filteredMatches), [filteredMatches])

  return (
    <Fixtures
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

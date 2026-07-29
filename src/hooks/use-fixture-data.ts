"use client"

import { useEffect, useMemo, useState, useTransition } from "react"

import { fetchAllAction, fetchPageAction } from "@/server/actions/slide.action"
import { buildMatchApiConfig } from "@/lib/match.utils"
import type { FixtureFilterStateInterface } from "@/hooks/use-fixtures-filter"

import { MATCH_STATUS_TAB } from "@/constants/component/home.constants"
import { MatchStatusEnum } from "@/enums/match.enum"
import type { MatchInterface } from "@/models/match.models"

export function useFixtureData({
  status,
  pickedDate,
  leagueIds,
  page,
  pageSize,
}: FixtureFilterStateInterface) {
  const [allMatches, setAllMatches] = useState<MatchInterface[]>([])
  const [total, setTotal] = useState(0)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const pickedDateTs = Math.floor(
      new Date(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate()).getTime() /
        1000
    )
    const { endpoint, method, params, paginate } = buildMatchApiConfig(
      status,
      pickedDateTs,
      leagueIds
    )

    if (paginate === false) {
      startTransition(async () => {
        const data = await fetchAllAction<MatchInterface>(endpoint, method, params)
        setAllMatches(data)
        setTotal(data.length)
      })
    } else {
      startTransition(async () => {
        const { data, total: t } = await fetchPageAction<MatchInterface>(
          endpoint,
          method,
          params,
          page,
          pageSize
        )
        setAllMatches(data || [])
        setTotal(t)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pickedDate.toDateString(), page, pageSize, leagueIds.join(",")])

  const filteredMatches = useMemo(() => {
    let result = [...allMatches]
    if (status !== MATCH_STATUS_TAB.ALL && status !== MATCH_STATUS_TAB.LIVE) {
      const statusMap: Partial<Record<string, number>> = {
        [MATCH_STATUS_TAB.UPCOMING]: MatchStatusEnum.UPCOMING,
        [MATCH_STATUS_TAB.FINISHED]: MatchStatusEnum.FINISHED,
      }
      const target = statusMap[status]
      if (target !== undefined) {
        result = result.filter((m) => m.status === target || m.status === MatchStatusEnum.UNKNOWN)
      }
    }
    return result
  }, [allMatches, status])

  return { filteredMatches, total, loading: isPending }
}

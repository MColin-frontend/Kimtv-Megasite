"use client"

import { useEffect, useState } from "react"

const TICK_MS = 1_000

export function useFakeGameMinute(gameTime: number | null | undefined, isActive: boolean): number {
  const baseMinute = gameTime ?? 0
  const hasTime = !!gameTime && gameTime > 0
  const [minute, setMinute] = useState(baseMinute)

  useEffect(() => {
    if (!isActive || !hasTime) return

    const startedAt = Date.now()
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 60_000)
      setMinute(baseMinute + elapsed)
    }

    tick()
    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [baseMinute, hasTime, isActive])

  return isActive && hasTime ? minute : baseMinute
}

"use client"

import { useEffect, useState } from "react"

export interface CountdownResult {
  hours: number
  minutes: number
  seconds: number
}

export function useCountdown(startTime: number | null | undefined): CountdownResult {
  const [countdown, setCountdown] = useState<CountdownResult>({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!startTime) return
    const update = () => {
      const diff = startTime * 1000 - Date.now()
      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 })
        return
      }
      const total = Math.floor(diff / 1000)
      setCountdown({
        hours: Math.floor(total / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startTime])

  return countdown
}

"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

import { handleLikeNews } from "@/features/news/news.api"
import { Typography } from "@/components/ui/typography"

interface LikeButtonProps {
  newsId: string | number
  initialLikeCount?: number
  initialIsLike?: boolean | string | number | null
}

export function LikeButton({ newsId, initialLikeCount = 0, initialIsLike }: LikeButtonProps) {
  const { user, isLoggedIn, login } = useAuth()
  const [isLike, setIsLike] = useState<boolean>(() => !!initialIsLike)
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount)
  const [busy, setBusy] = useState<boolean>(false)

  const loginUserId = user?.userId != null ? String(user.userId) : user?.uid ? String(user.uid) : ""

  async function handleClick() {
    if (busy) return
    if (!isLoggedIn || !loginUserId) {
      login()
      return
    }
    const next = !isLike
    setIsLike(next)
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)))
    setBusy(true)
    try {
      const res = await handleLikeNews({ typeId: String(newsId), isLike: next, loginUserId })
      if (res === null) {
        setIsLike(!next)
        setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="flex items-center gap-2 transition-opacity disabled:opacity-60"
    >
      <Heart
        className={cn(
          "size-5 transition-colors",
          isLike ? "fill-red-500 stroke-red-500" : "stroke-white/50"
        )}
        aria-hidden="true"
      />
      <Typography variant="body-sm" color="foreground/50">
        {likeCount}
      </Typography>
    </button>
  )
}

"use client"

import { VideoPlayer } from "@/components/ui/video"

import { buildStreamSources } from "../api/live.api"

interface LiveVideoPlayerProps {
  liveUrls?: Array<{ liveUrl: string | null; liveUrlFlv: string | null }>
}

export function LiveVideoPlayer({ liveUrls = [] }: LiveVideoPlayerProps) {
  const sources = liveUrls.flatMap((u, i) =>
    buildStreamSources(u.liveUrl, u.liveUrlFlv, `#${i + 1}`)
  )

  return <VideoPlayer key={sources[0]?.url ?? "no-source"} sources={sources} isLive autoplay />
}

"use client"

interface MatchLiveIndicatorProps {
  label?: string
}

export function MatchLiveIndicator({ label = "LIVE" }: MatchLiveIndicatorProps) {
  return (
    <div className="relative flex items-center gap-1.5 overflow-visible">
      <div className="pointer-events-none absolute inset-0 -z-10 scale-150 animate-pulse rounded-full bg-red-600/40 blur-md" />
      <div className="rounded-6 shadow-live-red relative flex items-center gap-1.5 bg-red-600 px-2.5 py-1 max-sm:gap-1 max-sm:px-1.5 max-sm:py-0.5">
        <span className="relative flex size-2.5 shrink-0 max-sm:size-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"
            style={{ animationDuration: "0.8s" }}
          />
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40"
            style={{ animationDuration: "1.2s", animationDelay: "0.2s" }}
          />
          <span className="shadow-white-dot relative inline-flex size-2.5 rounded-full bg-white max-sm:size-2" />
        </span>
        <span className="text-12 font-800 max-sm:text-10 max-sm:tracking-2 tracking-widest text-white uppercase">
          {label}
        </span>
      </div>
    </div>
  )
}

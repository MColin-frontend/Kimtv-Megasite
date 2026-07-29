interface StreamLiveBadgeProps {
  label: string
  className?: string
}

export function StreamLiveBadge({ label, className }: StreamLiveBadgeProps) {
  return (
    <div className={`relative flex items-center gap-1.5 overflow-visible ${className ?? ""}`}>
      <div className="pointer-events-none absolute inset-0 -z-10 scale-150 animate-pulse rounded-full bg-red-600/40 blur-md" />
      <div className="rounded-6 relative flex h-[30px] items-center gap-1.5 bg-red-600 px-2.5 shadow-[0_0_12px_rgba(220,38,38,0.6)] max-sm:h-5 max-sm:gap-0.5 max-sm:px-1.5">
        <span className="relative flex size-2.5 shrink-0 max-sm:size-1.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"
            style={{ animationDuration: "0.8s" }}
          />
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40"
            style={{ animationDuration: "1.2s", animationDelay: "0.2s" }}
          />
          <span className="relative inline-flex size-2.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)] max-sm:size-1.5" />
        </span>
        <span className="text-12 font-800 tracking-widest text-white uppercase max-sm:text-10">{label}</span>
      </div>
    </div>
  )
}

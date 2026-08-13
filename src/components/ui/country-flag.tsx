import {
  getCountryFlagUrl,
  getGlobeIconUrl,
  hasCountryFlag,
  toCountryIso,
  type CountryFlagRatio,
} from "@/lib/country.utils"
import { cn } from "@/lib/utils"

export interface CountryFlagProps {
  /** Tên quốc gia (England, Việt Nam, …) — sẽ map sang ISO. */
  country?: string | null
  /** Mã ISO / subdivision (`vn`, `GB-ENG`, `eu`). Ưu tiên hơn `country`. */
  code?: string | null
  title?: string
  className?: string
  ratio?: CountryFlagRatio
}

export function CountryFlag({ country, code, title, className, ratio = "4x3" }: CountryFlagProps) {
  const iso = code?.trim() ? code.trim().toLowerCase() : toCountryIso(country)
  const useGlobe = !hasCountryFlag(iso)

  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG CDN, không cần next/image
    <img
      src={useGlobe ? getGlobeIconUrl() : getCountryFlagUrl(iso!, { ratio })}
      alt={title ?? (useGlobe ? "Quốc tế" : iso!)}
      title={title}
      className={cn(
        "inline-block size-4 shrink-0",
        useGlobe ? "object-contain" : "object-cover",
        className
      )}
      loading="lazy"
      decoding="async"
    />
  )
}

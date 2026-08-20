const MEDIA_ERR_LABELS: Record<number, string> = {
  1: "MEDIA_ERR_ABORTED",
  2: "MEDIA_ERR_NETWORK",
  3: "MEDIA_ERR_DECODE",
  4: "MEDIA_ERR_SRC_NOT_SUPPORTED",
}

export function resolveStreamPlayerError(raw: unknown): {
  errorCode: string
  errorMessage: string
} {
  if (raw == null) return { errorCode: "UNKNOWN", errorMessage: "" }

  const e = raw as Record<string, unknown>
  const nested = (e.error ?? e.err ?? e.data) as Record<string, unknown> | undefined
  const video =
    (e.video as HTMLVideoElement | undefined) ||
    (e.media as HTMLVideoElement | undefined) ||
    (e.target as HTMLVideoElement | undefined)
  const mediaError = video?.error ?? (nested as { code?: number; message?: string } | undefined)

  if (mediaError?.code != null) {
    const code = Number(mediaError.code)
    return {
      errorCode: String(code),
      errorMessage: mediaError.message || MEDIA_ERR_LABELS[code] || "media_error",
    }
  }

  const code =
    e.code ??
    e.errorCode ??
    e.errCode ??
    e.errorType ??
    nested?.code ??
    nested?.errorCode ??
    nested?.errorType
  const message =
    e.message ??
    e.msg ??
    e.errorMessage ??
    e.ex ??
    nested?.message ??
    nested?.msg ??
    nested?.errorMessage

  if (code != null || message != null) {
    return {
      errorCode: code != null ? String(code) : "UNKNOWN",
      errorMessage: message != null ? String(message) : "",
    }
  }

  if (typeof raw === "string") return { errorCode: "UNKNOWN", errorMessage: raw }

  try {
    return { errorCode: "UNKNOWN", errorMessage: JSON.stringify(raw) }
  } catch {
    return { errorCode: "UNKNOWN", errorMessage: String(raw) }
  }
}

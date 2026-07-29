export const env = {
  nodeEnv: (process.env.NODE_ENV ?? "development") as "development" | "production" | "test",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",

  // Backend KimTV (Java) — base URL đã bao gồm prefix `/java`.
  // KHÔNG hard-code URL trong source — cấu hình qua .env (xem .env.example).
  // Biến non-`NEXT_PUBLIC_` được resolve lúc RUNTIME trên server (compose nạp `.env`).
  apiBaseUrl: process.env.API_BASE_URL ?? "",

  // Origin/Referer gửi kèm request — backend/Cloudflare có thể kiểm tra nguồn.
  apiOrigin: process.env.API_ORIGIN ?? "",

  // Timeout request (ms). Hủy request nếu backend không phản hồi kịp.
  apiTimeoutMs: Number(process.env.API_TIMEOUT_MS) || 15_000,

  // WebSocket chat — biến `NEXT_PUBLIC_` được INLINE lúc `next build`
  // → phải truyền qua Docker build-arg (xem Dockerfile / workflow).
  // prod: wss://ws.kimtv.net | dev: wss://ws-dev.kimtv.net
  wsBaseUrl: process.env.NEXT_PUBLIC_WS_BASE_URL ?? "",

  // VIP API — external service, client-side accessible.
  vipApiBaseUrl: process.env.NEXT_PUBLIC_VIP_API_BASE_URL ?? "https://api.99kim.llc",
} as const

/**
 * Kiểm tra các biến môi trường bắt buộc cho HTTP client (server-only).
 *
 * Gọi lúc RUNTIME (khi thực sự phát request) — cố ý KHÔNG chạy ở top-level
 * để `next build` không fail khi chưa có `.env`. Nếu thiếu env trên server,
 * lỗi sẽ nêu rõ tên biến còn thiếu thay vì gọi tới base URL rỗng.
 */
export function assertServerEnv(): void {
  const missing: string[] = []
  if (!env.apiBaseUrl) missing.push("API_BASE_URL")
  if (!env.apiOrigin) missing.push("API_ORIGIN")

  if (missing.length > 0) {
    throw new Error(
      `[env] Thiếu biến môi trường bắt buộc: ${missing.join(", ")}. ` +
        "Tạo file .env (tham khảo .env.example) hoặc set env trên server."
    )
  }
}

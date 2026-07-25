/* ── Enums ───────────────────────────────────────────────── */

export const CHAT_MESSAGE_TYPE = {
  ORDINARY: "ORDINARY",
  VIRTUAL: "VIRTUAL",
  GIFT: "GIFT",
  WELCOME: "WELCOME",
} as const

export const CHAT_USER_ROLE = {
  ADMIN: "ADMIN",
  ANCHOR: "ANCHOR",
  HOUSING_MANAGEMENT: "HOUSING_MANAGEMENT",
  ORDINARY: "ORDINARY",
  NOT_LOGIN: "NOT_LOGIN",
} as const

export const CHAT_CONNECTION_STATUS = {
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
} as const

/* ── Symbols ─────────────────────────────────────────────── */

export const CHAT_SYMBOLS = {
  PIN: "📌",
  CLOSE: "×",
  EXPAND: "▼",
  COLLAPSE: "▲",
} as const

/* ── VIP icons ───────────────────────────────────────────── */

const CDN = "https://kimtv-oss.99kimtvs.top"

export const CHAT_VIP_ICONS = {
  /** Từ CDN vì chưa có file local */
  SVIP: `${CDN}/images/svip_icon.png`,
  VIP: `${CDN}/images/vip_icon.png`,
  level: (n: number) => `/images/chat/vip${Math.min(12, Math.max(0, Math.floor(n || 0)))}.png`,
} as const

/* ── Social names ────────────────────────────────────────── */

export const CHAT_SOCIAL_NAMES = {
  TELEGRAM: "Telegram",
  FACEBOOK: "Facebook",
  ZALO: "Zalo",
} as const

/* ── Layout ──────────────────────────────────────────────── */
export const CHAT_INPUT_HEIGHT = "h-[46px]"
export const CHAT_MSG_PADDING = "px-[18px]"
export const CHAT_POPUP_WIDTH = "w-[418px]"
export const CHAT_ADMIN_BTN = "h-[50px] w-[220px]"
export const CHAT_REPORT_BTN_WIDTH = "w-[184px]"

/* ── Social platform colors ──────────────────────────────── */
export const CHAT_SOCIAL_COLORS = {
  telegram: { bg: "#0088cc", hover: "#0099dd" },
  facebook: { bg: "#1877f2", hover: "#2d8bf4" },
  zalo: { bg: "#0068ff", hover: "#1a78ff" },
} as const

/* ── Scrollbar style ─────────────────────────────────────── */
export const CHAT_SCROLLBAR_STYLE = {
  scrollbarWidth: "thin" as const,
  scrollbarColor: "var(--chat-surface) var(--chat-bg)",
}

/* ── Tailwind class shortcuts ────────────────────────────── */
export const CHAT_CLASSES = {
  bg: "bg-chat-bg",
  surface: "bg-chat-surface",
  text: "text-chat-text",
  status: "text-chat-status",
  pin: "text-chat-pin",
  username: "text-[#3d9aff]",
  muted: "text-chat-muted",
  vipUser: "text-chat-vip-user",
  vipWelcome: "text-chat-vip-welcome",
  anchor: "text-chat-anchor",
  link: "text-chat-link",
  gift: "text-chat-gift",
  adminGradient: "bg-gradient-to-b from-[var(--chat-admin-from)] to-[var(--chat-admin-to)]",
} as const

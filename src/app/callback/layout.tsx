import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Đang xử lý đăng nhập…",
}

export default function CallbackLayout({ children }: { children: React.ReactNode }) {
  return children
}

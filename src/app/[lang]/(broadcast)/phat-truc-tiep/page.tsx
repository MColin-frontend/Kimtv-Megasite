import { createMetadata } from "@/lib/metadata"
import { getRoutes } from "@/config/routes"
import type { LocaleType } from "@/i18n"

import { BroadcastPage } from "@/features/broadcast/components"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const path = getRoutes(lang as LocaleType).broadcast
  return createMetadata({
    title: "Phát trực tiếp",
    description:
      "Đăng ký và quản lý buổi phát sóng bình luận bóng đá trực tiếp trên KimTV — trở thành BLV, xây cộng đồng riêng.",
    keywords: ["phát trực tiếp", "bình luận viên", "BLV bóng đá", "livestream thể thao", "KimTV"],
    alternates: { canonical: path },
    openGraph: { url: path },
  })
}

export default function Page() {
  return <BroadcastPage />
}

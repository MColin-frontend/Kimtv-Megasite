import { createMetadata } from "@/lib/metadata"

import { UserInfoPage } from "@/features/user-info/components"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params
  const path = `/${lang}/nguoi-dung/${id}`
  return createMetadata({
    title: "Thông tin người dùng",
    description:
      "Hồ sơ người dùng KimTV — tin đã đăng, video, người theo dõi và hoạt động trên cộng đồng bóng đá.",
    keywords: ["hồ sơ người dùng", "KimTV", "cộng đồng bóng đá"],
    alternates: { canonical: path },
    openGraph: { url: path },
  })
}

export default function Page() {
  return <UserInfoPage />
}

import { getRequest } from "@/server/services/request"
import { createMetadata } from "@/lib/metadata"

import type { LocaleType } from "@/i18n"
import { getRoutes } from "@/config/routes"

import { UserInfoPage } from "@/features/user-info/components"
import { USER_INFO_API } from "@/features/user-info/user-info.constants"
import type { UserInfoModel } from "@/features/user-info/user-info.models"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params
  const path = getRoutes(lang as LocaleType).userInfo(id)

  const user = await getRequest<UserInfoModel>(USER_INFO_API.PROFILE, {
    params: { userId: id },
  } as Parameters<typeof getRequest>[1]).catch(() => null)

  const name = user?.name?.trim() || null
  const title = name ? `${name} — KimTV` : "Hồ sơ người dùng | KimTV"
  const description = name
    ? `Xem hồ sơ ${name} trên KimTV — bài viết, video${user?.followerCount ? `, ${user.followerCount} người theo dõi` : ""} và hoạt động cộng đồng bóng đá.`
    : "Hồ sơ người dùng KimTV — bài viết đã đăng, video, người theo dõi và hoạt động cộng đồng bóng đá."

  return createMetadata({
    title,
    description,
    keywords: ["hồ sơ người dùng", "KimTV", "cộng đồng bóng đá", ...(name ? [name] : [])],
    alternates: { canonical: path },
    openGraph: {
      url: path,
      title,
      description,
      images: user?.avatar ? [{ url: user.avatar, alt: title }] : undefined,
    },
  })
}

export default function Page() {
  return <UserInfoPage />
}

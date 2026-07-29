import { createMetadata } from "@/lib/metadata"

export { SchedulePage as default } from "@/features/schedule/components"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const path = `/${lang}/lich-thi-dau`
  return createMetadata({
    title: "Lịch thi đấu",
    description:
      "Lịch thi đấu bóng đá hôm nay và các ngày tới trên KimTV — cập nhật giờ đá, giải đấu, đội hình và tỉ số.",
    keywords: [
      "lịch thi đấu",
      "lịch bóng đá hôm nay",
      "giờ đá bóng",
      "lịch Premier League",
      "lịch V-League",
      "KimTV",
    ],
    alternates: { canonical: path },
    openGraph: { url: path },
  })
}

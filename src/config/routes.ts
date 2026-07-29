import { localePath, type LocaleType } from "@/i18n"

export const getRoutes = (locale: LocaleType) => ({
  home: `/${locale}`,
  schedule: localePath(locale, "lich-thi-dau"),
  liveScore: localePath(locale, "ti-so-truc-tuyen"),
  liveSchedule: localePath(locale, "lich-truc-tiep"),
  results: localePath(locale, "ket-qua"),
  standings: localePath(locale, "bxh"),
  news: {
    index: localePath(locale, "tin-tuc"),
    article: (slug: string) => localePath(locale, "tin-tuc", slug),
  },
  video: {
    index: localePath(locale, "video"),
    article: (slug: string) => localePath(locale, "video", slug),
  },
  data: localePath(locale, "du-lieu"),
  profile: localePath(locale, "ho-so"),
  broadcast: localePath(locale, "phat-truc-tiep"),
  broadcastCenter: localePath(locale, "trung-tam-phat-truc-tiep"),
  auth: {
    login: localePath(locale, "dang-nhap"),
    register: localePath(locale, "dang-ky"),
  },
  inviteFriend: localePath(locale, "moi-ban"),
  userInfo: (userId: string | number) => localePath(locale, "nguoi-dung", String(userId)),
  live: (matchId: string | number, gameId: number) =>
    `${localePath(locale, "truc-tiep", String(matchId))}?game_id=${gameId}`,
})

export type Routes = ReturnType<typeof getRoutes>

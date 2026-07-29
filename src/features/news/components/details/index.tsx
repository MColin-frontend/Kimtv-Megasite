import Link from "next/link"
import { notFound } from "next/navigation"
import { Heart, MessageCircle } from "lucide-react"

import { formatPublishTime } from "@/lib/date"

import { getTranslation } from "@/i18n/get-locale"
import { getRoutes } from "@/config/routes"
import { FOOTBALL_GAME_ID } from "@/constants/component/home.constants"

import { fetchHotNewsByGameAction, fetchNewsArticleAction } from "@/features/news/news.server"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Img } from "@/components/ui/image"
import { Typography } from "@/components/ui/typography"

import { CommentSection } from "./comment-section"
import { FollowButton } from "./follow-button"

export async function NewsArticlePage({ slug }: { slug: string }) {
  const [detail, hotData] = await Promise.all([
    fetchNewsArticleAction(slug),
    fetchHotNewsByGameAction(FOOTBALL_GAME_ID),
  ])

  if (!detail?.newsId) notFound()

  const { t, locale } = await getTranslation()
  const routes = getRoutes(locale)

  return (
    <div className="container py-8 max-lg:py-6 max-md:py-4">
      <Breadcrumb
        className="mb-6"
        items={[
          { label: t("header.nav.home"), href: routes.home },
          { label: t("header.nav.news"), href: routes.news.index },
          { label: detail.title },
        ]}
      />

      <div className="flex flex-col gap-8 xl:flex-row">
        {/* ── Article content ── */}
        <article className="flex min-w-0 flex-1 flex-col gap-6">
          <Typography variant="h1" className="leading-tight text-white">
            {detail.title}
          </Typography>

          {/* Author row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Link href={routes.userInfo(detail.authorId || "")}>
                <Avatar size={40}>
                  <AvatarImage src={detail.userAvatar} />
                </Avatar>
              </Link>

              <div className="flex flex-col gap-0.5">
                {detail.userName && (
                  <Typography variant="body-sm" weight="600" className="text-white">
                    {detail.userName}
                  </Typography>
                )}
                {detail.publishTime && (
                  <Typography variant="caption" color="foreground/40">
                    {formatPublishTime(detail.publishTime)}
                  </Typography>
                )}
              </div>
              <FollowButton authorId={detail.authorId} initialFollow={detail.hasFollow} />
            </div>

            <div className="ml-auto flex items-center gap-5">
              <span className="flex items-center gap-2">
                <MessageCircle className="size-5 text-white/50" />
                <Typography variant="body-sm" color="foreground/50">
                  {detail.commentCount ?? 0}
                </Typography>
              </span>
              <span className="flex items-center gap-2">
                <Heart className="size-5 text-white/50" />
                <Typography variant="body-sm" color="foreground/50">
                  {detail.likeCount ?? 0}
                </Typography>
              </span>
            </div>
          </div>

          {/* Summary */}
          {detail.summary && (
            <Typography variant="body" className="border-gold border-l-4 pl-4 text-white/70 italic">
              {detail.summary}
            </Typography>
          )}

          {/* Cover image if no HTML content */}
          {!detail.content && detail.coverUrl && (
            <Img
              src={detail.coverUrl}
              alt={detail.title}
              width={860}
              height={480}
              rounded="8"
              objectFit="cover"
              className="w-full"
            />
          )}

          {/* HTML content */}
          {detail.content && (
            <div
              className="prose prose-invert [&_a]:text-blue max-w-none text-white/80 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_img]:max-w-full [&_img]:rounded-lg [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: detail.content }}
            />
          )}

          {/* Image gallery */}
          {detail.pics && detail.pics.length > 0 && (
            <div className="flex flex-col gap-3">
              {detail.pics.map((src, i) => (
                <Img
                  key={i}
                  src={src}
                  alt=""
                  width={860}
                  height={480}
                  rounded="8"
                  objectFit="cover"
                  className="w-full"
                />
              ))}
            </div>
          )}

          <CommentSection
            newsId={detail.newsId}
            newsType={detail.newsType ?? 1}
            initialCount={detail.commentCount ?? 0}
          />
        </article>

        {/* ── Sidebar ── */}
        <aside className="w-full shrink-0 xl:sticky xl:top-[80px] xl:max-h-[calc(100vh-88px)] xl:w-[380px] xl:self-start xl:overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* Tin nổi bật */}
            {hotData.news.length > 0 && (
              <div className="card-glow rounded-12 panel-news flex flex-col gap-3 p-4">
                <Typography variant="h2" className="text-white">
                  {t("news.popular")}
                </Typography>
                <div className="flex flex-col gap-1">
                  {hotData.news.map((item, index) => (
                    <Link
                      key={String(item.newsId)}
                      href={routes.news.article(String(item.newsId))}
                      className="group rounded-8 hover:bg-blue/[0.07] -mx-1 flex items-start gap-3 px-1 py-2 transition-all"
                    >
                      <span
                        className={`rounded-4 text-12 font-700 flex size-5 shrink-0 items-center justify-center ${
                          index === 0
                            ? "bg-gold text-[#0a1128]"
                            : index === 1
                              ? "bg-white/20 text-white"
                              : index === 2
                                ? "bg-white/10 text-white/70"
                                : "text-foreground/40 bg-transparent"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <Typography
                        variant="body-sm"
                        weight="600"
                        className="group-hover:text-gold line-clamp-2 text-white transition-colors"
                      >
                        {item.title}
                      </Typography>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Video nổi bật */}
            {hotData.videos.length > 0 && (
              <div className="card-glow rounded-12 panel-news flex flex-col gap-3 p-4">
                <Typography variant="h2" className="text-white">
                  {t("news.hot-videos")}
                </Typography>
                <div className="flex flex-col gap-3">
                  {hotData.videos.map((item) => (
                    <Link
                      key={String(item.newsId)}
                      href={routes.news.article(String(item.newsId))}
                      className="group rounded-10 hover:bg-blue/[0.07] -mx-1 flex gap-3 px-1 py-2 transition-all"
                    >
                      <div className="rounded-8 relative aspect-video w-[120px] shrink-0 overflow-hidden bg-[#0a1128]">
                        <Img
                          src={item.coverUrl}
                          alt={item.title}
                          fill
                          objectFit="contain"
                          sizes="120px"
                          wrapperClassName="absolute inset-0"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <Typography
                          variant="body-sm"
                          weight="600"
                          className="group-hover:text-gold line-clamp-3 text-white transition-colors"
                        >
                          {item.title}
                        </Typography>
                        <div className="mt-auto flex items-center justify-between pt-1">
                          {item.userName && (
                            <Typography
                              variant="caption"
                              color="foreground/50"
                              className="truncate"
                            >
                              {item.userName}
                            </Typography>
                          )}
                          <div className="ml-auto flex shrink-0 items-center gap-2">
                            {item.likeCount != null && (
                              <span className="flex items-center gap-1">
                                <Heart className="text-foreground/30 size-3" aria-hidden="true" />
                                <Typography variant="caption" color="foreground/40">
                                  {item.likeCount}
                                </Typography>
                              </span>
                            )}
                            {item.commentCount != null && (
                              <span className="flex items-center gap-1">
                                <MessageCircle
                                  className="text-foreground/30 size-3"
                                  aria-hidden="true"
                                />
                                <Typography variant="caption" color="foreground/40">
                                  {item.commentCount}
                                </Typography>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

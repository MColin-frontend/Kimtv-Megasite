import type { NewsPanelProps } from "@/features/news/news.models"
import { Img } from "@/components/ui/image"
import { ScrollReveal, StaggerReveal } from "@/components/ui/scroll-reveal"
import { Typography } from "@/components/ui/typography"

import { NewsItemRow } from "./item"
import { NewsMetaRow, NewsPanelHeader } from "./shared"

export function NewsLatestPanel({
  items,
  title,
  viewAllHref,
  viewAllLabel,
  categoryLabel,
  getHref,
}: NewsPanelProps) {
  if (!items.length) return null

  const featured = items[0]
  const sideItems = items.slice(1)

  return (
    <div className="card-glow rounded-12 flex flex-col gap-5 p-5 max-md:gap-3 max-md:p-3">
      <NewsPanelHeader title={title} viewAllHref={viewAllHref} viewAllLabel={viewAllLabel} />

      <div className="grid grid-cols-1 items-stretch gap-5 max-md:gap-3 md:grid-cols-2">
        <ScrollReveal variant="fade-up" duration={550} distance={20}>
          <a
            href={getHref(String(featured.newsId))}
            className="card-glow group rounded-10 relative block h-full min-h-[280px] overflow-hidden bg-[#0a1128] transition-all hover:ring-1 hover:ring-white/20"
          >
            <Img
              src={featured.coverUrl}
              alt={featured.title}
              fill
              objectFit="cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
              wrapperClassName="absolute inset-0"
              className="transition-transform duration-300 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(36,43,53,0.1) 0%, rgba(36,43,53,0.5) 55%, rgba(36,43,53,0.88) 100%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-4">
              <Typography variant="overline" className="text-gold">
                {categoryLabel}
              </Typography>
              <Typography
                variant="body"
                weight="600"
                className="group-hover:text-gold line-clamp-3 text-white transition-colors"
              >
                {featured.title}
              </Typography>
              <NewsMetaRow item={featured} />
            </div>
          </a>
        </ScrollReveal>

        {sideItems.length > 0 && (
          <StaggerReveal
            variant="fade-up"
            stagger={60}
            duration={400}
            className="flex h-full flex-col gap-1"
          >
            {sideItems.map((item) => (
              <NewsItemRow
                key={String(item.newsId)}
                item={item}
                href={getHref(String(item.newsId))}
                categoryLabel={categoryLabel}
                className="min-h-0 flex-1"
              />
            ))}
          </StaggerReveal>
        )}
      </div>
    </div>
  )
}

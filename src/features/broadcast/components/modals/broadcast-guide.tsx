"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog } from "@base-ui/react/dialog"
import { BookOpen, X } from "lucide-react"

import { useTranslation } from "@/i18n/use-translation"

import { getBroadcastGuideSteps } from "@/features/broadcast/broadcast.constants"
import { Typography } from "@/components/ui/typography"

export function GuideButton() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const steps = getBroadcastGuideSteps(t)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-8 flex items-center gap-1.5 bg-amber-400/10 px-3 py-1.5 text-amber-400 transition-all hover:bg-amber-400/20"
      >
        <BookOpen className="size-3.5" />
        <Typography variant="caption" weight="500" className="text-inherit">
          {t("broadcast.guide.button")}
        </Typography>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="rounded-12 relative flex max-h-[70vh] w-full max-w-5xl flex-col overflow-hidden border border-white/10 bg-[#0d1829] shadow-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-6 py-4">
                <div>
                  <Typography variant="h5" className="text-white">
                    {t("broadcast.guide.title")}
                  </Typography>
                  <Typography variant="caption" className="text-amber-400">
                    {t("broadcast.guide.subtitle")}
                  </Typography>
                </div>
                <Dialog.Close className="rounded-8 p-1.5 text-white/40 transition-colors hover:bg-white/8 hover:text-white">
                  <X className="size-5" />
                </Dialog.Close>
              </div>

              <div className="flex flex-col gap-6 overflow-y-auto px-6 py-6">
                {steps.map(({ title, images }) => (
                  <div key={title} className="flex flex-col gap-2">
                    <Typography variant="label" weight="600" className="text-white/90">
                      {title}
                    </Typography>
                    <div className="flex flex-col gap-2">
                      {images.map((src, i) => (
                        <div
                          key={i}
                          className="rounded-8 w-full overflow-hidden border border-white/8 bg-black"
                        >
                          <Image
                            src={src}
                            alt={`${title} - ${i + 1}`}
                            width={800}
                            height={450}
                            className="h-auto w-full object-contain"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="rounded-8 border border-amber-400/20 bg-amber-400/5 px-4 py-3">
                  <Typography variant="caption" weight="500" className="text-amber-400">
                    {t("broadcast.guide.notice")}
                  </Typography>
                </div>
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

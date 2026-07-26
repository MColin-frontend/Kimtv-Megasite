"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { Dialog } from "@base-ui/react/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"

import { useTranslation } from "@/i18n/use-translation"

import { fetchAnchorInfo, updateAnchor } from "@/features/broadcast/broadcast.api"
import {
  createRoomOwnerSchema,
  type RoomOwnerFormType,
} from "@/features/broadcast/broadcast.schema"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form/form-field"
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { TextEditor } from "@/components/ui/text-editor"
import { Typography } from "@/components/ui/typography"

export function RoomOwnerModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: (data: RoomOwnerFormType) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const schema = useMemo(() => createRoomOwnerSchema(t), [t])

  const { data: anchorInfo } = useQuery({
    queryKey: ["anchor-info"],
    queryFn: fetchAnchorInfo,
    staleTime: Infinity,
  })

  const { control, handleSubmit, reset } = useForm<RoomOwnerFormType>({
    resolver: zodResolver(schema),
    defaultValues: { intro: "", introDetail: "", announcement: "", images: [] },
  })

  useEffect(() => {
    if (!open || !anchorInfo) return
    reset({
      intro: anchorInfo.brief ?? "",
      introDetail: anchorInfo.detailIntroduce ?? "",
      announcement: anchorInfo.content ?? "",
      images: anchorInfo.introduceImages ?? [],
    })
  }, [open, anchorInfo]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: RoomOwnerFormType) {
    await updateAnchor({
      brief: data.intro,
      detailIntroduce: data.introDetail,
      introduceImages: data.images,
      content: data.announcement,
    })
    await queryClient.invalidateQueries({ queryKey: ["anchor-info"] })
    onSaved(data)
    onClose()
  }

  function handleCancel() {
    reset()
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-gradient-to-br from-black/70 via-[#020b1f]/65 to-black/70 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-16 panel-news relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative flex shrink-0 items-center justify-between px-6 py-4">
              <div>
                <Typography variant="h5" className="text-white">
                  {t("broadcast.room-owner.title")}
                </Typography>
                <Typography variant="caption" className="text-white/35">
                  {t("broadcast.room-owner.subtitle")}
                </Typography>
              </div>
              <Dialog.Close
                type="button"
                className="rounded-10 flex size-8 items-center justify-center text-white/30 transition-all hover:bg-white/8 hover:text-white"
              >
                <X className="size-4" />
              </Dialog.Close>
              <div className="absolute inset-x-6 bottom-0 h-px bg-white/6" />
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
              <FormField
                control={control}
                name="intro"
                label={t("broadcast.room-owner.fields.intro.label")}
                required
                rules={{ required: t("broadcast.room-owner.fields.intro.error") }}
                render={(field) => (
                  <Input
                    {...field}
                    placeholder={t("broadcast.room-owner.fields.intro.placeholder")}
                    inputSize="default"
                  />
                )}
              />
              <FormField
                control={control}
                name="introDetail"
                label={t("broadcast.room-owner.fields.intro-detail.label")}
                required
                rules={{ required: t("broadcast.room-owner.fields.intro-detail.error") }}
                render={(field) => (
                  <TextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("broadcast.room-owner.fields.intro-detail.placeholder")}
                  />
                )}
              />
              <FormField
                control={control}
                name="announcement"
                label={t("broadcast.room-owner.fields.announcement.label")}
                required
                rules={{ required: t("broadcast.room-owner.fields.announcement.error") }}
                render={(field) => (
                  <TextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("broadcast.room-owner.fields.announcement.placeholder")}
                  />
                )}
              />
              <FormField
                control={control}
                name="images"
                label={t("broadcast.room-owner.fields.images.label")}
                required
                rules={{
                  validate: (v) =>
                    (v as string[]).length > 0 || t("broadcast.room-owner.fields.images.error"),
                }}
                render={(field) => (
                  <ImageUpload value={field.value as string[]} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="relative flex shrink-0 gap-3 px-6 py-4">
              <div className="absolute inset-x-6 top-0 h-px bg-white/6" />
              <Button type="button" variant="cancel" className="flex-1" onClick={handleCancel}>
                {t("broadcast.room-owner.actions.cancel")}
              </Button>
              <Button type="submit" variant="gradient" className="flex-1">
                {t("broadcast.room-owner.actions.save")}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

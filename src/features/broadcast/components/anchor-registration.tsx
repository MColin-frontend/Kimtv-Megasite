"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { CheckCheck, Send } from "lucide-react"

import { useTranslation } from "@/i18n/use-translation"

import { applyAnchor } from "@/features/broadcast/broadcast.api"
import {
  APPLY_FORM_DEFAULTS,
  ApplyFormType,
  ApplySchema,
} from "@/features/broadcast/broadcast.constants"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form/form-field"
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Typography } from "@/components/ui/typography"

import anchorHero from "@assets/images/broadcast/img-anchor-registration-hero.png"

export function AnchorRegistrationSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <Skeleton className="rounded-12 h-[350px] w-full" />

      <div className="card-glow rounded-16 flex flex-col gap-6 p-6 max-sm:p-4">
        {/* Section: thông tin cá nhân */}
        <div className="flex flex-col gap-4">
          <Skeleton className="rounded-4 h-4 w-32" />
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="rounded-4 h-3.5 w-24" />
                <Skeleton className="rounded-8 h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="rounded-4 h-3.5 w-28" />
          <Skeleton className="rounded-8 h-20 w-full" />
        </div>

        {/* Section: CMND/CCCD */}
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-1.5">
            <Skeleton className="rounded-4 h-3.5 w-32" />
            <Skeleton className="rounded-4 h-3 w-48" />
          </div>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="rounded-4 h-3.5 w-24" />
                <Skeleton className="rounded-8 aspect-video w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="rounded-8 h-11 w-full max-w-sm" />
          <Skeleton className="rounded-4 h-3 w-56" />
        </div>
      </div>
    </div>
  )
}

export function AnchorRegistrationPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [submitted, setSubmitted] = useState(false)

  const { control, handleSubmit, watch } = useForm<ApplyFormType>({
    resolver: zodResolver(ApplySchema),
    defaultValues: APPLY_FORM_DEFAULTS,
  })

  const briefValue = watch("brief")

  async function onSubmit(data: ApplyFormType) {
    await applyAnchor(data)
    await queryClient.invalidateQueries({ queryKey: ["anchor-info"] })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="card-glow rounded-16 flex flex-col items-center gap-5 px-8 py-16 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/15">
          <CheckCheck className="size-10 text-emerald-400" />
        </div>
        <div className="flex flex-col gap-2">
          <Typography variant="h3" className="text-white">
            {t("broadcast.registration.form.success-title")}
          </Typography>
          <Typography variant="body" className="text-white/50">
            {t("broadcast.registration.form.success-desc")}
          </Typography>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Hero */}
      <Image
        src={anchorHero}
        alt={t("broadcast.registration.title")}
        width={1400}
        className="rounded-12 max-h-[350px]"
        priority
      />

      <div className="card-glow rounded-16 flex flex-col gap-6 p-6 max-sm:p-4">
        <div className="flex flex-col gap-4">
          <Typography variant="body-sm" weight="600" className="text-white/60">
            {t("broadcast.registration.form.section-info")}
          </Typography>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <FormField
              control={control}
              name="name"
              label={t("broadcast.registration.form.name")}
              required
              render={(field) => (
                <Input {...field} placeholder={t("broadcast.registration.form.name-placeholder")} />
              )}
            />
            <FormField
              control={control}
              name="phone"
              label={t("broadcast.registration.form.phone")}
              required
              render={(field) => (
                <Input
                  {...field}
                  inputMode="numeric"
                  placeholder={t("broadcast.registration.form.phone-placeholder")}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                />
              )}
            />
            <FormField
              control={control}
              name="idNumber"
              label={t("broadcast.registration.form.id-number")}
              required
              render={(field) => (
                <Input
                  {...field}
                  placeholder={t("broadcast.registration.form.id-number-placeholder")}
                />
              )}
            />
          </div>
        </div>

        <FormField
          control={control}
          name="brief"
          label={t("broadcast.registration.form.brief")}
          required
          render={(field) => (
            <div className="relative">
              <Textarea
                {...field}
                rows={3}
                maxLength={40}
                placeholder={t("broadcast.registration.form.brief-placeholder")}
                className="pr-14"
              />
              <span className="text-12 absolute right-3 bottom-2 text-white/30">
                {briefValue.length}/40
              </span>
            </div>
          )}
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <Typography variant="body-sm" weight="600" className="text-white/60">
              {t("broadcast.registration.form.section-id")}
            </Typography>
            <Typography variant="caption" className="text-white/30">
              {t("broadcast.registration.form.section-id-hint")}
            </Typography>
          </div>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <FormField
              control={control}
              name="idFront"
              label={t("broadcast.registration.form.id-front")}
              required
              render={(field) => (
                <ImageUpload
                  value={field.value ? [field.value] : []}
                  onChange={(urls) => field.onChange(urls[0] ?? "")}
                  multiple={false}
                  max={1}
                />
              )}
            />
            <FormField
              control={control}
              name="idBack"
              label={t("broadcast.registration.form.id-back")}
              required
              render={(field) => (
                <ImageUpload
                  value={field.value ? [field.value] : []}
                  onChange={(urls) => field.onChange(urls[0] ?? "")}
                  multiple={false}
                  max={1}
                />
              )}
            />
            <FormField
              control={control}
              name="idHolding"
              label={t("broadcast.registration.form.id-holding")}
              required
              render={(field) => (
                <ImageUpload
                  value={field.value ? [field.value] : []}
                  onChange={(urls) => field.onChange(urls[0] ?? "")}
                  multiple={false}
                  max={1}
                />
              )}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button type="submit" variant="gradient" size="lg" className="w-full max-w-sm gap-2">
            <Send className="size-4" />
            {t("broadcast.registration.form.submit")}
          </Button>
          <Typography variant="caption" className="text-white/25">
            {t("broadcast.registration.form.tip")}
          </Typography>
        </div>
      </div>
    </form>
  )
}

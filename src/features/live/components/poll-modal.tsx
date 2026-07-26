"use client"

import { useMemo, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { Dialog } from "@base-ui/react/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChartBarStacked,
  Check,
  Clock,
  GripVertical,
  LayoutList,
  Minus,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { useTranslation } from "@/i18n"

import {
  POLL_DURATION_PRESETS,
  POLL_MAX_OPTIONS,
  POLL_MIN_OPTIONS,
  POLL_QUESTION_MAX,
  POLL_RATING_SCALE_PRESETS,
  POLL_TYPE_API_MAP,
  POLL_TYPE_CONFIG,
  PollTypeEnum,
  type PollTypeValue,
} from "@/features/live/poll.constants"
import type { PollInterface } from "@/features/live/poll.models"
import { createPollSchema, POLL_DEFAULTS, type PollFormType } from "@/features/live/poll.schema"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Typography } from "@/components/ui/typography"

/* ── Poll type card ──────────────────────────────────────── */

interface PollTypeCardProps {
  type: PollTypeValue
  selected: boolean
  onClick: () => void
}

function PollTypeCard({ type, selected, onClick }: PollTypeCardProps) {
  const { t } = useTranslation()
  const { icon: Icon, labelKey, descKey } = POLL_TYPE_CONFIG[type]
  const label = t(labelKey as Parameters<typeof t>[0])
  const desc = t(descKey as Parameters<typeof t>[0])
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-10 relative flex flex-1 flex-row items-center gap-3 border px-3.5 py-3 text-left transition-all duration-200",
        selected
          ? "border-gold/40 shadow-modal-gold"
          : "border-white/8 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]"
      )}
      style={
        selected
          ? {
              background:
                "radial-gradient(ellipse 140% 180% at 100% 0%, rgba(246,195,67,0.2) 0%, rgba(246,195,67,0.05) 50%, transparent 75%)",
            }
          : undefined
      }
    >
      {selected && (
        <div className="rounded-tr-10 absolute top-0 right-0 overflow-hidden">
          {/* Triangle */}
          <div
            style={{
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth: "0 36px 36px 0",
              borderColor: "transparent #f6c343 transparent transparent",
            }}
          />
          <Check
            className="absolute top-[4px] right-[4px] size-3.5 text-[#0c1526]"
            strokeWidth={3.5}
          />
        </div>
      )}
      <div
        className={cn(
          "rounded-10 flex size-12 shrink-0 items-center justify-center transition-all duration-200",
          selected
            ? "bg-gold shadow-[0_0_24px_rgba(246,195,67,0.65),0_0_48px_rgba(246,195,67,0.25)]"
            : "border border-white/8 bg-white/[0.04]"
        )}
      >
        <Icon
          className={cn("size-6", selected ? "text-[#0c1526]" : "text-white/35")}
          strokeWidth={1.8}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Typography
          as="span"
          variant="label"
          weight="700"
          className={cn("leading-none", selected ? "text-gold" : "text-white/90")}
        >
          {label}
        </Typography>
        <Typography
          as="span"
          variant="body-sm"
          className={cn("leading-snug text-white", selected ? "text-white/70" : "text-white/45")}
        >
          {desc}
        </Typography>
      </div>
    </button>
  )
}

/* ── Step ────────────────────────────────────────────────── */

interface StepProps {
  index: string
  label: string
  required?: boolean
  extra?: React.ReactNode
  isLast?: boolean
  children: React.ReactNode
}

function Step({ index, label, required, extra, isLast, children }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="border-gold/35 from-gold/15 to-gold/5 relative flex size-9 shrink-0 items-center justify-center rounded-full border bg-gradient-to-b shadow-[0_0_12px_rgba(246,195,67,0.12)]">
          <Typography
            as="span"
            variant="label"
            weight="800"
            className="text-gold drop-shadow-gold tabular-nums"
          >
            {index}
          </Typography>
        </div>
        {!isLast && (
          <div className="from-gold/20 my-1.5 w-px flex-1 bg-gradient-to-b via-white/6 to-transparent" />
        )}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-3", !isLast ? "pb-6" : "pb-2")}>
        <div className="flex items-center justify-between">
          <Typography as="span" variant="body-sm" weight="600" className="text-white/90">
            {label}
            {required && <span className="text-gold/50 ml-0.5">*</span>}
          </Typography>
          {extra}
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Props ───────────────────────────────────────────────── */

interface PollModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: PollFormType) => void
  activePoll?: PollInterface | null
  onEndPoll?: () => Promise<void>
}

/* ── Main ────────────────────────────────────────────────── */

export function PollModal({ open, onOpenChange, onSubmit, activePoll, onEndPoll }: PollModalProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => createPollSchema(t), [t])
  const [customMinutes, setCustomMinutes] = useState<number>(1)
  const [ending, setEnding] = useState<boolean>(false)

  const isActive = !!activePoll && activePoll.status === "ACTIVE"

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid },
  } = useForm<PollFormType>({
    resolver: zodResolver(schema),
    defaultValues: POLL_DEFAULTS,
    mode: "onChange",
  })

  // Pre-fill form khi có activePoll
  useMemo(() => {
    if (!activePoll) {
      reset(POLL_DEFAULTS)
      return
    }
    const pollType = POLL_TYPE_API_MAP[activePoll.type]
    reset({
      pollType,
      question: activePoll.question,
      options: activePoll.options.map((o) => ({ value: o.label })),
      duration: String(activePoll.remainingSec),
      minSelect: activePoll.minSelect ?? undefined,
      maxSelect: activePoll.maxSelect ?? undefined,
    })
  }, [activePoll?.pollId])

  const { fields, append, remove } = useFieldArray({ control, name: "options" })
  const question = useWatch({ control, name: "question" })
  const pollType = useWatch({ control, name: "pollType" })
  const duration = useWatch({ control, name: "duration" })
  const minSelect = useWatch({ control, name: "minSelect" })
  const maxSelect = useWatch({ control, name: "maxSelect" })
  const isCustom = duration === "custom"
  const maxOptions = POLL_MAX_OPTIONS

  /* step numbering — dynamic based on poll type */
  const hasMinMax = pollType === PollTypeEnum.MULTIPLE || pollType === PollTypeEnum.RATING
  const hasOptions = pollType !== PollTypeEnum.RATING
  let stepNum = 1
  const stepQ = String(stepNum++).padStart(2, "0")
  const stepO = hasOptions ? String(stepNum++).padStart(2, "0") : null
  const stepMM = hasMinMax ? String(stepNum++).padStart(2, "0") : null
  const stepT = String(stepNum++).padStart(2, "0")

  function handleTypeChange(type: PollTypeValue) {
    setValue("pollType", type, { shouldValidate: true })
    setValue(
      "minSelect",
      type === PollTypeEnum.MULTIPLE ? 1 : type === PollTypeEnum.RATING ? 1 : undefined
    )
    setValue(
      "maxSelect",
      type === PollTypeEnum.MULTIPLE
        ? Math.min(3, fields.length)
        : type === PollTypeEnum.RATING
          ? 5
          : undefined
    )
  }

  function onValid(data: PollFormType) {
    if (isCustom) data = { ...data, duration: String(customMinutes * 60) }
    onSubmit?.(data)
    handleClose()
  }

  function handleClose() {
    if (!isActive) {
      reset(POLL_DEFAULTS)
      setCustomMinutes(1)
    }
    onOpenChange(false)
  }

  async function handleEnd() {
    setEnding(true)
    try {
      await onEndPoll?.()
    } finally {
      setEnding(false)
    }
  }

  const isLast = (step: string | null) => step === stepT

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4 max-sm:items-end max-sm:p-0">
          <Dialog.Popup
            className={cn(
              "panel-news w-[90vw] max-w-[600px] overflow-hidden",
              "border-gold/20 shadow-modal-gold border",
              "rounded-12 max-sm:rounded-t-12 max-sm:rounded-b-none",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 max-sm:data-open:slide-in-from-bottom-4",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
            )}
          >
            <div className="via-gold/50 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-10 border-gold/25 from-gold/15 flex size-9 shrink-0 items-center justify-center border bg-gradient-to-b to-transparent shadow-[0_0_16px_rgba(246,195,67,0.25)]">
                  <ChartBarStacked className="text-gold drop-shadow-gold size-[18px]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Dialog.Title className="flex items-center gap-2">
                    <Typography
                      variant="label"
                      weight="700"
                      className="tracking-wide text-white uppercase"
                    >
                      {t("live.poll.title")}
                    </Typography>
                    <Typography
                      as="span"
                      variant="body-sm"
                      weight="600"
                      className="border-live-green/30 bg-live-green-bg text-live-green rounded-4 border px-1.5 py-px tracking-wider"
                    >
                      LIVE
                    </Typography>
                  </Dialog.Title>
                  <Typography variant="body-sm" className="text-white/35">
                    {t("live.poll.subtitle")}
                  </Typography>
                </div>
              </div>
              <Dialog.Close
                onClick={handleClose}
                className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-all duration-200 hover:rotate-90 hover:bg-white/10 hover:text-white/70"
              >
                <X className="size-3.5" />
              </Dialog.Close>
            </div>

            {/* Poll type tabs */}
            <div className="border-y border-white/[0.06] bg-white/[0.01] px-5 py-3">
              <div className="mb-3 flex items-center gap-2">
                <LayoutList className="text-gold/70 size-5 shrink-0" />
                <Typography as="span" variant="body-sm" weight="600" className="text-white/90">
                  {t("live.poll.type.label")}
                </Typography>
              </div>
              <div className="flex gap-2">
                {(
                  [
                    PollTypeEnum.SINGLE,
                    PollTypeEnum.MULTIPLE,
                    PollTypeEnum.RATING,
                  ] as PollTypeValue[]
                ).map((type) => (
                  <PollTypeCard
                    key={type}
                    type={type}
                    selected={pollType === type}
                    onClick={() => handleTypeChange(type)}
                  />
                ))}
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

            {/* Body — steps */}
            <form onSubmit={handleSubmit(onValid)}>
              <div
                className={cn(
                  "h-[65vh] overflow-y-auto px-5 pt-5 pb-3",
                  isActive && "pointer-events-none opacity-60"
                )}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.06) transparent",
                }}
              >
                {/* Câu hỏi */}
                <Step
                  index={stepQ}
                  label={t("live.poll.steps.question")}
                  required
                  isLast={isLast(stepQ)}
                >
                  <FormField
                    control={control}
                    name="question"
                    render={(field) => (
                      <div className="relative">
                        <Textarea
                          {...field}
                          placeholder={t("live.poll.placeholder.question")}
                          rows={3}
                          className="pb-7"
                        />
                        <Typography
                          as="span"
                          variant="body-sm"
                          className={cn(
                            "absolute right-3 bottom-2.5 tabular-nums",
                            (question?.length ?? 0) >= POLL_QUESTION_MAX
                              ? "text-red-400/70"
                              : "text-white/20"
                          )}
                        >
                          {question?.length ?? 0}/{POLL_QUESTION_MAX}
                        </Typography>
                      </div>
                    )}
                  />
                </Step>

                {/* Lựa chọn */}
                {stepO && (
                  <Step
                    index={stepO}
                    label={t("live.poll.steps.options")}
                    required
                    isLast={isLast(stepO)}
                    extra={
                      <Typography
                        as="span"
                        variant="body-sm"
                        className="rounded-full bg-white/5 px-2 py-0.5 text-white/30 tabular-nums"
                      >
                        {fields.length}
                        {`/${maxOptions}`}
                      </Typography>
                    }
                  >
                    <div
                      className="flex flex-col gap-1.5"
                      style={
                        fields.length > 6
                          ? {
                              maxHeight: "240px",
                              overflowY: "auto",
                              scrollbarWidth: "thin",
                              scrollbarColor: "rgba(255,255,255,0.06) transparent",
                            }
                          : undefined
                      }
                    >
                      {fields.map((field, i) => (
                        <FormField
                          key={field.id}
                          control={control}
                          name={`options.${i}.value`}
                          render={(f) => (
                            <div className="flex items-center gap-2">
                              <Typography
                                as="span"
                                variant="body-sm"
                                weight="700"
                                className="border-gold/20 bg-gold/8 text-gold/70 flex size-5 shrink-0 items-center justify-center rounded-full border"
                              >
                                {i + 1}
                              </Typography>
                              <Input {...f} placeholder={`Lựa chọn ${i + 1}`} inputSize="sm" />
                              <GripVertical className="size-4 shrink-0 cursor-grab text-white/12" />
                              {fields.length > POLL_MIN_OPTIONS && (
                                <button
                                  type="button"
                                  onClick={() => remove(i)}
                                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-white/15 transition-colors hover:bg-red-500/10 hover:text-red-400/60"
                                >
                                  <Trash2 className="size-3" />
                                </button>
                              )}
                            </div>
                          )}
                        />
                      ))}
                    </div>
                    {fields.length < maxOptions && (
                      <button
                        type="button"
                        onClick={() => append({ value: "" })}
                        className="rounded-8 hover:border-gold/25 hover:text-gold/50 mt-1.5 flex w-full items-center justify-center gap-1.5 border border-dashed border-white/10 py-2 text-white/25 transition-colors"
                      >
                        <Plus className="size-3" />
                        <Typography as="span" variant="body-sm">
                          {t("live.poll.actions.add-option")}
                        </Typography>
                      </button>
                    )}
                    <Typography as="p" variant="body-sm" className="mt-1.5 text-white/25">
                      ①{" "}
                      {t("live.poll.labels.option-hint")
                        .replace("{min}", String(POLL_MIN_OPTIONS))
                        .replace("{max}", String(maxOptions))}
                    </Typography>
                  </Step>
                )}

                {/* Min / Max */}
                {stepMM && (
                  <Step
                    index={stepMM}
                    label={t(
                      hasOptions ? "live.poll.steps.min-max" : "live.poll.steps.rating-scale"
                    )}
                    required
                    isLast={isLast(stepMM)}
                  >
                    {pollType === PollTypeEnum.RATING && (
                      <div className="mb-3 flex gap-2">
                        {POLL_RATING_SCALE_PRESETS.map((preset) => {
                          const active = minSelect === preset.min && maxSelect === preset.max
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setValue("minSelect", preset.min, { shouldValidate: true })
                                setValue("maxSelect", preset.max, { shouldValidate: true })
                              }}
                              className={cn(
                                "rounded-8 flex items-center gap-1.5 border px-3 py-1.5 transition-all",
                                active
                                  ? "border-gold/40 bg-gold/10 shadow-modal-gold"
                                  : "border-white/8 bg-white/[0.03] hover:border-white/15"
                              )}
                            >
                              <Star
                                className={cn("size-3", active ? "text-gold" : "text-white/25")}
                              />
                              <Typography
                                as="span"
                                variant="body-sm"
                                weight="500"
                                className={active ? "text-gold" : "text-white/45"}
                              >
                                {preset.label}
                              </Typography>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Typography as="span" variant="body-sm" className="shrink-0 text-white/75">
                        {t(
                          hasOptions ? "live.poll.labels.min-select" : "live.poll.labels.min-rating"
                        )}
                      </Typography>
                      <FormField
                        control={control}
                        name="minSelect"
                        render={(f) => (
                          <input
                            type="number"
                            min={1}
                            max={hasOptions ? fields.length : undefined}
                            placeholder="1"
                            value={f.value ?? ""}
                            onChange={(e) =>
                              f.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                            }
                            onBlur={f.onBlur}
                            className="rounded-8 text-16 font-600 focus:border-gold/40 w-16 border border-white/8 bg-white/[0.04] px-2 py-1.5 text-center text-white transition-colors outline-none hover:border-white/15"
                          />
                        )}
                      />

                      <Typography as="span" variant="label" className="shrink-0 px-1 text-white/30">
                        –
                      </Typography>

                      <Typography as="span" variant="body-sm" className="shrink-0 text-white/75">
                        {t(
                          hasOptions ? "live.poll.labels.max-select" : "live.poll.labels.max-rating"
                        )}
                      </Typography>
                      <FormField
                        control={control}
                        name="maxSelect"
                        render={(f) => (
                          <input
                            type="number"
                            min={1}
                            max={hasOptions ? fields.length : undefined}
                            placeholder={hasOptions ? String(fields.length) : "5"}
                            value={f.value ?? ""}
                            onChange={(e) =>
                              f.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                            }
                            onBlur={f.onBlur}
                            className="rounded-8 text-16 font-600 focus:border-gold/40 w-16 border border-white/8 bg-white/[0.04] px-2 py-1.5 text-center text-white transition-colors outline-none hover:border-white/15"
                          />
                        )}
                      />

                      {hasOptions && hasMinMax && (
                        <Typography as="span" variant="body-sm" className="shrink-0 text-white/40">
                          / {fields.length} {t("live.poll.labels.option-count")}
                        </Typography>
                      )}
                    </div>
                  </Step>
                )}

                {/* Thời gian */}
                <Step index={stepT} label={t("live.poll.steps.duration")} required isLast>
                  <div className="flex flex-wrap gap-2">
                    {POLL_DURATION_PRESETS.map((preset) => {
                      const active = duration === preset.value
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() =>
                            setValue("duration", preset.value, { shouldValidate: true })
                          }
                          className={cn(
                            "rounded-8 flex items-center gap-1.5 border px-3 py-1.5 transition-all",
                            active
                              ? "border-gold/40 bg-gold/10 shadow-modal-gold"
                              : "border-white/8 bg-white/[0.03] hover:border-white/15"
                          )}
                        >
                          <Clock
                            className={cn(
                              "size-3 shrink-0",
                              active ? "text-gold" : "text-white/25"
                            )}
                          />
                          <Typography
                            as="span"
                            variant="body-sm"
                            weight="500"
                            className={active ? "text-gold" : "text-white/50"}
                          >
                            {t(preset.labelKey)}
                          </Typography>
                        </button>
                      )
                    })}
                  </div>
                  {isCustom && (
                    <div className="mt-3 flex flex-col gap-2">
                      <Typography as="span" variant="body-sm" className="text-white/40">
                        {t("live.poll.labels.custom-duration")}
                      </Typography>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCustomMinutes((m) => Math.max(0.5, +(m - 0.5).toFixed(1)))
                          }
                          className="rounded-8 flex size-8 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-white/50 transition-colors hover:border-white/20 hover:text-white/80"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <div className="rounded-8 focus-within:border-gold/40 flex flex-1 items-center border border-white/8 bg-white/[0.03] px-3 py-1.5">
                          <input
                            type="number"
                            min={0.5}
                            max={1440}
                            step={0.5}
                            value={customMinutes}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value)
                              if (!isNaN(v) && v > 0) setCustomMinutes(Math.min(1440, v))
                            }}
                            className="text-14 font-700 text-gold w-full bg-transparent text-center tabular-nums outline-none"
                          />
                          <Typography
                            as="span"
                            variant="body-sm"
                            className="ml-1 shrink-0 text-white/30"
                          >
                            {t("live.poll.labels.minutes")}
                          </Typography>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomMinutes((m) => Math.min(1440, m + 1))}
                          className="rounded-8 flex size-8 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-white/50 transition-colors hover:border-white/20 hover:text-white/80"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <Typography as="span" variant="body-sm" className="text-white/25">
                        {t("live.poll.labels.max-duration")}
                      </Typography>
                    </div>
                  )}
                </Step>
              </div>

              {/* Footer */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
              <div className="flex gap-2.5 px-5 py-4">
                <Button type="button" variant="cancel" className="flex-1" onClick={handleClose}>
                  {t("live.poll.actions.cancel")}
                </Button>
                {isActive ? (
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1 gap-2 border border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25"
                    disabled={ending}
                    onClick={handleEnd}
                  >
                    {ending ? "..." : t("live.poll.actions.end")}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="gradient"
                    className="font-700 flex-1 gap-2 text-black"
                    disabled={!isValid}
                  >
                    {t("live.poll.actions.submit")} <ChartBarStacked className="size-4" />
                  </Button>
                )}
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

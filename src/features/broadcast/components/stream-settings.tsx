"use client"

import React, { Fragment, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { ReactSVG } from "react-svg"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, Loader2, MonitorPlay, Pencil, UserCircle } from "lucide-react"

import { useDisclosure } from "@/hooks/useDisclosure"
import { useRouter } from "@/hooks/useRouter"

import { useTranslation } from "@/i18n/use-translation"
import { getRoutes } from "@/config/routes"

import {
  BROADCAST_API,
  cancelReservation,
  createAnchorLive,
  downcastStream,
  fetchAnchorInfo,
  fetchIsBroadcastWithTime,
  startBroadcast,
  toggleMatchId,
  type BroadcastMatchGroup,
  type CreateAnchorLiveResult,
  type ToggleMatchIdPayload,
} from "@/features/broadcast/broadcast.api"
import {
  BroadcastStepEnum,
  convertMatchGroupsToLeagueOptions,
  convertMatchGroupsToOptions,
  ExternalCommentEnum,
  getCustomBroadcastTypeOptions,
  getExternalCommentOptions,
  getLiveModeOptions,
  getLoginRequiredOptions,
  getMatchStatusOptions,
  getScheduledOptions,
  getSportOptions,
  getStreamTypeOptions,
  LiveModeEnum,
  LoginRequiredEnum,
  MATCH_STATUS_MAP,
  reverseEnum,
  ScheduledEnum,
  STREAM_SETTINGS_DEFAULTS,
  STREAM_TYPE_MAP,
  StreamTypeEnum,
  VIEWSTYLE_MAP,
} from "@/features/broadcast/broadcast.constants"
import {
  createStreamSettingsSchema,
  type StreamSettingsFormType,
} from "@/features/broadcast/broadcast.schema"
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/datepicker"
import { FormField } from "@/components/ui/form/form-field"
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { ConfirmModal } from "@/components/ui/modal/confirm"
import { Select } from "@/components/ui/select/select"
import { SelectAsync } from "@/components/ui/select/select-async"
import { Skeleton } from "@/components/ui/skeleton"
import { TextEditor } from "@/components/ui/text-editor"
import { toast } from "@/components/ui/toast"
import { Typography } from "@/components/ui/typography"

import icLiveMode from "@assets/icons/broadcast/ic-live-mode.svg"

import { GuideButton } from "./modals/broadcast-guide"
import { RoomOwnerModal } from "./modals/room-owner"
import { StreamField } from "./stream-panel"

function Label({ required, children }: { required?: boolean; children: React.ReactNode }) {
  return (
    <Typography variant="body-sm" weight="500" className="text-white/80">
      {required && <span className="mr-0.5 text-red-400">*</span>}
      {children}
    </Typography>
  )
}

export function StreamSettings({ liveId = 528 }: { liveId?: number }) {
  const { t, locale } = useTranslation()
  const { getParam, setParams, push } = useRouter()
  const { state, open, close } = useDisclosure("ownerModal")
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [cancelResOpen, setCancelResOpen] = useState(false)
  const queryClient = useQueryClient()
  const SESSION_STEP_KEY = "broadcast:step"
  const rawStep = (getParam("step") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem(SESSION_STEP_KEY)
      : null)) as BroadcastStepEnum | null

  function setStep(
    value: BroadcastStepEnum | null,
    opts?: { replace?: boolean; scroll?: boolean }
  ) {
    if (typeof window !== "undefined") {
      if (value) sessionStorage.setItem(SESSION_STEP_KEY, value)
      else sessionStorage.removeItem(SESSION_STEP_KEY)
    }
    setParams({ step: value }, { replace: true, scroll: false, ...opts })
  }
  const liveResult = queryClient.getQueryData<CreateAnchorLiveResult>(["live-result"]) || null
  const togglePayload = queryClient.getQueryData<ToggleMatchIdPayload>(["toggle-payload"]) || null

  const { mutateAsync: submitLive, isPending: isSubmitting } = useMutation({
    mutationFn: createAnchorLive,
  })
  const { mutateAsync: doToggle, isPending: isToggling } = useMutation({
    mutationFn: toggleMatchId,
  })
  const { mutateAsync: doStart, isPending: isStarting } = useMutation({
    mutationFn: startBroadcast,
  })
  const { mutateAsync: doDowncast, isPending: isDowncasting } = useMutation({
    mutationFn: downcastStream,
  })
  const { mutateAsync: doCancelRes, isPending: isCancellingRes } = useMutation({
    mutationFn: cancelReservation,
  })

  const isAnyLoading = isSubmitting || isToggling || isStarting || isDowncasting || isCancellingRes
  const isRightLoading = isSubmitting || isStarting || isDowncasting

  const schema = useMemo(() => createStreamSettingsSchema(t), [t])

  const { data: isBroadcast, isLoading: isBroadcastLoading } = useQuery({
    queryKey: ["is-broadcast"],
    queryFn: fetchIsBroadcastWithTime,
    staleTime: 0,
  })
  const { data: anchorInfo, isLoading: anchorInfoLoading } = useQuery({
    queryKey: ["anchor-info"],
    queryFn: fetchAnchorInfo,
    staleTime: Infinity,
  })
  const { control, handleSubmit, watch, setValue, clearErrors, reset } =
    useForm<StreamSettingsFormType>({
      resolver: zodResolver(schema),
      defaultValues: STREAM_SETTINGS_DEFAULTS,
    })

  const scheduled = watch("scheduled")
  const liveMode = watch("liveMode")
  const sport = watch("sport")
  const league = watch("league")
  const leagueName = watch("leagueName")
  const matchStatus = watch("matchStatus")
  const matchValue = watch("match")
  const matchName = watch("matchName")
  const rtmpPushUrl = watch("rtmpPushUrl")
  const streamingKey = watch("streamingKey")
  const liveUrlList = watch("liveUrlList")

  const isLive = isBroadcast?.result?.hasLive || false
  const hasStreamData = isLive || !!isBroadcast?.result?.responseVo || !!liveResult
  const step = isBroadcastLoading
    ? rawStep
    : isLive
      ? rawStep || BroadcastStepEnum.STREAMING
      : hasStreamData
        ? rawStep === BroadcastStepEnum.STREAMING
          ? null
          : rawStep
        : null

  useEffect(() => {
    if (isBroadcastLoading || hasStreamData) return
    if (rawStep) setStep(null)
  }, [isBroadcastLoading, hasStreamData]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!anchorInfo) return

    reset((prev) => ({
      ...prev,
      intro: anchorInfo.brief || "",
      introDetail: anchorInfo?.detailIntroduce || "",
      images: anchorInfo.introduceImages || [],
      announcement: anchorInfo?.content || "",
      title: anchorInfo.title || "",
    }))

    if (anchorInfo.cover) setCoverUrl(anchorInfo.cover)
  }, [anchorInfo]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const vo = isBroadcast?.result?.responseVo
    if (!vo) return

    reset((prev) => ({
      ...prev,
      title: vo.title || "",
      sport: String(vo.nowLiveGameId || ""),
      league: String(vo.nowLiveLeagueId || ""),
      leagueName: vo.nowLiveLeagueName || "",
      match: String(vo.nowLiveMatchId || ""),
      matchName: vo.nowLiveMatchName || "",
      matchStatus: reverseEnum(MATCH_STATUS_MAP, vo.live, STREAM_SETTINGS_DEFAULTS.matchStatus),
      streamType: reverseEnum(STREAM_TYPE_MAP, vo.liveType, STREAM_SETTINGS_DEFAULTS.streamType),
      loginRequired: reverseEnum(
        VIEWSTYLE_MAP,
        vo.viewStyle,
        STREAM_SETTINGS_DEFAULTS.loginRequired
      ),
      rtmpPushUrl: vo.rtmpPushUrl || "",
      streamingKey: vo.streamingKey || "",
      liveUrlList: vo.liveUrlList || [],
    }))

    if (vo.cover) setCoverUrl(vo.cover)
  }, [isBroadcast?.result?.responseVo]) // eslint-disable-line react-hooks/exhaustive-deps

  function buildPayload(data: StreamSettingsFormType, sportName: string) {
    const isFreeMode = data.liveMode === LiveModeEnum.FREE
    const viewStyle = VIEWSTYLE_MAP[data.loginRequired] || 0
    const payType = data.loginRequired === LoginRequiredEnum.COIN ? "GOLD" : ""
    const liveType = STREAM_TYPE_MAP[data.streamType] || 1
    const reservationTime = data.scheduledAt
      ? String(Math.floor(data.scheduledAt.getTime() / 1000))
      : ""
    return {
      leagueId: isFreeMode ? 0 : Number(data.league),
      leagueName: isFreeMode ? "" : data.leagueName,
      matchId: isFreeMode ? 0 : Number(data.match),
      matchName: isFreeMode ? "" : data.matchName,
      gameId: isFreeMode ? 0 : Number(data.sport),
      gameName: isFreeMode ? "" : sportName,
      title: data.title,
      cover: coverUrl || "",
      viewStyle,
      live: isFreeMode ? (MATCH_STATUS_MAP["1"] ?? 2) : MATCH_STATUS_MAP[data.matchStatus] || 1,
      liveType,
      isReservation: data.scheduled,
      reservationTime,
      foreignMessage: data.externalComment === ExternalCommentEnum.CONNECTED,
      payType,
      customTagsId: data.customType ? Number(data.customType) : null,
    }
  }

  async function onSubmit(data: StreamSettingsFormType) {
    const sportName = getSportOptions(t).find((o) => o.value === data.sport)?.label || data.sport
    const payload = buildPayload(data, sportName)
    const result = await submitLive(payload)
    if (result) {
      queryClient.setQueryData(["live-result"], result)
      reset((prev) => ({
        ...prev,
        rtmpPushUrl: result.rtmpPushUrl || "",
        streamingKey: result.streamingKey || "",
        liveUrlList: result.liveUrlList || [],
      }))
      queryClient.setQueryData<ToggleMatchIdPayload>(["toggle-payload"], {
        id: result.id,
        ...payload,
        gold: 0,
        level: null,
      })
    }
    setStep(data.scheduled ? BroadcastStepEnum.RESERVATION : BroadcastStepEnum.CREATED)
    queryClient.invalidateQueries({ queryKey: ["is-broadcast"] })
  }

  function buildTogglePayload(): ToggleMatchIdPayload | null {
    if (togglePayload) return togglePayload
    const vo = isBroadcast?.result?.responseVo
    if (!vo) return null
    return {
      id: vo.id,
      leagueId: vo.nowLiveLeagueId || 0,
      leagueName: vo.nowLiveLeagueName || "",
      matchId: vo.nowLiveMatchId || 0,
      matchName: vo.nowLiveMatchName || "",
      gameId: vo.nowLiveGameId || 0,
      gameName: vo.nowLiveGameName || "",
      title: vo.title || "",
      cover: vo.cover || "",
      viewStyle: vo.viewStyle || 0,
      live: vo.live || 1,
      liveType: vo.liveType || 1,
      isReservation: vo.isReservation,
      reservationTime: "",
      foreignMessage: vo.foreignMessage,
      payType: vo.payType || "",
      gold: vo.gold || 0,
      level: vo.level,
    }
  }

  async function handleLeftBtn() {
    if (step === BroadcastStepEnum.CREATED) {
      queryClient.removeQueries({ queryKey: ["live-result"] })
      queryClient.removeQueries({ queryKey: ["toggle-payload"] })
      reset((prev) => ({ ...prev, rtmpPushUrl: "", streamingKey: "", liveUrlList: [] }))
      setStep(null)
    } else if (step === BroadcastStepEnum.RESERVATION) {
      const payload = buildTogglePayload()
      if (payload) await doToggle(payload)
    } else if (step !== BroadcastStepEnum.STREAMING) {
      push(getRoutes(locale).home)
    }
  }

  async function confirmCancelReservation() {
    const liveId = liveResult?.id ?? isBroadcast?.result?.responseVo?.id
    if (!liveId) return
    await doCancelRes(liveId)
    setCancelResOpen(false)
    setStep(null)
  }

  async function handleRightBtn() {
    const liveId = liveResult?.id || isBroadcast?.result?.responseVo?.id
    if (!liveId) return
    if (step === BroadcastStepEnum.STREAMING) {
      await doDowncast(liveId)
      setStep(BroadcastStepEnum.CREATED)
      toast.success(t("broadcast.stream-settings.actions.end-stream-success"))
    } else {
      await doStart(liveId)
      setStep(BroadcastStepEnum.STREAMING)
      toast.success(t("broadcast.stream-settings.actions.start-stream-success"))
    }
    queryClient.invalidateQueries({ queryKey: ["is-broadcast"] })
  }

  if (isBroadcastLoading || anchorInfoLoading) {
    return (
      <div className="card-glow rounded-12 flex flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="rounded-8 h-6 w-40" />
          <Skeleton className="rounded-6 h-6 w-24" />
        </div>
        {/* Live ID */}
        <Skeleton className="rounded-8 h-10 w-full" />
        {/* Accordion room owner */}
        <Skeleton className="rounded-10 h-12 w-full" />
        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="rounded-4 h-4 w-24" />
              <Skeleton className="rounded-8 h-9 w-full" />
            </div>
          ))}
        </div>
        {/* Live mode accordion */}
        <Skeleton className="rounded-10 h-12 w-full" />
        {/* Stream settings */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="rounded-4 h-4 w-20" />
              <Skeleton className="rounded-8 h-9 w-full" />
            </div>
          ))}
        </div>
        {/* Submit */}
        <Skeleton className="h-9 w-full rounded-full" />
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card-glow rounded-12 flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <Typography variant="h5" className="text-white">
              {t("broadcast.stream-settings.title")}
            </Typography>
            <GuideButton />
          </div>

          <div className="rounded-8 flex items-center justify-between border border-white/6 bg-white/[0.02] px-4 py-2.5">
            <Typography variant="body-sm" className="text-white/60">
              {t("broadcast.stream-settings.live-id")}
            </Typography>
            <Typography variant="body-sm" weight="600" className="text-white">
              {liveId}
            </Typography>
          </div>

          <Accordion
            defaultValue={["owner"]}
            className="rounded-10 overflow-hidden border border-amber-400/20"
          >
            <AccordionItem value="owner" className="group/item border-none">
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger className="flex w-full items-center gap-3 bg-gradient-to-r from-amber-400/8 to-amber-400/3 px-4 py-3 transition-colors outline-none hover:from-amber-400/12 hover:to-amber-400/5">
                  <div className="rounded-8 flex size-7 shrink-0 items-center justify-center bg-amber-400/15">
                    <UserCircle className="size-4 text-amber-400" />
                  </div>
                  <div className="flex flex-1 flex-col items-start text-left">
                    <div className="flex items-center gap-1.5">
                      <Typography variant="body-sm" weight="500" className="text-white/90">
                        {t("broadcast.room-owner.preview.label")}
                      </Typography>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          open("ownerModal")
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation()
                            open("ownerModal")
                          }
                        }}
                        className="cursor-pointer text-white/30 transition-colors hover:text-amber-400"
                      >
                        <Pencil className="size-3" />
                      </span>
                    </div>
                    <Typography variant="caption" className="text-white/35">
                      {t("broadcast.stream-settings.owner-info.subtitle")}
                    </Typography>
                  </div>
                  <ChevronDown className="size-4 shrink-0 text-white/40 transition-transform duration-200 group-data-[open]/item:rotate-180" />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>

              <AccordionContent className="border-t border-amber-400/10 bg-white/[0.01]">
                <div className="flex flex-col gap-5 p-4 pt-4">
                  <FormField
                    control={control}
                    name="intro"
                    label={t("broadcast.room-owner.fields.intro.label")}
                    required
                    disabled
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
                    disabled
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
                    disabled
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
                    disabled
                    render={(field) => (
                      <ImageUpload value={field.value as string[]} onChange={field.onChange} />
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Admin */}
          <div className="flex flex-col gap-4">
            <Label required>{t("broadcast.stream-settings.admin.label")} (0)</Label>
            <div className="rounded-8 flex items-center justify-between border border-white/8 bg-white/[0.03] px-3 py-2.5">
              <Typography variant="body-sm" className="text-white/40">
                {t("broadcast.stream-settings.admin.empty")}
              </Typography>
            </div>
          </div>

          {/* Title */}
          <FormField
            control={control}
            name="title"
            label={t("broadcast.stream-settings.fields.title.label")}
            required
            render={(field) => (
              <div className="relative">
                <Input
                  {...field}
                  placeholder={t("broadcast.stream-settings.fields.title.placeholder")}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                  <Typography variant="caption" className="text-white/30">
                    {(field.value as string).length}/40
                  </Typography>
                </span>
              </div>
            )}
          />

          {/* Cover image */}
          <div className="flex flex-col gap-4">
            <Typography variant="body-sm" weight="500" className="text-white/80">
              {t("broadcast.stream-settings.fields.cover.label")}
            </Typography>
            <ImageUpload
              value={coverUrl ? [coverUrl] : []}
              onChange={(urls) => setCoverUrl(urls[0] || null)}
              multiple={false}
              max={1}
              description={t("broadcast.stream-settings.fields.cover.hint")}
            />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="scheduled"
              label={t("broadcast.stream-settings.fields.scheduled.label")}
              render={(field) => (
                <Select
                  value={field.value ? ScheduledEnum.YES : ScheduledEnum.NO}
                  onValueChange={(v) => {
                    const isYes = v === ScheduledEnum.YES
                    field.onChange(isYes)
                    if (isYes) {
                      setValue("liveMode", LiveModeEnum.FREE)
                    } else {
                      setValue("scheduledAt", null)
                      clearErrors("scheduledAt")
                    }
                  }}
                  options={getScheduledOptions(t)}
                  variant="dark"
                />
              )}
            />
            <FormField
              control={control}
              name="scheduledAt"
              label={t("broadcast.stream-settings.fields.scheduled-at.label")}
              required={scheduled}
              render={(field) => (
                <DatePicker
                  value={field.value as Date | null}
                  onChange={field.onChange}
                  placeholder={t("broadcast.stream-settings.fields.scheduled-at.placeholder")}
                  disabled={!scheduled}
                  triggerClassName="w-full"
                  minDate={new Date()}
                />
              )}
            />
          </div>

          {/* Live mode — accordion */}
          <Accordion
            defaultValue={["liveMode"]}
            className="rounded-10 overflow-hidden border border-sky-400/20"
          >
            <AccordionItem value="liveMode" className="group/item border-none">
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger className="flex w-full items-center gap-3 bg-gradient-to-r from-sky-400/8 to-sky-400/3 px-4 py-3 transition-colors outline-none hover:from-sky-400/12 hover:to-sky-400/5">
                  <div className="rounded-8 flex size-7 shrink-0 items-center justify-center bg-sky-400/15">
                    <ReactSVG
                      src={
                        typeof icLiveMode === "string"
                          ? icLiveMode
                          : (icLiveMode as { src: string }).src
                      }
                      className="size-4 text-sky-400 [&_svg]:h-4! [&_svg]:w-4! [&>div]:flex [&>div]:size-full [&>div]:items-center [&>div]:justify-center"
                    />
                  </div>
                  <Typography
                    variant="body-sm"
                    weight="500"
                    className="flex-1 text-left text-white/90"
                  >
                    <span className="mr-0.5 text-red-400">*</span>
                    {t("broadcast.stream-settings.fields.live-mode.label")}
                  </Typography>
                  <ChevronDown className="size-4 shrink-0 text-white/40 transition-transform duration-200 group-data-[open]/item:rotate-180" />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>

              <AccordionContent className="border-t border-sky-400/10 bg-white/[0.01]">
                <div className="grid grid-cols-2 gap-4 p-4">
                  <FormField
                    control={control}
                    name="liveMode"
                    label={t("broadcast.stream-settings.fields.live-mode.label")}
                    required
                    render={(field) => (
                      <Select
                        value={field.value as string}
                        onValueChange={(v) => field.onChange(v || "")}
                        options={getLiveModeOptions(t).map((o) =>
                          scheduled && o.value !== LiveModeEnum.FREE ? { ...o, disabled: true } : o
                        )}
                        variant="dark"
                        disabled={scheduled}
                      />
                    )}
                  />
                  {liveMode === LiveModeEnum.MATCH ? (
                    <FormField
                      control={control}
                      name="sport"
                      label={t("broadcast.stream-settings.fields.sport.label")}
                      render={(field) => (
                        <Select
                          value={field.value as string}
                          onValueChange={(v) => {
                            reset((prev) => ({
                              ...prev,
                              sport: v || "",
                              league: "",
                              match: "",
                            }))
                          }}
                          placeholder={t("broadcast.stream-settings.fields.sport.placeholder")}
                          options={getSportOptions(t)}
                          variant="dark"
                        />
                      )}
                    />
                  ) : (
                    <FormField
                      control={control}
                      name="customType"
                      label={t("broadcast.stream-settings.options.live-mode.free")}
                      render={(field) => (
                        <Select
                          value={field.value as string}
                          onValueChange={(v) => field.onChange(v || null)}
                          placeholder={t("broadcast.stream-settings.options.live-mode.free")}
                          options={getCustomBroadcastTypeOptions(t)}
                          variant="dark"
                        />
                      )}
                    />
                  )}

                  {liveMode === LiveModeEnum.MATCH && (
                    <>
                      <FormField
                        control={control}
                        name="league"
                        label={t("broadcast.stream-settings.fields.league.placeholder")}
                        required
                        render={(field) => (
                          <SelectAsync
                            value={field.value as string}
                            onValueChange={(v, opt) => {
                              reset((prev) => ({
                                ...prev,
                                league: v,
                                leagueName: opt?.label || "",
                                match: "",
                                matchName: "",
                              }))
                            }}
                            endpoint={BROADCAST_API.MATCHES_BY_GAME}
                            endpointParams={{ gameId: sport }}
                            trigger={sport}
                            transformData={(raw) =>
                              convertMatchGroupsToLeagueOptions(
                                (raw as BroadcastMatchGroup[]) || []
                              )
                            }
                            placeholder={t("broadcast.stream-settings.fields.league.placeholder")}
                            disabled={!sport}
                            variant="dark"
                            clearable
                            defaultOption={
                              league && leagueName
                                ? { value: league || "", label: leagueName || "" }
                                : undefined
                            }
                          />
                        )}
                      />
                      <FormField
                        control={control}
                        name="matchStatus"
                        label={t("broadcast.stream-settings.fields.match-status.label")}
                        render={(field) => (
                          <Select
                            value={field.value as string}
                            onValueChange={(v) => {
                              reset((prev) => ({
                                ...prev,
                                matchStatus: (v || "") as StreamSettingsFormType["matchStatus"],
                                match: "",
                              }))
                            }}
                            options={getMatchStatusOptions(t)}
                            variant="dark"
                          />
                        )}
                      />
                      <FormField
                        control={control}
                        name="match"
                        label={t("broadcast.stream-settings.fields.match.label")}
                        required
                        render={(field) => (
                          <SelectAsync
                            value={field.value as string}
                            onValueChange={(v, opt) => {
                              field.onChange(v)
                              setValue("matchName", opt?.label || "")
                            }}
                            endpoint={BROADCAST_API.MATCHES_BY_GAME}
                            endpointParams={{ gameId: sport, leagueId: league }}
                            trigger={`${league}-${matchStatus}`}
                            transformData={(raw) =>
                              convertMatchGroupsToOptions(
                                (raw as BroadcastMatchGroup[]) || [],
                                league || undefined,
                                matchStatus || undefined
                              )
                            }
                            placeholder={t("broadcast.stream-settings.fields.match.placeholder")}
                            disabled={!sport}
                            variant="dark"
                            defaultOption={
                              matchValue && matchName
                                ? { value: matchValue || "", label: matchName || "" }
                                : undefined
                            }
                          />
                        )}
                      />
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Stream settings */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="streamType"
              label={t("broadcast.stream-settings.fields.stream-type.label")}
              required
              disabled
              render={(field) => (
                <Select
                  value={field.value as string}
                  onValueChange={(v) => field.onChange(v || "")}
                  options={getStreamTypeOptions(t)}
                  variant="dark"
                  disabled
                />
              )}
            />
            <FormField
              control={control}
              name="loginRequired"
              label={t("broadcast.stream-settings.fields.login-required.label")}
              render={(field) => (
                <Select
                  value={field.value as string}
                  onValueChange={(v) => field.onChange(v || "")}
                  options={getLoginRequiredOptions(t)}
                  variant="dark"
                />
              )}
            />
            {!scheduled && (
              <FormField
                control={control}
                name="externalComment"
                label={t("broadcast.stream-settings.fields.external-comment.label")}
                render={(field) => (
                  <Select
                    value={field.value as string}
                    onValueChange={(v) => field.onChange(v || "")}
                    options={getExternalCommentOptions(t)}
                    variant="dark"
                  />
                )}
              />
            )}
            {watch("streamType") === StreamTypeEnum.BOT && (
              <FormField
                control={control}
                name="m3u8Url"
                label={t("broadcast.stream-settings.fields.m3u8-url.label")}
                required
                render={(field) => (
                  <Input
                    {...field}
                    placeholder={t("broadcast.stream-settings.fields.m3u8-url.placeholder")}
                  />
                )}
              />
            )}
          </div>

          {/* Banned users */}
          <div className="flex items-center justify-between">
            <Label required>{t("broadcast.stream-settings.banned-users.label")}: 0</Label>
          </div>

          {/* OBS fields — hiện khi có giá trị */}
          {(rtmpPushUrl || streamingKey) && (
            <Accordion
              defaultValue={["obs"]}
              className="rounded-8 overflow-hidden border border-violet-400/20"
            >
              <AccordionItem value="obs" className="group/item border-none">
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger className="flex w-full items-center gap-3 bg-gradient-to-r from-violet-400/8 to-violet-400/3 px-4 py-3 transition-colors outline-none hover:from-violet-400/12 hover:to-violet-400/5">
                    <div className="rounded-8 flex size-7 shrink-0 items-center justify-center bg-violet-400/15">
                      <MonitorPlay className="size-4 text-violet-400" />
                    </div>
                    <Typography
                      variant="body-sm"
                      weight="500"
                      className="flex-1 text-left text-white/90"
                    >
                      Server & Key OBS
                    </Typography>
                    <ChevronDown className="size-4 shrink-0 text-white/40 transition-transform duration-200 group-data-[open]/item:rotate-180" />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionContent className="border-t border-violet-400/10 bg-white/[0.01]">
                  <div className="grid grid-cols-2 gap-3 p-4">
                    {rtmpPushUrl && (
                      <StreamField
                        label={t("broadcast.stream-panel.fields.rtmp-url")}
                        value={rtmpPushUrl}
                      />
                    )}
                    {streamingKey && (
                      <StreamField
                        label={t("broadcast.stream-panel.fields.stream-key")}
                        value={streamingKey}
                        masked
                      />
                    )}
                    {liveUrlList.map((item, i) => (
                      <Fragment key={i}>
                        {item.liveUrl && (
                          <StreamField
                            label={t("broadcast.stream-panel.fields.live-url-hls")}
                            value={item.liveUrl}
                          />
                        )}
                        {item.liveUrlFlv && (
                          <StreamField
                            label={t("broadcast.stream-panel.fields.live-url-flv")}
                            value={item.liveUrlFlv}
                          />
                        )}
                      </Fragment>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          <div className="flex justify-center gap-4 pt-1">
            <Button
              type="button"
              variant="cancel"
              className="min-w-36"
              disabled={step === BroadcastStepEnum.STREAMING || isAnyLoading}
              onClick={handleLeftBtn}
            >
              {isToggling && step === BroadcastStepEnum.RESERVATION ? (
                <Loader2 className="size-4 animate-spin" />
              ) : step === BroadcastStepEnum.CREATED ||
                step === BroadcastStepEnum.STREAMING ||
                step === BroadcastStepEnum.RESERVATION ? (
                t("broadcast.stream-settings.actions.edit")
              ) : (
                t("broadcast.stream-settings.actions.cancel")
              )}
            </Button>
            {step === BroadcastStepEnum.RESERVATION && (
              <Button
                type="button"
                variant="cancel"
                className="min-w-36"
                disabled={isAnyLoading}
                onClick={() => setCancelResOpen(true)}
              >
                {t("broadcast.stream-settings.actions.cancel-reservation")}
              </Button>
            )}
            <Button
              type={step && step !== BroadcastStepEnum.RESERVATION ? "button" : "submit"}
              variant="gradient"
              className="min-w-36"
              disabled={isAnyLoading}
              onClick={step && step !== BroadcastStepEnum.RESERVATION ? handleRightBtn : undefined}
            >
              {isRightLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : step === BroadcastStepEnum.STREAMING ? (
                t("broadcast.stream-settings.actions.end-stream")
              ) : step === BroadcastStepEnum.CREATED ? (
                t("broadcast.stream-settings.actions.start-stream")
              ) : (
                t("broadcast.stream-settings.actions.confirm")
              )}
            </Button>
          </div>
        </div>
      </form>
      {state.ownerModal && (
        <RoomOwnerModal
          open={state.ownerModal}
          onClose={() => close("ownerModal")}
          onSaved={() => close("ownerModal")}
        />
      )}
      {cancelResOpen && (
        <ConfirmModal
          open={cancelResOpen}
          onOpenChange={setCancelResOpen}
          title={t("broadcast.stream-settings.actions.cancel-reservation")}
          content={t("broadcast.stream-settings.actions.cancel-reservation-confirm")}
          confirmLabel={t("broadcast.stream-settings.actions.confirm")}
          cancelLabel={t("broadcast.room-owner.actions.cancel")}
          onConfirm={confirmCancelReservation}
          isConfirming={isCancellingRes}
        />
      )}
    </>
  )
}

import { z } from "zod"

import type { TranslationKey } from "@/i18n/use-translation"

import {
  CustomBroadcastTypeEnum,
  ExternalCommentEnum,
  LiveModeEnum,
  LoginRequiredEnum,
  MatchStatusBroadcastEnum,
  StreamTypeEnum,
} from "./broadcast.constants"

export function createRoomOwnerSchema(t: (key: TranslationKey) => string) {
  return z.object({
    intro: z.string().min(1, t("broadcast.room-owner.fields.intro.error")),
    introDetail: z.string().min(1, t("broadcast.room-owner.fields.intro-detail.error")),
    announcement: z.string().min(1, t("broadcast.room-owner.fields.announcement.error")),
    images: z.array(z.string()).min(1, t("broadcast.room-owner.fields.images.error")),
  })
}

export type RoomOwnerFormType = z.infer<ReturnType<typeof createRoomOwnerSchema>>

export function createStreamSettingsSchema(t: (key: TranslationKey) => string) {
  return z
    .object({
      ...createRoomOwnerSchema(t).shape,
      title: z
        .string()
        .min(1, t("broadcast.stream-settings.fields.title.error"))
        .max(40, t("broadcast.stream-settings.fields.title.max-length")),
      scheduled: z.boolean(),
      scheduledAt: z.date().nullable(),
      liveMode: z.nativeEnum(LiveModeEnum),
      sport: z.string(),
      league: z.string(),
      leagueName: z.string(),
      match: z.string(),
      matchName: z.string(),
      matchStatus: z.nativeEnum(MatchStatusBroadcastEnum),
      customType: z.nativeEnum(CustomBroadcastTypeEnum).nullable(),
      streamType: z.nativeEnum(StreamTypeEnum),
      loginRequired: z.nativeEnum(LoginRequiredEnum),
      externalComment: z.nativeEnum(ExternalCommentEnum),
      rtmpPushUrl: z.string(),
      streamingKey: z.string(),
      m3u8Url: z.string(),
      liveUrlList: z.array(
        z.object({
          liveUrl: z.string().nullable(),
          liveUrlFlv: z.string().nullable(),
          language: z.string().nullable(),
          urlType: z.string().nullable(),
          weight: z.number().nullable(),
          isPro: z.boolean().nullable(),
        })
      ),
    })
    .refine((data) => !data.scheduled || data.scheduledAt !== null, {
      message: t("broadcast.stream-settings.fields.scheduled-at.error"),
      path: ["scheduledAt"],
    })
    .refine((data) => data.liveMode !== LiveModeEnum.MATCH || !!data.league, {
      message: t("broadcast.stream-settings.fields.league.error"),
      path: ["league"],
    })
    .refine((data) => data.liveMode !== LiveModeEnum.MATCH || !!data.match, {
      message: t("broadcast.stream-settings.fields.match.error"),
      path: ["match"],
    })
}

export type StreamSettingsFormType = z.infer<ReturnType<typeof createStreamSettingsSchema>>

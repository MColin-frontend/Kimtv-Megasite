"use client"

import type { useTranslation } from "@/i18n"
import { Typography } from "@/components/ui/typography"
import type { ChatMessage } from "../types"

type TFunc = (key: Parameters<ReturnType<typeof useTranslation>["t"]>[0]) => string

export function RoleBadge({ message, t }: { message: ChatMessage; t: TFunc }) {
  if (message.hasAnchorMe) {
    return (
      <Typography
        as="span"
        size="10"
        weight="600"
        className="bg-live/10 text-live rounded-4 mr-1 inline-block px-1.5 py-0.5 align-middle backdrop-blur-sm max-sm:px-1 max-sm:py-0 max-sm:mr-0.5"
      >
        {t("chat.role.streamer")}
      </Typography>
    )
  }
  if (message.hasFictitious) {
    return (
      <Typography
        as="span"
        size="10"
        weight="600"
        className="rounded-4 mr-1 inline-block bg-fuchsia-500/15 px-1.5 py-0.5 align-middle text-fuchsia-400 backdrop-blur-sm max-sm:px-1 max-sm:py-0 max-sm:mr-0.5"
      >
        {t("chat.role.admin")}
      </Typography>
    )
  }
  return null
}

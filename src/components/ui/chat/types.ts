import type {
  CHAT_CONNECTION_STATUS,
  CHAT_MESSAGE_TYPE,
  CHAT_USER_ROLE,
} from "@/constants/ui/ui-chat.constants"

export type ChatMessageType = (typeof CHAT_MESSAGE_TYPE)[keyof typeof CHAT_MESSAGE_TYPE]
export type UserRole = (typeof CHAT_USER_ROLE)[keyof typeof CHAT_USER_ROLE]
export type ConnectionStatus = (typeof CHAT_CONNECTION_STATUS)[keyof typeof CHAT_CONNECTION_STATUS]

export interface ChatMessage {
  id: string | number
  type: ChatMessageType
  content: string
  userName: string
  userId?: string | number
  chatroomId?: string | number
  level?: number
  isVip?: boolean
  isSVip?: boolean
  hasAnchorMe?: boolean
  hasFictitious?: boolean
  userAvatar?: string
  sendTime?: number
  vip99Icon?: string | null
}

export interface ChatSocials {
  telegram?: string
  facebook?: string
  zalo?: string
}

export interface ChatProps {
  socials?: ChatSocials
  onReport?: (message: ChatMessage, reportType: number) => void
  onBanRoom?: (message: ChatMessage, mute: boolean) => void
  onBanAll?: (message: ChatMessage, mute: boolean) => void
  onSetManager?: (message: ChatMessage, set: boolean) => void
  onPollMessage?: (channel: string, data: unknown) => void
  inputSuffix?: React.ReactNode
  topContent?: React.ReactNode
  className?: string
  chatroomId?: string | number
  gameId?: number
  externalPoll?: boolean
}

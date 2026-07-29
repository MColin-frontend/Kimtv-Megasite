import type { CHAT_MESSAGE_TYPE, CHAT_USER_ROLE, CHAT_CONNECTION_STATUS } from "@/constants/ui/ui-chat.constants"

export type ChatMessageType = (typeof CHAT_MESSAGE_TYPE)[keyof typeof CHAT_MESSAGE_TYPE]
export type UserRole = (typeof CHAT_USER_ROLE)[keyof typeof CHAT_USER_ROLE]
export type ConnectionStatus = (typeof CHAT_CONNECTION_STATUS)[keyof typeof CHAT_CONNECTION_STATUS]

export interface ChatMessageModel {
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

export interface ChatSocialsModel {
  telegram?: string
  facebook?: string
  zalo?: string
}

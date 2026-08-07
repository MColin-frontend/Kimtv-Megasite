export interface SearchBaseParamsInterface {
  keyword: string
  pageIndex: number
  pageSize?: number
}

export interface SearchAllParamsInterface extends SearchBaseParamsInterface {}

export interface SearchMatchesParamsInterface extends SearchBaseParamsInterface {}

export interface SearchNewsParamsInterface extends SearchBaseParamsInterface {}

export interface SearchUsersParamsInterface extends SearchBaseParamsInterface {}

export interface SearchAttentionAnchorParamsInterface {
  pageIndex?: number
  pageSize?: number
}

export interface SearchGameMatchLiveParamsInterface {
  id: string
  typeScreen: number
}

"use client"

import { UserRoleEnum } from "@/features/user-info/user-info.constants"
import type { UserInfoModel } from "@/features/user-info/user-info.models"

import imgStreamer from "@assets/images/common/img-search-anchors.webp"

import { searchAnchorsInfiniteQueryOptions, searchAnchorsQueryOptions } from "../search.api"
import { SEARCH_ANCHOR_PAGE_KEY, SearchFilterEnum } from "../search.constants"
import type { AnchorModel } from "../search.models"
import { SearchPersonSection } from "./search-users-section"
import { UserCard } from "./user-card"

function mapAnchorToUser(anchor: AnchorModel): UserInfoModel {
  return {
    uid: anchor.anchorId,
    name: anchor.userName,
    avatar: anchor.userAvatar ?? null,
    hasFollow: anchor.isAttention ?? false,
    followerCount: anchor.followerCount ?? 0,
    registerDate: anchor.registerDate ?? null,
    // Attention-anchor results are always streamers
    role: UserRoleEnum.BLV,
  }
}

export function SearchAttentionAnchorSection() {
  return (
    <SearchPersonSection<AnchorModel>
      filter={SearchFilterEnum.STREAM}
      pageKey={SEARCH_ANCHOR_PAGE_KEY}
      infiniteQueryFn={searchAnchorsInfiniteQueryOptions}
      pageQueryFn={searchAnchorsQueryOptions}
      image={imgStreamer}
      titleKey="search.anchors.title"
      subtitleKey="search.anchors.subtitle"
      emptyKey="search.anchors.empty"
      renderCard={(anchor, i) => (
        <UserCard key={`${anchor.anchorId ?? i}`} user={mapAnchorToUser(anchor)} />
      )}
      keyExtractor={(anchor, i) => String(anchor.anchorId ?? i)}
    />
  )
}

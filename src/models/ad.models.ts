interface AdPlacementInterface {
  mediaH5: string
  mediaPc: string
  jumpUrl: string
  enabled: boolean
}

interface AdPlacementsInterface {
  homeBanner: AdPlacementInterface
  headerCta: AdPlacementInterface
  playerOverlay: AdPlacementInterface[]
  scheduleBanner: AdPlacementInterface
  liveBanner: AdPlacementInterface
}

export type { AdPlacementInterface, AdPlacementsInterface }

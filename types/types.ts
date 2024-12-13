export type Roles = "subscriber" | "streamer" | "poster"
export type ConnectedTabs = {
  [Role in Roles]: number | null
}

// toBackgroundArgs
// toContentArgs

export type MessageArgs = {
  role: Roles
  action: "Load" | "Subscribe"
  tabId: number | null
  comments?: string[]
}

export type Platform = "googleslide" | "zoom" | "slack"
export interface Extractor {
  listNodeExtractFn: () => HTMLElement | null | undefined
  isTargetElement: (el: HTMLElement) => boolean
  commentExtractFn: (el: HTMLElement) => string | null | undefined
}

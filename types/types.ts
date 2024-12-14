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
export interface CommentExtractor {
  listNodeExtractFn: () => HTMLElement | null | undefined
  isTargetElement: (el: HTMLElement) => boolean
  commentExtractFn: (el: HTMLElement) => string | null | undefined
}

export interface SlideExtractor {
  boxElementFn: () => HTMLElement | null | undefined
}

export type Config = {
  platform: string
  color: string
  font: string
  duration: number
  sizePx: number
  clapColor: string
  clapSize: number
  plant: boolean
}

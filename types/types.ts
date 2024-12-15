export type Role = "subscriber" | "streamer" | "poster"
export type ConnectedTabs = {
  [R in Role]: number | null
}

// toBackgroundArgs
// toContentArgs

export type MessageArgs = {
  role: Role
  action: "Load" | "Subscribe"
  tabId: number | null
  comments?: string[]
}

export type Subscriber = "zoom" | "slack"
export type Streamer = "example" | "googleslide"
export type Service = Subscriber | Streamer

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

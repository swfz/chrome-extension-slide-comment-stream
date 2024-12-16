export type Role = "subscriber" | "streamer" | "poster"
// export type Role = "subscriber" | "publisher"
export type Feature = "comment" | "selfpost"

export type State = {
  service: Service
  tabId: number
  role: Role
  feature: Feature
}

export type ConnectionIdentifier = `${Feature}_${Role}`
export type ConnectedStatus = { [K in `${Feature}_${Role}`]: State | null }

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
  pageNumberElementFn: () => HTMLElement | null | undefined
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

export type Role = "subscriber" | "handler"
export type Feature = "comment" | "selfpost"

// self_poster
// page_subscriber
// comment_streamer
// comment_subscriber

// google comment_publisher, selfpost_subscriber
// slack comment_subscriber, selfpost_publisher
//

export type State = {
  service: Service
  tabId: number
  role: Role
  feature: Feature
}

export type ConnectionIdentifier = `${Feature}_${Role}`
export type ConnectedStatus = { [K in ConnectionIdentifier]: State | null }

export type ConnectedTabs = {
  [R in Role]: number | null
}

// toBackgroundArgs
// toContentArgs

export interface RequestBody {
  feature: Feature
  role: Role
  action: "Load" | "Subscribe" | "SakuraComment"
  tabId: number | null
  service: Service
  comments?: string[]
  comment?: string
}

export type BackgroundWorker = "connector" | "forwarder"

export interface ResponseBody {
  error?: string
  message?: string
}

export type CommentSubscriber = "zoom" | "slack"
export type Service = CommentSubscriber | "example" | "googleslide"

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
  color: string
  font: string
  duration: number
  sizePx: number
  clapColor: string
  clapSize: number
  selfpost: boolean
}

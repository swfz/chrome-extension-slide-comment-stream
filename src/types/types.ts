import { PlasmoMessaging } from "@plasmohq/messaging"

export type Role = "subscriber" | "handler"
export type Feature = "comment" | "selfpost"

// google comment_publisher, selfpost_subscriber
// slack comment_subscriber, selfpost_publisher

export type State = {
  service: Service
  tabId: number
  role: Role
  feature: Feature
}

export type ConnectionIdentifier = `${Feature}_${Role}`
export type ConnectedStatus = {
  [K in ConnectionIdentifier]: State | null | undefined
}

export type ConnectedTabs = {
  [R in Role]: number | null
}

// Args
// popup to Background
// popup to Content
// content to background
// background to content

// name, body
export type PopupToBackgroundBody = {
  action: "Subscribe" | "SakuraComment"
  comments?: string[]
  comment: string
}

// only {}
export type PopupToContentBody = {
  action: "Load"
  tabId: number
}

// name, body
export type ContentToBackgroundBody = {
  feature: Feature
  role: Role
  action: ConnectorAction
  tabId: number
  service: Service
}

// forwarder name, body
export type ForwarderRequestBody = {
  action: "SakuraComment" | "Subscribe"
}

type ConnectorAction = "connect" | "disconnect"

export type ConnectRequestBody = {
  action: ConnectorAction
  feature: Feature
  role: Role
  tabId?: number
  service?: Service
}

export type BatchDisconnectRequestBody = {
  action: ConnectorAction
  rows: ConnectRequestBody[]
}

export interface RequestBody {
  feature: Feature
  role: Role
  action: "Load" | "Subscribe" | "SakuraComment"
  tabId: number | null
  service?: Service
  comments?: string[]
  comment?: string
}

export type LoadParams = PlasmoMessaging.Request<"Load", {}>
export type SakuraCommentParams = PlasmoMessaging.Request<
  "SakuraComment",
  { comment: string }
>
export type SubscribeParams = PlasmoMessaging.Request<
  "Subscribe",
  { comments: string[] }
>

export type StreamerContentParams = LoadParams | SubscribeParams
export type PosterContentParams = LoadParams | SakuraCommentParams

type ActionMap = {
  Load: LoadParams
  Subscribe: SubscribeParams
  SakuraComment: SakuraCommentParams
}

export type ContentRequestBody<T extends PlasmoMessaging.Request> =
  T["name"] extends keyof ActionMap
    ? PlasmoMessaging.Request<T["name"], ActionMap[T["name"]]>
    : PlasmoMessaging.Request

export type BackgroundWorker = "connector" | "forwarder"

export interface WorkerResponseBody {
  error?: string
  message?: string
}

export type CommentSubscriber = "zoom" | "slack"
export type PageNumberSubscriber = "example" | "googleslide"
export type Service = CommentSubscriber | PageNumberSubscriber

export interface CommentExtractor {
  listNodeExtractFn: () => HTMLElement | null | undefined
  isTargetElement: (el: Element) => boolean
  commentExtractFn: (el: Node) => string | null | undefined
}

export interface SlideExtractor {
  boxElementFn: () => HTMLDivElement | null | undefined
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

export type SelfpostConfig = {
  [key: string]: {
    seconds: number
    comment: string
  }[]
}

declare module "@plasmohq/messaging" {
  interface MessagesMetadata {
    // SakuraComment: { comment: string }
    // Subscribe: [comments: string[]]
  }
}

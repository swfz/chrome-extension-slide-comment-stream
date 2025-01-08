import { PlasmoMessaging } from "@plasmohq/messaging"

import { LoadParams, SakuraCommentParams, SubscribeParams } from "./types"

const hasParams = <T extends PlasmoMessaging.Request>(name: T["name"]) => {
  return (message: PlasmoMessaging.Request): message is T =>
    message.name === name
}
export const hasLoadParams = hasParams<LoadParams>("Load")
export const hasSubscribeParams = hasParams<SubscribeParams>("Subscribe")
export const hasSakuraCommentParams =
  hasParams<SakuraCommentParams>("SakuraComment")

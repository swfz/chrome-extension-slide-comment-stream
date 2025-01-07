import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import { slackExtractor, slackSelfPost } from "~src/lib/extractor/slack"
import { batchInitialize } from "~src/lib/initializer"
import { subscribeComments } from "~src/lib/subscriber"
import { isLoadParams, isSakuraCommentParams } from "~src/types/guards"
import {
  ContentRequestBody,
  PosterContentParams,
  WorkerResponseBody
} from "~src/types/types"

let observer = { disconnect: () => {} }

export const config: PlasmoCSConfig = {
  matches: ["https://app.slack.com/client/*"],
  all_frames: true
}
const initialHandler = async (
  message: ContentRequestBody<PosterContentParams>,
  _: chrome.runtime.MessageSender,
  sendResponse: (response?: WorkerResponseBody) => void
) => {
  // console.warn("req", req)
  // console.warn("res", res)
  if (isLoadParams(message)) {
    const observeElement = slackExtractor.listNodeExtractFn()
    if (observeElement === null || observeElement === undefined) {
      sendResponse({ error: "Subscribe node not found. please open chat list" })
      return
    }

    await sendToBackground({
      name: "connector",
      body: {
        feature: "comment",
        role: "subscriber",
        action: "connect",
        tabId: message.tabId,
        service: "slack"
      }
    }).catch((e) => {
      console.warn(e)
    })
    await sendToBackground({
      name: "connector",
      body: {
        feature: "selfpost",
        role: "handler",
        action: "connect",
        tabId: message.tabId,
        service: "slack"
      }
    }).catch((e) => {
      console.warn(e)
    })

    observer.disconnect()
    observer = subscribeComments("slack", observeElement)
    sendResponse({ message: "Subscribed comment list in chat." })
  }

  if (isSakuraCommentParams(message)) {
    const m = await slackSelfPost(message.comment)
    sendResponse(m)
  }
}

batchInitialize([
  { feature: "comment", role: "subscriber" },
  { feature: "selfpost", role: "handler" }
])

chrome.runtime.onMessage.addListener(initialHandler)

console.log("loaded. subscriber content script.")

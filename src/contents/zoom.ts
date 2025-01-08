import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import { zoomExtractor, zoomSelfPost } from "~src/lib/extractor/zoom"
import { batchInitialize } from "~src/lib/initializer"
import { subscribeComments } from "~src/lib/subscriber"
import { hasLoadParams, hasSakuraCommentParams } from "~src/types/guards"
import {
  ContentRequestBody,
  PosterContentParams,
  WorkerResponseBody
} from "~src/types/types"

let observer = { disconnect: () => {} }

export const config: PlasmoCSConfig = {
  matches: ["https://app.zoom.us/wc/*"],
  all_frames: true
}

const initialHandler = async (
  message: ContentRequestBody<PosterContentParams>,
  _: chrome.runtime.MessageSender,
  sendResponse: (response?: WorkerResponseBody) => void
) => {
  if (hasLoadParams(message)) {
    const observeElement = zoomExtractor.listNodeExtractFn()

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
        service: "zoom"
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
        service: "zoom"
      }
    }).catch((e) => {
      console.warn(e)
    })

    observer.disconnect()
    observer = subscribeComments("zoom", observeElement)
    sendResponse({ message: "Subscribed comment list in chat." })
  }

  if (hasSakuraCommentParams(message)) {
    const m = await zoomSelfPost(message.body?.comment || "")
    sendResponse(m)
  }
}

// NOTE: 2重でイベントリスナが登録されるのを防ぐための分岐 子要素に対して処理する
if (window.self !== window.top) {
  batchInitialize([
    { feature: "comment", role: "subscriber" },
    { feature: "selfpost", role: "handler" }
  ])
  chrome.runtime.onMessage.addListener(initialHandler)
}

console.log("loaded. subscriber content script.")

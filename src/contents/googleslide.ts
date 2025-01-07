import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { googleslideExtractor } from "~src/lib/extractor/googleslide"
import { batchInitialize } from "~src/lib/initializer"
import { subscribePageNumber } from "~src/lib/poster"
import { render } from "~src/lib/streamer"
import { defaultConfig } from "~src/options"
import { isLoadParams, isSubscribeParams } from "~src/types/guards"
import {
  Config,
  ContentRequestBody,
  StreamerContentParams,
  WorkerResponseBody
} from "~src/types/types"

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/presentation/d/*/edit"],
  css: ["content.css"],
  all_frames: true
}

let observer = { disconnect: () => {} }

const initialHandler = async (
  message: ContentRequestBody<StreamerContentParams>,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: WorkerResponseBody) => void
) => {
  const storage = new Storage({ area: "local" })
  const config = (await storage.get<Config>("config")) || defaultConfig

  if (isLoadParams(message)) {
    const boxElement = googleslideExtractor.boxElementFn()

    if (boxElement === null || boxElement === undefined) {
      sendResponse({ error: "Please start in presentation mode." })
      return
    }

    await sendToBackground({
      name: "connector",
      body: {
        feature: "comment",
        role: "handler",
        action: "connect",
        tabId: message.tabId,
        service: "googleslide"
      }
    }).catch((e) => {
      console.warn(e)
    })

    if (config.selfpost) {
      const observeElement = googleslideExtractor.pageNumberElementFn()

      if (observeElement === null || observeElement === undefined) {
        console.warn("not exist page number element")
        return
      }

      observer.disconnect()
      observer = subscribePageNumber(observeElement)

      await sendToBackground({
        name: "connector",
        body: {
          feature: "selfpost",
          role: "subscriber",
          action: "connect",
          tabId: message.tabId,
          service: "googleslide"
        }
      }).catch((e) => {
        console.warn(e)
      })
      sendResponse({ message: "Subscribed page number in slide" })
    } else {
      sendResponse({ message: "Connected example site" })
    }
  }

  if (isSubscribeParams(message)) {
    const boxElement = googleslideExtractor.boxElementFn()

    // TODO: iframe内にコンテンツを差し込んでいるためkeyframesの記述を設定したCSSもIframeから読めないとanimationが動作しない
    // しかし、現状の設定ではiframe内からCSSが読めないため、直接入れ込んでいる
    // 今後切り出すなり別の手法を模索するなり検討が必要
    const iframeElement: HTMLIFrameElement | null = document.querySelector(
      ".punch-present-iframe"
    )
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = chrome.runtime.getURL("contents/content.css")
    iframeElement?.contentWindow?.document.head.appendChild(link)
    // ---------------------------------------

    if (boxElement === null || boxElement === undefined) {
      sendResponse({ error: "Not found slide element..." })
      return
    }

    render(boxElement, config, message.comments)
    sendResponse({ message: "comments rendered" })
  }
}

// NOTE: 2重でイベントリスナが登録されるのを防ぐための分岐
// iframe利用の親側のコンテンツかどうかの判断
if (document.body.role === "application") {
  batchInitialize([
    { feature: "comment", role: "handler" },
    { feature: "selfpost", role: "subscriber" }
  ])
  chrome.runtime.onMessage.addListener(initialHandler)
}

console.log("loaded. streamer content script.")

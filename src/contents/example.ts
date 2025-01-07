import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { exampleExtractor } from "~src/lib/extractor/example"
import { batchInitialize } from "~src/lib/initializer"
import { subscribePageNumber } from "~src/lib/poster"
import { render } from "~src/lib/streamer"
import { isLoadParams, isSubscribeParams } from "~src/types/guards"
import {
  Config,
  ContentRequestBody,
  StreamerContentParams,
  WorkerResponseBody
} from "~src/types/types"

export const config: PlasmoCSConfig = {
  matches: ["https://tools.swfz.io/document-pinp-react-portal"],
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
  const config = await storage.get<Config>("config")

  if (isLoadParams(message)) {
    const boxElement = exampleExtractor.boxElementFn()
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
        service: "example",
        tabId: message.tabId
      }
    }).catch((e) => {
      console.warn(e)
    })

    if (config?.selfpost) {
      const observeElement = exampleExtractor.pageNumberElementFn()
      console.log(observeElement)

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
          service: "example",
          tabId: message.tabId
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
    const boxElement = exampleExtractor.boxElementFn()

    render(boxElement, config, message.comments)
    sendResponse({ message: "comments rendered" })
  }
}

batchInitialize([
  { feature: "comment", role: "handler" },
  { feature: "selfpost", role: "subscriber" }
])
chrome.runtime.onMessage.addListener(initialHandler)

console.log("lasterror", chrome.runtime.lastError)
console.log("loaded. content script.")

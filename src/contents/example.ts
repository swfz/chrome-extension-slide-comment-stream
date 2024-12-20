import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"
import { Storage } from "@plasmohq/storage"

import { exampleExtractor } from "~src/lib/extractor/example"
import { batchInitialize } from "~src/lib/initializer"
import { subscribePageNumber } from "~src/lib/poster"
import { render } from "~src/lib/streamer"
import { Config, RequestBody, WorkerResponseBody } from "~src/types/types"

export const config: PlasmoCSConfig = {
  matches: ["https://tools.swfz.io/document-pinp-react-portal"],
  css: ["content.css"],
  all_frames: true
}

let observer = { disconnect: () => {} }

const initialHandler: PlasmoMessaging.Handler<
  string,
  RequestBody,
  WorkerResponseBody
> = async (req, res) => {
  console.warn("req", req)
  const storage = new Storage({ area: "local" })
  const config = await storage.get<Config>("config")

  if (req.action === "Load") {
    const boxElement = exampleExtractor.boxElementFn()
    if (boxElement === null || boxElement === undefined) {
      res.send({ error: "Please start in presentation mode." })
      return
    }

    await sendToBackground({
      name: "connector",
      body: {
        feature: "comment",
        role: "handler",
        action: "connect",
        service: "example",
        tabId: req.tabId
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
          tabId: req.tabId
        }
      }).catch((e) => {
        console.warn(e)
      })
      res.send({ message: "Subscribed page number in slide" })
    } else {
      res.send({ message: "Connected example site" })
    }
  }

  if (req.action === "Subscribe") {
    const boxElement = exampleExtractor.boxElementFn()

    render(boxElement, config, req.comments)
    res.send({ message: "comments rendered" })
  }
}

batchInitialize([
  { feature: "comment", role: "handler" },
  { feature: "selfpost", role: "subscriber" }
])
listen(initialHandler)

console.log("lasterror", chrome.runtime.lastError)
console.log("loaded. content script.")

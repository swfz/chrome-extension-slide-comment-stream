import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"
import { Storage } from "@plasmohq/storage"

import { exampleExtractor } from "~lib/extractor/example"
import { initialize } from "~lib/initializer"
import { subscribePageNumber } from "~lib/poster"
import { render } from "~lib/streamer"
import { RequestBody, ResponseBody } from "~types/types"

export const config: PlasmoCSConfig = {
  matches: ["https://tools.swfz.io/document-pinp-react-portal"],
  css: ["content.css"],
  all_frames: true
}

let observer = { disconnect: () => {} }

const initialHandler: PlasmoMessaging.Handler<
  string,
  RequestBody,
  ResponseBody
> = async (req, res) => {
  console.warn("req", req)
  const storage = new Storage({ area: "local" })
  const config = await storage.get("config")

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
    })

    if (config.selfpost) {
      const observeElement = exampleExtractor.pageNumberElementFn()

      if (observeElement === null || observeElement === undefined) {
        console.warn("not exist page number element")
        return
      }

      observer.disconnect()
      observer = subscribePageNumber("example", observeElement, res.send)
      await sendToBackground({
        name: "connector",
        body: {
          feature: "selfpost",
          role: "subscriber",
          action: "connect",
          service: "example",
          tabId: req.tabId
        }
      })
      res.send({ message: "connected example site" })
    } else {
      res.send({ message: "connected example site" })
    }
  }

  if (req.action === "Subscribe") {
    const boxElement = exampleExtractor.boxElementFn()

    render(boxElement, config, req.comments)
    res.send({ message: "comments rendered" })
  }
}

initialize("comment", "handler")
initialize("selfpost", "subscriber")
listen(initialHandler)

console.log('lasterror',chrome.runtime.lastError);
console.log("loaded. content script.")

import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"

import { zoomExtractor, zoomSelfPost } from "~lib/extractor/zoom"
import { initialize } from "~lib/initializer"
import { subscribeComments } from "~lib/subscriber"
import { RequestBody, ResponseBody } from "~types/types"

let observer = { disconnect: () => {} }

export const config: PlasmoCSConfig = {
  matches: ["https://app.zoom.us/wc/*"],
  all_frames: true
}

const initialHandler: PlasmoMessaging.Handler<
  string,
  RequestBody,
  ResponseBody
> = async (req, res) => {
  console.warn("req", req)
  console.warn("res", res)

  if (req.action === "Load") {
    const observeElement = zoomExtractor.listNodeExtractFn()

    if (observeElement === null || observeElement === undefined) {
      res.send({ error: "Subscribe node not found. please open chat list" })
      return
    }

    await sendToBackground({
      name: "connector",
      body: {
        feature: "comment",
        role: "subscriber",
        action: "connect",
        tabId: req.tabId,
        service: "zoom"
      }
    })
    await sendToBackground({
      name: "connector",
      body: {
        feature: "selfpost",
        role: "handler",
        action: "connect",
        tabId: req.tabId,
        service: "zoom"
      }
    })

    observer.disconnect()
    observer = subscribeComments("zoom", observeElement, res.send)
  }

  if (req.action === "SakuraComment") {
    console.log("sakura", req)

    zoomSelfPost(req.comment, res.send)
  }
}

// NOTE: 2重でイベントリスナが登録されるのを防ぐための分岐 子要素に対して処理する
if (window.self !== window.top) {
  initialize("comment", "subscriber")
  initialize("selfpost", "handler")
  listen(initialHandler)
}

console.log("loaded. subscriber content script.")

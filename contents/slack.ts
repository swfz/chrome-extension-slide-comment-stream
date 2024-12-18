import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"

import { slackExtractor, slackSelfPost } from "~lib/extractor/slack"
import { batchInitialize } from "~lib/initializer"
import { subscribeComments } from "~lib/subscriber"
import { PopupToContentBody, WorkerResponseBody } from "~types/types"

let observer = { disconnect: () => {} }

export const config: PlasmoCSConfig = {
  matches: ["https://app.slack.com/client/*"],
  all_frames: true
}

const initialHandler: PlasmoMessaging.Handler<
  PopupToContentBody,
  WorkerResponseBody
> = async (req, res) => {
  console.warn("req", req)
  console.warn("res", res)
  if (req.action === "Load") {
    const observeElement = slackExtractor.listNodeExtractFn()
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
        tabId: req.tabId,
        service: "slack"
      }
    }).catch((e) => {
      console.warn(e)
    })

    observer.disconnect()
    observer = subscribeComments("slack", observeElement)
    res.send({ message: "Subscribed comment list in chat." })
  }

  if (req.action === "SakuraComment") {
    slackSelfPost(req.comment, res.send)
  }
}

batchInitialize([
  { feature: "comment", role: "subscriber" },
  { feature: "selfpost", role: "handler" }
])
listen(initialHandler)

console.log("loaded. subscriber content script.")

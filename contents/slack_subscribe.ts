import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"

import { slackSelfPost } from "~lib/extractor/slack"
import { initialize } from "~lib/initializer"
import { extractors, subscribeComments } from "~lib/subscriber"

let observer = { disconnect: () => {} }

export const config: PlasmoCSConfig = {
  matches: ["https://app.slack.com/client/*"],
  all_frames: true
}

const initialHandler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.warn("req", req)
  console.warn("res", res)
  if (req.action === "Load") {
    const observeElement = extractors["slack"].listNodeExtractFn()

    await sendToBackground({
      name: "connector",
      body: {
        feature: "comment",
        role: "subscriber",
        action: "connect",
        tabId: req.tabId,
        service: "slack"
      }
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
    })

    observer.disconnect()
    observer = subscribeComments("slack", observeElement, res.send)
  }

  if (req.action === "SakuraComment") {
    slackSelfPost(req.comment, res.send)
  }
}

initialize("comment", "subscriber")
initialize("selfpost", "handler")
listen(initialHandler)

console.log("loaded. subscriber content script.")

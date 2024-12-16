import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"

import { slackSelfPost } from "~lib/extractor/slack"
import { initialize } from "~lib/initializer"
import { extractors, subscribeComments } from "~lib/subscriber"
import { Role } from "~types/types"

const ROLE: Role = "subscriber"
let observer = { disconnect: () => {} }

export const config: PlasmoCSConfig = {
  matches: ["https://app.slack.com/client/*"],
  all_frames: true
}

initialize(ROLE)
initialize("poster")

const initialHandler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.warn("req", req)
  console.warn("res", res)
  if (req.action === "Load") {
    const observeElement = extractors["slack"].listNodeExtractFn()

    observer.disconnect()
    observer = subscribeComments("slack", observeElement, res.send)

    const response = await sendToBackground({
      name: "connector",
      body: { role: ROLE, action: "connect", tabId: req.tabId }
    })

    res.send(response.message)
  }

  if (req.action === "SakuraComment") {
    slackSelfPost(req.comment, res.send)
  }
}

listen(initialHandler)

console.log("loaded. subscriber content script.")

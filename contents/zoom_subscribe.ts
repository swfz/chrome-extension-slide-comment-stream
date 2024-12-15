import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"

import { initialize } from "~lib/initializer"
import { extractors, subscribeComments } from "~lib/subscriber"
import { Role } from "~types/types"

const ROLE: Role = "subscriber"
let observer = { disconnect: () => {} }

export const config: PlasmoCSConfig = {
  matches: ["https://app.zoom.us/wc/*"],
  all_frames: true
}

const initialHandler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.warn("req", req)
  console.warn("res", res)

  const observeElement = extractors["zoom"].listNodeExtractFn()

  if (observeElement === null || observeElement === undefined) {
    res.send({ error: "Subscribe node not found. please open chat list" })
  } else {
    observer.disconnect()
    observer = subscribeComments("zoom", observeElement, res.send)

    const response = await sendToBackground({
      name: "connector",
      body: { role: ROLE, action: "connect", tabId: req.tabId }
    })
    res.send({ message: response.message })
  }
}

// Only inline iframe content
if (window.self !== window.top) {
  initialize(ROLE)
  listen(initialHandler)
}

console.log("loaded. subscriber content script.")

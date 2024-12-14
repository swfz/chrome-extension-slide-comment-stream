import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"
import { Storage } from "@plasmohq/storage"

import { exampleExtractor } from "~lib/extractor/example"
import { initialize } from "~lib/initializer"
import { render } from "~lib/streamer"
import { Roles } from "~types/types"

export const config: PlasmoCSConfig = {
  matches: ["https://example.com/"],
  css: ["content.css"],
  all_frames: true
}

const ROLE: Roles = "streamer"

initialize(ROLE)

const initialHandler: PlasmoMessaging.Handler = async (req, res) => {
  console.warn("req", req)
  if (req.action === "Load") {
    const response = await sendToBackground({
      name: "connector",
      body: { role: ROLE, action: "connect", tabId: req.tabId }
    })
    res.send(response.message)
  }

  if (req.action === "Subscribe") {
    const boxElement = exampleExtractor.boxElementFn()
    const storage = new Storage({ area: "local" })
    const config = await storage.get("config")

    render(boxElement, config, req.comments)

    res.send({ message: "streamed" })
  }
}

listen(initialHandler)

console.log("loaded. streamer content script.")

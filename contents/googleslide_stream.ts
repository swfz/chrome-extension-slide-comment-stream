import clapImage from "data-base64:~assets/sign_language_black_24dp.svg"
import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"
import { Storage } from "@plasmohq/storage"

import { initialize } from "~lib/initializer"
import { addComment, clapElementStyle, renderClaps } from "~lib/streamer"
import { Roles } from "~types/types"

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/presentation/d/*/edit"],
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
    const iframeElement: HTMLIFrameElement | null = document.querySelector(
      ".punch-present-iframe"
    )
    const boxElement = iframeElement?.contentWindow?.document.querySelector(
      ".punch-viewer-content"
    )

    if (boxElement === null) {
      res.send({
        screenType: "slide",
        message: "Error: Not found slide element..."
      })
      return
    }

    const clapElement = document.createElement("div")

    const beltPerContainer = 0.12
    const containerHeight = boxElement.clientHeight * (1 - beltPerContainer)
    const containerWidth = boxElement.clientWidth

    // 右1割、下1割
    const clapElementBottom = boxElement.clientHeight * 0.1
    const clapElementRight = containerWidth * 0.1

    const p = document.createElement("p")
    p.style.margin = "0"

    const img = document.createElement("img")
    img.src = clapImage

    clapElement.appendChild(p)
    clapElement.appendChild(img)
    boxElement.appendChild(clapElement)

    const clapElementStyles = clapElementStyle(
      clapElementBottom,
      clapElementRight
    )
    Object.entries(clapElementStyles).forEach(
      ([k, v]) => (clapElement.style[k] = v)
    )

    const storage = new Storage({ area: "local" })
    const config = await storage.get("config")

    const claps = req.comments.reduce(
      (n, comment) => n + comment.match(/[8８]/g)?.length,
      0
    )
    const comments = req.comments.filter(
      (comment) => !comment.match(/^[8８]+$/)
    )

    if (claps > 0) {
      renderClaps(
        claps,
        p,
        clapElement,
        clapElementBottom,
        clapElementRight,
        config
      )
    }
    comments.forEach((comment) =>
      addComment(comment, boxElement, containerHeight, config)
    )
  }
}

listen(initialHandler)

console.log("loaded. streamer content script.")

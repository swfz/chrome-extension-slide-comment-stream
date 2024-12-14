import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"
import { Storage } from "@plasmohq/storage"

import { initialize } from "~lib/initializer"
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
    const boxElement = document.querySelector<HTMLDivElement>("div")
    const storage = new Storage({ area: "local" })
    const config = await storage.get("config")

    const addComment = (comment: string) => {
      console.log("add comment")

      const minMs = config.duration * 1000 - 1000
      const maxMs = config.duration * 1000 + 1000
      const verticalPosition = Math.floor(Math.random() * 80 + 10)
      const animationDuration = Math.floor(Math.random() * minMs + maxMs)

      const commentStyle = {
        top: `${verticalPosition}%`,
        position: `absolute`,
        right: `-30%`,
        animation: `slideLeft ${animationDuration}ms linear`,
        color: config.color,
        fontFamily: config.font,
        fontSize: `${config.sizePx}px`,
        whiteSpace: `nowrap`
      }

      const element = document.createElement("p")
      element.innerText = comment
      element.onanimationend = (e) => {
        const commentElement = e.target
        if (commentElement) {
          commentElement.style.display = `none`
        }
      }
      Object.entries(commentStyle).forEach(([k, v]) => (element.style[k] = v))

      boxElement.appendChild(element)
    }

    const comments = req.comments.filter(
      (comment) => !comment.match(/^[8８]+$/)
    )

    comments.forEach((comment) => addComment(comment))
    res.send("subscribed")
  }
}

listen(initialHandler)

console.log("loaded. streamer content script.")

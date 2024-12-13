import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"

import { initialize } from "~lib/initializer"
import { Roles } from "~types/types"

export const config: PlasmoCSConfig = {
  matches: ["https://example.com/"],
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

    const addComment = (comment: string) => {
      console.log("add comment")

      const element = document.createElement("p")
      element.innerText = comment

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

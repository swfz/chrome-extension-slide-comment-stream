import CssFilterConverter from "css-filter-converter"
import clapImage from "data-base64:~assets/sign_language_black_24dp.svg"
import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"
import { Storage } from "@plasmohq/storage"

import { exampleExtractor } from "~lib/extractor/example"
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
    const boxElement = exampleExtractor.boxElementFn()
    const storage = new Storage({ area: "local" })
    const config = await storage.get("config")

    // comment
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
      element.style.all = "initial"
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

    const claps = req.comments.reduce(
      (n, comment) => n + comment.match(/[8８]/g)?.length,
      0
    )
    if (claps > 0) {
      const clapElement = document.createElement("div")

      const containerWidth = boxElement.clientWidth
      const clapElementBottom = boxElement.clientHeight * 0.3
      const clapElementRight = containerWidth * 0.2
      const p = document.createElement("p")
      p.style.margin = "0"

      const img = document.createElement("img")
      img.src = clapImage
      img.width = config.clapSize
      img.height = config.clapSize

      clapElement.appendChild(p)
      clapElement.appendChild(img)

      const shakeIndex = Math.floor(Math.random() * 5) + 1

      const clapElementStyles = {
        width: `${config.clapSize}px`,
        height: `${config.clapSize}px`,
        position: "absolute",
        bottom: `${clapElementBottom}px`,
        right: `${clapElementRight}px`,
        filter: CssFilterConverter.hexToFilter(config.clapColor).color,
        animation: `shake${shakeIndex} 0.5s ease-in-out infinite, fadeOut 2s ease-in-out forwards`
      }

      clapElement.style.all = "initial"
      Object.entries(clapElementStyles).forEach(
        ([k, v]) => (clapElement.style[k] = v)
      )
      p.innerText = `+${claps.toString()}`

      clapElement.onanimationend = (e) => {
        const element = e.target
        if (element) {
          element.style.display = `none`
        }
      }
      boxElement.appendChild(clapElement)
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

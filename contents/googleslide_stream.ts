import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"
import { Storage } from "@plasmohq/storage"

import { googleslideExtractor } from "~lib/extractor/googleslide"
import { initialize } from "~lib/initializer"
import { subscribePageNumber } from "~lib/poster"
import { render } from "~lib/streamer"
import { Role } from "~types/types"

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/presentation/d/*/edit"],
  css: ["content.css"],
  all_frames: true
}

const ROLE: Role = "streamer"
let observer = { disconnect: () => {} }

const initialHandler: PlasmoMessaging.Handler = async (req, res) => {
  console.warn("req", req)

  const storage = new Storage({ area: "local" })
  const config = await storage.get("config")

  if (req.action === "Load") {
    const boxElement = googleslideExtractor.boxElementFn()

    if (boxElement === null || boxElement === undefined) {
      res.send({ error: "Please start in presentation mode." })
      return
    }

    const streamerResponse = await sendToBackground({
      name: "connector",
      body: { role: ROLE, action: "connect", tabId: req.tabId }
    })
    const posterResponse = await sendToBackground({
      name: "connector",
      body: { role: "poster", action: "connect", tabId: req.tabId }
    })
    if (config?.plant) {
      const observeElement = googleslideExtractor.pageNumberElementFn()

      if (observeElement === null || observeElement === undefined) {
        console.warn("not exist page number element")
        return
      }

      observer.disconnect()
      observer = subscribePageNumber("googleslide", observeElement, res.send)
    }

    // res.send({ message: response.message })
  }

  if (req.action === "Subscribe") {
    const boxElement = googleslideExtractor.boxElementFn()

    // TODO: iframe内にコンテンツを差し込んでいるためkeyframesの記述を設定したCSSもIframeから読めないとanimationが動作しない
    // しかし、現状の設定ではiframe内からCSSが読めないため、直接入れ込んでいる
    // 今後切り出すなり別の手法を模索するなり検討が必要
    const iframeElement: HTMLIFrameElement | null = document.querySelector(
      ".punch-present-iframe"
    )
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = chrome.runtime.getURL("contents/content.css")
    iframeElement?.contentWindow?.document.head.appendChild(link)
    // ---------------------------------------

    if (boxElement === null || boxElement === undefined) {
      res.send({ error: "Not found slide element..." })
      return
    }

    render(boxElement, config, req.comments)
    res.send({ message: "comments rendered" })
  }
}

// NOTE: 2重でイベントリスナが登録されるのを防ぐための分岐
// iframe利用の親側のコンテンツかどうかの判断
if (document.body.role === "application") {
  initialize(ROLE)
  listen(initialHandler)
}

console.log("loaded. streamer content script.")

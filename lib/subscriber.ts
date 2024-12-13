import { sendToBackground } from "@plasmohq/messaging"

import { Extractor, Platform } from "~types/types"

import { slackExtractor } from "./extractor/slack"
import { zoomExtractor } from "./extractor/zoom"

const extractors: { [P in Platform]: Extractor } = {
  slack: slackExtractor,
  zoom: zoomExtractor
}

const subscribeComments = (platform, observeElement, sendResponse) => {
  const extractComment = (mutationRecords: MutationRecord[]): string[] => {
    const nodes = mutationRecords
      .filter((record) => {
        const element = record.target as Element

        return extractors[platform].isTargetElement(element)
      })
      .map((record) => record.addedNodes[0])

    const comments = Array.from(nodes).map((node) =>
      extractors[platform].commentExtractFn(node)
    )
    console.warn(comments)
    return comments
  }

  const observer = new MutationObserver(async function (records) {
    await sendToBackground({
      name: "forwarder",
      body: { action: "Subscribe", comments: extractComment(records) }
    })
  })

  observer.observe(observeElement, { subtree: true, childList: true })

  sendResponse({ message: "A listener has been added to the Comment side." })

  return observer
}

export { subscribeComments, extractors }

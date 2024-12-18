import { sendToBackground } from "@plasmohq/messaging"

import { CommentSubscriber } from "~types/types"

import { extractors } from "./extractor"

const subscribeComments = (
  service: CommentSubscriber,
  observeElement,
  sendResponse
) => {
  const extractComment = (mutationRecords: MutationRecord[]): string[] => {
    const nodes = mutationRecords
      .filter((record) => {
        const element = record.target as Element

        return extractors[service].isTargetElement(element)
      })
      .map((record) => record.addedNodes[0])

    const comments = Array.from(nodes)
      .map((node) => extractors[service].commentExtractFn(node))
      .filter((c) => c !== undefined)
    return comments
  }

  const observer = new MutationObserver(async function (
    records: MutationRecord[],
    observer: MutationObserver
  ) {
    const comments = extractComment(records)
    console.log("extracted comments", comments)
    console.log("observe connect", observeElement.isConnected)

    if (observeElement.isConnected) {
      await sendToBackground({
        name: "forwarder",
        body: { action: "Subscribe", comments }
      })
    } else {
      await sendToBackground({
        name: "connector",
        body: { feature: "comment", role: "subscriber", action: "disconnect" }
      })
    }
  })

  observer.observe(observeElement, { subtree: true, childList: true })

  sendResponse({ message: "Subscribed comment list in chat." })

  return observer
}

export { subscribeComments, extractors }

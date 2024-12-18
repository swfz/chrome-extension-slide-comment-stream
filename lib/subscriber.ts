import { sendToBackground } from "@plasmohq/messaging"

import { CommentSubscriber } from "~types/types"

import { extractors } from "./extractor"

const subscribeComments = (
  service: CommentSubscriber,
  observeElement: HTMLElement
) => {
  const extractComment = (mutationRecords: MutationRecord[]): string[] => {
    const nodes = mutationRecords
      .filter((record) => {
        const element = record.target as Element

        return extractors[service].isTargetElement(element)
      })
      .map((record) => record.addedNodes[0])
      .filter((node) => node !== undefined)

    const comments = Array.from(nodes)
      .map((node) => extractors[service].commentExtractFn(node))
      .filter((c) => c !== undefined && c !== null)

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
      if (comments.length > 0) {
        await sendToBackground({
          name: "forwarder",
          body: { action: "Subscribe", comments }
        }).catch((e) => {
          console.warn(e)
        })
      }
    } else {
      console.log("observeElement removed.")

      await sendToBackground({
        name: "connector",
        body: { feature: "comment", role: "subscriber", action: "disconnect" }
      }).catch((e) => {
        console.warn(e)
      })
    }
  })

  observer.observe(observeElement, { subtree: true, childList: true })

  return observer
}

export { subscribeComments, extractors }

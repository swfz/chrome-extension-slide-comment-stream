import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { SelfpostConfig } from "~types/types"

const subscribePageNumber = (observeElement: HTMLElement) => {
  const observer = new MutationObserver(async function (
    records: MutationRecord[]
  ) {
    if (!observeElement.isConnected) {
      await sendToBackground({
        name: "connector",
        body: { feature: "selfpost", role: "subscriber", action: "disconnect" }
      }).catch((e) => {
        console.warn(e)
      })
      return
    }

    const storage = new Storage({ area: "local" })
    const sakura = await storage.get<SelfpostConfig>("selfpost")

    if (sakura === undefined) {
      return
    }

    const added = records.at(-1)?.addedNodes[0]?.textContent
    const removed = records[0]?.removedNodes[0]?.textContent

    if (added && removed && added > removed) {
      console.warn(added, removed, sakura, records)

      const plantCommentRows = sakura[added]

      if (plantCommentRows !== undefined) {
        plantCommentRows.forEach((commentRow) => {
          setTimeout(async () => {
            await sendToBackground({
              name: "forwarder",
              body: { action: "SakuraComment", comment: commentRow.comment }
            }).catch((e) => {
              console.warn(e)
            })
          }, commentRow.seconds * 1000)
        })
      }
    }
  })
  console.log("observe ")

  observer.observe(observeElement, { subtree: true, childList: true })

  return observer
}

const waitForSelector = <T extends Element>(
  selector: string,
  timeout = 2000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const interval = 100
    let elapsed = 0

    const checkExistence = () => {
      const element = document.querySelector(selector)

      if (element && element instanceof Element) {
        resolve(element as T)
      } else if (elapsed >= timeout) {
        reject(new Error(`Timeout: ${selector} not found`))
      } else {
        elapsed += interval
        setTimeout(checkExistence, interval)
      }
    }
    checkExistence()
  })
}

export { subscribePageNumber, waitForSelector }

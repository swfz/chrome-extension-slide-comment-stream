import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const subscribePageNumber = (service, observeElement, send) => {
  const observer = new MutationObserver(async function (
    records: MutationRecord[],
    observer: MutationObserver
  ) {
    if (!observeElement.isConnected) {
      await sendToBackground({
        name: "connector",
        body: { feature: "selfpost", role: "subscriber", action: "disconnect" }
      })
      return
    }

    const storage = new Storage({ area: "local" })
    const sakura = await storage.get("selfpost")

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
            })
          }, commentRow.seconds * 1000)
        })
      }
    }
  })

  observer.observe(observeElement, { subtree: true, childList: true })

  send({ message: "Subscribed page number in slide" })

  return observer
}

const waitForSelector = (selector, timeout = 2000) => {
  return new Promise((resolve, reject) => {
    const interval = 100
    let elapsed = 0
    const checkExistence = () => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
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

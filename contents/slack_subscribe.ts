import type { PlasmoCSConfig } from "plasmo"

import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging"
import { listen } from "@plasmohq/messaging/message"

export const config: PlasmoCSConfig = {
  matches: ["https://app.slack.com/client/*"],
  all_frames: true
}

const selectors = {
  gslide: {
    commentNodeClassName: "punch-viewer-speaker-questions",
    listNodeSelector: ".punch-viewer-speaker-questions",
    extractFn: (el) => el.children[1].children[2]
  },
  zoom: {
    commentNodeClassName: "ReactVirtualized__Grid__innerScrollContainer",
    listNodeSelector: ".ReactVirtualized__Grid__innerScrollContainer",
    extractFn: (el) => el
  },
  slack: {
    commentNodeClassName: "c-virtual_list__item",
    listNodeSelector:
      '.p-threads_flexpane_container .c-virtual_list__scroll_container[data-qa="slack_kit_list"]',
    extractFn: (el) => el
  }
}

const subscribeComments = (platform, observeElement, sendResponse) => {
  const extractComment = (mutationRecords: MutationRecord[]): string[] => {
    console.warn(mutationRecords)
    const nodes = mutationRecords
      .filter((record) => {
        const element = record.target as Element

        // zoom
        // return element.className === selectors[platform].commentNodeClassName;
        // slack
        return element["data-item-key"] != "input"
      })
      .map((record) => record.addedNodes[0])

    console.warn(nodes.length, "nodes found")
    const comments = Array.from(nodes)
      .map((node) => {
        const element = node as HTMLElement
        const commentElement = selectors[platform].extractFn(
          element
        ) as HTMLElement

        return commentElement?.innerText
      })
      .filter((r) => r !== undefined)
    console.warn(comments)
    return comments
  }

  const observer = new MutationObserver(async function (records) {
    await sendToBackground({
      name: "hoge",
      body: { command: "Subscribe", comments: extractComment(records) }
    })
    // chrome.runtime.sendMessage({command: 'SendSubscribedComments', comments: extractComment(records)})
  })

  observer.observe(observeElement, { subtree: true, childList: true })

  sendResponse({
    screenType: "presenter",
    message: "A listener has been added to the PRESENTER side."
  })
}
console.warn("example ext slack")

const initialHandler: PlasmoMessaging.MessageHandler<string, string> = async (
  req,
  res
) => {
  const hoge = req.body
  console.warn("req", req)
  console.warn("res", res)

  console.warn(selectors)
  const observeElement = document.querySelector<HTMLDivElement>(
    selectors["slack"].listNodeSelector
  )
  // zoom
  // const observeElement = document.querySelector('.pwa-webclient__iframe')?.contentWindow.document.querySelector(selectors[platform].listNodeSelector)

  console.warn(observeElement)

  // if (observeElement === null) {
  //     console.warn('not found node');

  //     return;
  //   }

  subscribeComments("slack", observeElement, res.send)

  await sendToBackground({
    name: "hoge",
    body: { command: "Load", from: "Subscriber", tabId: req.tabId }
  })
  // res.send(hoge)
}

listen(initialHandler)

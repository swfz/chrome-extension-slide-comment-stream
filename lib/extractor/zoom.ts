import { CommentExtractor } from "~types/types"

export const zoomExtractor: CommentExtractor = {
  listNodeExtractFn: () => {
    return document.querySelector(".chat-container__chat-list")
  },
  isTargetElement: (el) => {
    return [
      "ReactVirtualized__Grid__innerScrollContainer",
      "eactVirtualized__Grid ReactVirtualized__List chat-virtualized-list"
    ].some((className) => {
      return el.className.match(className)
    })
  },
  commentExtractFn: (el) => {
    const commentContainer = el.querySelector<HTMLElement>(
      ".new-chat-message__container"
    )
    if (commentContainer === null) return ""

    console.log(commentContainer)

    return commentContainer.getAttribute("aria-label")?.split(", ").at(-1)
  }
}

export const zoomSelfPost = async (comment, send) => {
  const storage = new Storage({ area: "local" })
  const config = await storage.get("config")

  if (!config.selfpost) return

  const iframeElement = document.querySelector<HTMLIFrameElement>(
    ".pwa-webclient__iframe"
  )
  if (iframeElement === null) {
    send({ error: "Error: not found irfame..." })
    return
  }

  const p =
    iframeElement?.contentWindow?.document.querySelector<HTMLElement>(
      ".ProseMirror p"
    )

  if (p === null || p === undefined) {
    send({ error: "Error: not found p..." })
    return
  }

  p.innerText = comment

  const sendButton =
    iframeElement?.contentWindow?.document.querySelector<HTMLButtonElement>(
      ".chat-rtf-box__send"
    )
  sendButton?.click()

  send({ message: "Success Sakura Post" })
}

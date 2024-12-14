import { CommentExtractor } from "~types/types"

export const zoomExtractor: CommentExtractor = {
  listNodeExtractFn: () => {
    const iframeElement = document.querySelector<HTMLIFrameElement>(
      ".pwa-webclient__iframe"
    )
    if (iframeElement === null) {
      return null
    }

    return iframeElement.contentWindow?.document.querySelector(
      ".chat-container__chat-list"
    )
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

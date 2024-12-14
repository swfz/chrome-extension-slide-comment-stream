import { SlideExtractor } from "~types/types"

export const googleslideExtractor: SlideExtractor = {
  boxElementFn: () => {
    const iframeElement: HTMLIFrameElement | null = document.querySelector(
      ".punch-present-iframe"
    )
    const boxElement = iframeElement?.contentWindow?.document.querySelector(
      ".punch-viewer-content"
    )

    return boxElement
  }
}

import type { SlideExtractor } from "~src/types/types";

export const googleslideExtractor: SlideExtractor = {
  boxElementFn: () => {
    const iframeElement: HTMLIFrameElement | null = document.querySelector(".punch-present-iframe");
    const boxElement =
      iframeElement?.contentWindow?.document.querySelector<HTMLDivElement>(".punch-viewer-content");

    return boxElement;
  },

  pageNumberElementFn: () => {
    const iframeElement: HTMLIFrameElement | null = document.querySelector(".punch-present-iframe");
    return iframeElement?.contentWindow?.document.querySelector<HTMLDivElement>(
      ".docs-material-menu-button-flat-default-caption",
    );
  },
};

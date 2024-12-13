import { Extractor } from "~types/types"

export const slackExtractor: Extractor = {
  listNodeExtractFn: () => {
    return document.querySelector<HTMLDivElement>(
      '.p-threads_flexpane_container .c-virtual_list__scroll_container[data-qa="slack_kit_list"]'
    )
  },
  isTargetElement: (el) => {
    return el["data-item-key"] != "input"
  },
  commentExtractFn: (el) => {
    console.warn(el)

    return el?.innerText
  }
}

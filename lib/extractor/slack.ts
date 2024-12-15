import { CommentExtractor } from "~types/types"

export const slackExtractor: CommentExtractor = {
  listNodeExtractFn: () => {
    return document.querySelector<HTMLDivElement>(
      '.p-threads_flexpane_container .c-virtual_list__scroll_container[data-qa="slack_kit_list"]'
    )
  },
  isTargetElement: (el) => {
    return (
      el["data-item-key"] != "input" &&
      !el.querySelector(".c-message_kit__resend")
    )
  },
  commentExtractFn: (el) => {
    return el?.querySelector(".p-rich_text_block")?.innerText
  }
}

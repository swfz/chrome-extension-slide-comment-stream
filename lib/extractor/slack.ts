import { waitForSelector } from "~lib/poster"
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

export const slackSelfPost = async (comment, send) => {
  const textInput = document.querySelector<HTMLParagraphElement>(
    ".p-threads_footer__input .ql-editor p"
  )
  if (textInput !== null) {
    textInput.innerText = comment
    const submitSelector =
      '.p-threads_footer__input button[data-qa="texty_send_button"]'

    const submitButton = await waitForSelector(submitSelector)
    submitButton?.click()
  }
}

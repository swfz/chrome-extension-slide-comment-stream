import { waitForSelector } from "~src/lib/poster";
import type { CommentExtractor } from "~src/types/types";

export const slackExtractor: CommentExtractor = {
  listNodeExtractFn: () => {
    return document.querySelector<HTMLDivElement>(
      '.p-threads_flexpane_container .c-virtual_list__scroll_container[data-qa="slack_kit_list"]',
    );
  },
  isTargetElement: (el) => {
    // ["data-item-key"]
    return (
      (el as HTMLDivElement).dataset.itemKey != "input" &&
      !el.querySelector(".c-message_kit__resend")
    );
  },
  commentExtractFn: (el) => {
    console.log("el", el);

    return (el as HTMLDivElement).querySelector<HTMLDivElement>("div.p-rich_text_block")?.innerText;
  },
};

export const slackSelfPost = async (comment: string) => {
  const textInput = document.querySelector<HTMLParagraphElement>(
    ".p-threads_footer__input .ql-editor p",
  );
  if (textInput !== null) {
    textInput.innerText = comment;
    const submitSelector = '.p-threads_footer__input button[data-qa="texty_send_button"]';

    const submitButton = await waitForSelector<HTMLButtonElement>(submitSelector);
    submitButton?.click();
  }

  return { message: "Success sakura post" };
};

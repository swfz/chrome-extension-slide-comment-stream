import { waitForSelector } from "~src/lib/poster";
import type { CommentExtractor } from "~src/types/types";

export const zoomExtractor: CommentExtractor = {
  listNodeExtractFn: () => {
    return document.querySelector<HTMLDivElement>(".chat-container__chat-list");
  },
  isTargetElement: (el) => {
    return [
      "ReactVirtualized__Grid__innerScrollContainer",
      "eactVirtualized__Grid ReactVirtualized__List chat-virtualized-list",
    ].some((className) => {
      return el.className.match(className);
    });
  },
  commentExtractFn: (el) => {
    const commentContainer = (el as HTMLDivElement).querySelector<HTMLDivElement>(
      ".new-chat-message__container",
    );
    if (commentContainer === null) return "";

    console.log(commentContainer);

    return commentContainer.getAttribute("aria-label")?.split(", ").at(-1);
  },
};

export const zoomSelfPost = async (comment: string) => {
  const p = document.querySelector<HTMLParagraphElement>(".ProseMirror p");

  if (p === null || p === undefined) {
    return { error: "Error: not found p..." };
  }

  p.innerText = comment;

  const sendButton = await waitForSelector<HTMLButtonElement>(
    "button.chat-rtf-box__send:not([disabled])",
  );
  sendButton?.click();

  return { message: "Success sakura post" };
};

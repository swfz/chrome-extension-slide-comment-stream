import type { SlideExtractor } from "~src/types/types";

export const exampleExtractor: SlideExtractor = {
  boxElementFn: () => document.querySelector<HTMLDivElement>("div.flex"),
  pageNumberElementFn: () => {
    return document.querySelector<HTMLParagraphElement>('p[aria-label="count"]');
  },
};

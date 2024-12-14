import { SlideExtractor } from "~types/types";

export const exampleExtractor: SlideExtractor = {
  boxElementFn: () => document.querySelector<HTMLDivElement>('div')
}
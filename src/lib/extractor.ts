import { CommentExtractor, CommentSubscriber } from "~src/types/types"

import { slackExtractor } from "./extractor/slack"
import { zoomExtractor } from "./extractor/zoom"

export const extractors: { [P in CommentSubscriber]: CommentExtractor } = {
  slack: slackExtractor,
  zoom: zoomExtractor
}

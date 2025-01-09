import type { PlasmoCSConfig } from "plasmo";

import { type PlasmoMessaging, sendToBackground } from "@plasmohq/messaging";
import { listen } from "@plasmohq/messaging/message";

import { slackExtractor, slackSelfPost } from "~src/lib/extractor/slack";
import { batchInitialize } from "~src/lib/initializer";
import { subscribeComments } from "~src/lib/subscriber";
import { hasLoadParams, hasSakuraCommentParams } from "~src/types/guards";
import type { WorkerResponseBody } from "~src/types/types";

let observer = { disconnect: () => {} };

export const config: PlasmoCSConfig = {
  matches: ["https://app.slack.com/client/*"],
  all_frames: true,
};

const initialHandler: PlasmoMessaging.Handler = async (
  req,
  res: PlasmoMessaging.Response<WorkerResponseBody>,
) => {
  console.warn(req);

  // console.warn("req", req)
  // console.warn("res", res)
  if (hasLoadParams(req)) {
    const observeElement = slackExtractor.listNodeExtractFn();
    if (observeElement === null || observeElement === undefined) {
      res.send({ error: "Subscribe node not found. please open chat list" });
      return;
    }

    await sendToBackground({
      name: "connector",
      body: {
        feature: "comment",
        role: "subscriber",
        action: "connect",
        tabId: req.tabId,
        service: "slack",
      },
    }).catch((e) => {
      console.warn(e);
    });
    await sendToBackground({
      name: "connector",
      body: {
        feature: "selfpost",
        role: "handler",
        action: "connect",
        tabId: req.tabId,
        service: "slack",
      },
    }).catch((e) => {
      console.warn(e);
    });

    observer.disconnect();
    observer = subscribeComments("slack", observeElement);
    res.send({ message: "Subscribed comment list in chat." });
  }

  if (hasSakuraCommentParams(req)) {
    const m = await slackSelfPost(req.body?.comment || "");
    res.send(m);
  }
};

batchInitialize([
  { feature: "comment", role: "subscriber" },
  { feature: "selfpost", role: "handler" },
]);
listen(initialHandler);

console.log("loaded. subscriber content script.");

import type { PlasmoCSConfig } from "plasmo";

import { type PlasmoMessaging, sendToBackground } from "@plasmohq/messaging";
import { listen } from "@plasmohq/messaging/message";

import { zoomExtractor, zoomSelfPost } from "~src/lib/extractor/zoom";
import { batchInitialize } from "~src/lib/initializer";
import { subscribeComments } from "~src/lib/subscriber";
import { hasLoadParams, hasSakuraCommentParams } from "~src/types/guards";
import type { WorkerResponseBody } from "~src/types/types";

let observer = { disconnect: () => {} };

export const config: PlasmoCSConfig = {
  matches: ["https://app.zoom.us/wc/*"],
  all_frames: true,
};

const initialHandler: PlasmoMessaging.Handler = async (
  req,
  res: PlasmoMessaging.Response<WorkerResponseBody>,
) => {
  if (hasLoadParams(req)) {
    const observeElement = zoomExtractor.listNodeExtractFn();

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
        service: "zoom",
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
        service: "zoom",
      },
    }).catch((e) => {
      console.warn(e);
    });

    observer.disconnect();
    observer = subscribeComments("zoom", observeElement);
    res.send({ message: "Subscribed comment list in chat." });
  }

  if (hasSakuraCommentParams(req)) {
    const m = await zoomSelfPost(req.body?.comment || "");
    res.send(m);
  }
};

// NOTE: 2重でイベントリスナが登録されるのを防ぐための分岐 子要素に対して処理する
if (window.self !== window.top) {
  batchInitialize([
    { feature: "comment", role: "subscriber" },
    { feature: "selfpost", role: "handler" },
  ]);
  listen(initialHandler);
}

console.log("loaded. subscriber content script.");

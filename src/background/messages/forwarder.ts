import { PlasmoMessaging, sendToContentScript } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";

import { ConnectedStatus, ForwarderRequestBody, WorkerResponseBody } from "~src/types/types";

const handler: PlasmoMessaging.MessageHandler<ForwarderRequestBody, WorkerResponseBody> = async (
  req,
  res,
) => {
  const storage = new Storage({ area: "local" });
  const status = await storage.get<ConnectedStatus>("status");

  if (req.body?.action === "Subscribe") {
    await sendToContentScript({
      name: "Subscribe",
      body: req.body,
      tabId: status?.comment_handler?.tabId,
    }).catch((e) => {
      console.warn(e);
      res.send({ error: e });
    });
  }
  if (req.body?.action === "SakuraComment") {
    await sendToContentScript({
      name: "SakuraComment",
      body: req.body,
      tabId: status?.selfpost_handler?.tabId,
    }).catch((e) => {
      console.warn(e);
      res.send({ error: e });
    });
  }
};

export default handler;

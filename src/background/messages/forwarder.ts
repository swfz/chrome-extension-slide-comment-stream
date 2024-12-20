import { PlasmoMessaging, sendToContentScript } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import {
  ConnectedStatus,
  ForwarderRequestBody,
  WorkerResponseBody
} from "~src/types/types"

const handler: PlasmoMessaging.MessageHandler<
  ForwarderRequestBody,
  WorkerResponseBody
> = async (req, res) => {
  const storage = new Storage({ area: "local" })
  const status = await storage.get<ConnectedStatus>("status")

  if (req.body?.action === "Subscribe") {
    await sendToContentScript({
      action: "Subscribe",
      tabId: status?.comment_handler?.tabId,
      comments: req.body.comments
    }).catch((e) => {
      console.warn(e)
      res.send({ error: e })
    })
  }
  if (req.body?.action === "SakuraComment") {
    await sendToContentScript({
      action: "SakuraComment",
      tabId: status?.selfpost_handler?.tabId,
      comment: req.body.comment
    }).catch((e) => {
      console.warn(e)
      res.send({ error: e })
    })
  }
}

export default handler

import { PlasmoMessaging, sendToContentScript } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const storage = new Storage({ area: "local" })
  const status = await storage.get("status")
  console.log(status)

  if (req.body.action === "Subscribe") {
    await sendToContentScript({
      action: "Subscribe",
      tabId: status?.comment_handler.tabId,
      comments: req.body.comments
    })
  }
  if (req.body.action === "SakuraComment") {
    console.warn("sakura", req)

    await sendToContentScript({
      action: "SakuraComment",
      tabId: status?.selfpost_handler.tabId,
      comment: req.body.comment
    })
  }
}

export default handler

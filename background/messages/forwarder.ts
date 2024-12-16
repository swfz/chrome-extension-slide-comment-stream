import { PlasmoMessaging, sendToContentScript } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const storage = new Storage({ area: "local" })
  const status = await storage.get("state")

  if (req.body.action === "Subscribe") {
    await sendToContentScript({
      action: "Subscribe",
      tabId: status?.streamer,
      comments: req.body.comments
    })
  }
  if (req.body.action === "SakuraComment") {
    console.warn("sakura", req)

    await sendToContentScript({
      action: "SakuraComment",
      tabId: status?.poster,
      comment: req.body.comment
    })
  }
}

export default handler

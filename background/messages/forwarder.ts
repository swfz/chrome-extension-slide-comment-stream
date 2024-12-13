import { PlasmoMessaging, sendToContentScript } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  if (req.body.action === "Subscribe") {
    const storage = new Storage({ area: "local" })
    const status = await storage.get("state")

    await sendToContentScript({
      action: "Subscribe",
      tabId: status?.streamer,
      comments: req.body.comments
    })
  }
}

export default handler

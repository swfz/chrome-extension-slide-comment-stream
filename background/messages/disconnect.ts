import { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const storage = new Storage({
    area: "local"
  })

  const state = storage.get("state")
  await storage.set("state", { ...state, [req.role]: req.tabId })

  res.send("done")
}

export default handler

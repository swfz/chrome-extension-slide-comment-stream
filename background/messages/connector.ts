import { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const STORAGE_KEY = "state"

const disconnect = async (role, send) => {
  const storage = new Storage({ area: "local" })
  const state = (await storage.get(STORAGE_KEY)) || {}

  await storage.set("state", { ...state, [role]: null })
  send({ message: `disconnected ${role}.` })
}

const connect = async (role, tabId, send) => {
  const storage = new Storage({ area: "local" })
  const state = (await storage.get(STORAGE_KEY)) || {}

  console.log(role, tabId)
  await storage.set(STORAGE_KEY, { ...state, [role]: tabId })
  send({ message: `connected ${role}(${tabId})` })
}

const status = async (send) => {
  const storage = new Storage({ area: "local" })

  send(await storage.get(STORAGE_KEY))
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("connector", req)

  switch (req.body.action) {
    case "connect":
      console.log("connect")

      connect(req.body.role, req.body.tabId, res.send)
      break
    case "disconnect":
      console.log("disconnect")

      disconnect(req.body.role, res.send)
      break
    default:
      status(res.send)
  }
}

export default handler

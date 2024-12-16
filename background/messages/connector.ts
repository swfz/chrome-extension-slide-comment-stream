import { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { Feature, Role, Service } from "~types/types"

const STORAGE_KEY = "status"

const disconnect = async (feature: Feature, role: Role, send) => {
  const storage = new Storage({ area: "local" })
  const state = (await storage.get(STORAGE_KEY)) || {}
  const identifier = `${feature}_${role}`

  await storage.set("status", { ...state, [identifier]: null })
  send({ message: `disconnected ${identifier}.` })
}

const connect = async (
  feature: Feature,
  role: Role,
  service: Service,
  tabId: number,
  send
) => {
  const storage = new Storage({ area: "local" })
  const state = (await storage.get(STORAGE_KEY)) || {}
  const identifier = `${feature}_${role}`

  console.log(identifier, tabId)
  const row = {
    service,
    tabId,
    role,
    feature
  }
  await storage.set(STORAGE_KEY, { ...state, [identifier]: row })
  send({ message: `connected ${identifier}(${tabId})` })
}

const status = async (send) => {
  const storage = new Storage({ area: "local" })

  send(await storage.get(STORAGE_KEY))
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("connector", req)

  const { action, feature, role, service, tabId } = req.body

  switch (action) {
    case "connect":
      console.log("connect")

      connect(feature, role, service, tabId, res.send)
      break
    case "disconnect":
      console.log("disconnect")

      disconnect(feature, role, res.send)
      break
    default:
      status(res.send)
  }
}

export default handler

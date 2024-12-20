import { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import {
  ConnectedStatus,
  ConnectRequestBody,
  Feature,
  Role,
  Service,
  WorkerResponseBody
} from "~types/types"

const STORAGE_KEY = "status"

const disconnect = async (feature: Feature, role: Role) => {
  const storage = new Storage({ area: "local" })
  const state = (await storage.get<ConnectedStatus>(STORAGE_KEY)) || {}
  const identifier = `${feature}_${role}`

  await storage.set("status", { ...state, [identifier]: null })

  return { message: `disconnected ${identifier}.` }
}

const connect = async (
  feature: Feature,
  role: Role,
  service: Service,
  tabId: number
) => {
  const storage = new Storage({ area: "local" })
  const state = (await storage.get<ConnectedStatus>(STORAGE_KEY)) || {}
  const identifier = `${feature}_${role}`

  console.log(identifier, tabId)
  const row = {
    service,
    tabId,
    role,
    feature
  }
  await storage.set(STORAGE_KEY, { ...state, [identifier]: row })

  return { message: `connected ${identifier}(${tabId})` }
}

const status = async () => {
  const storage = new Storage({ area: "local" })

  return (await storage.get<ConnectedStatus>(STORAGE_KEY)) || {}
}

const handler: PlasmoMessaging.MessageHandler<
  ConnectRequestBody,
  WorkerResponseBody
> = async (req, res) => {
  console.log("connector", req)

  if (req.body === undefined) return

  const { action, feature, role, service, tabId } = req.body

  switch (action) {
    case "connect":
      if (service === undefined || tabId === undefined) {
        res.send({ error: "service or tabId param is undefined" })
        return
      }

      res.send(await connect(feature, role, service, tabId))
      break

    case "disconnect":
      res.send(await disconnect(feature, role))
      break

    default:
      res.send(await status())
  }
}

export default handler

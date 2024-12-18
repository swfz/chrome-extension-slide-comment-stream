import { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import {
  ConnectedStatus,
  Feature,
  RequestBody,
  ResponseBody,
  Role,
  Service
} from "~types/types"

const STORAGE_KEY = "status"

const disconnect = async (
  feature: Feature,
  role: Role,
  send: PlasmoMessaging.Response<ResponseBody>["send"]
) => {
  const storage = new Storage({ area: "local" })
  const state = (await storage.get<ConnectedStatus>(STORAGE_KEY)) || {}
  const identifier = `${feature}_${role}`

  await storage.set("status", { ...state, [identifier]: null })
  send({ message: `disconnected ${identifier}.` })
}

const batchDisconnect = async (rows): ResponseBody => {
  const storage = new Storage({ area: "local" })
  const state = (await storage.get<ConnectedStatus>(STORAGE_KEY)) || {}

  const newState = rows.reduce((state, row) => {
    const identifier = `${row.feature}_${row.role}`
    state[identifier] = null

    return state
  }, state)

  await storage.set("status", newState)

  return { message: "disconnected" }
}

const connect = async (
  feature: Feature,
  role: Role,
  service: Service,
  tabId: number,
  send: PlasmoMessaging.Response<ResponseBody>["send"]
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

  send({ message: `connected ${identifier}(${tabId})` })
}

const status = async (
  send: PlasmoMessaging.Response<ConnectedStatus | {}>["send"]
) => {
  const storage = new Storage({ area: "local" })

  send((await storage.get<ConnectedStatus>(STORAGE_KEY)) || {})
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  console.log("connector", req)

  if (req.body === undefined) return

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
    case "batchDisconnect":
      const m = batchDisconnect(req.body.rows)
      res.send(m)
    default:
      status(res.send)
  }
}

export default handler

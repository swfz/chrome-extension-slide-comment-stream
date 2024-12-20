import { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import {
  BatchDisconnectRequestBody,
  ConnectedStatus,
  ConnectionIdentifier,
  WorkerResponseBody
} from "~src/types/types"

const STORAGE_KEY = "status"

const handler: PlasmoMessaging.MessageHandler<
  BatchDisconnectRequestBody,
  WorkerResponseBody
> = async (req, res) => {
  console.log("batch connector", req)

  if (req.body === undefined) {
    res.send({ error: "request body is not found" })
    return
  }

  const storage = new Storage({ area: "local" })
  const state =
    (await storage.get<ConnectedStatus>(STORAGE_KEY)) || ({} as ConnectedStatus)

  const newState = req.body.rows.reduce((state, row) => {
    const identifier: ConnectionIdentifier = `${row.feature}_${row.role}`
    state[identifier] = null

    return state
  }, state)

  await storage.set("status", newState)

  res.send({ message: "disconnected" })
}

export default handler

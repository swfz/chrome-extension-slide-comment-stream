import { sendToBackground } from "@plasmohq/messaging"

import { Feature, Role } from "~src/types/types"

export const initialize = async (feature: Feature, role: Role) => {
  const res = await sendToBackground({
    name: "connector",
    body: { feature, role, action: "disconnect" }
  }).catch((e) => {
    console.warn(e)
  })

  console.warn(res)
}

export const batchInitialize = async (
  rows: { feature: Feature; role: Role }[]
) => {
  const res = await sendToBackground({
    name: "batchConnector",
    body: { rows, action: "disconnect" }
  }).catch((e) => {
    console.warn(e)
  })
  console.log(res)
}

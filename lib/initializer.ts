import { sendToBackground } from "@plasmohq/messaging"

import { Feature, Role } from "~types/types"

export const initialize = async (feature: Feature, role: Role) => {
  const res = await sendToBackground({
    name: "connector",
    body: { feature, role, action: "disconnect" }
  })

  console.warn(res)
}

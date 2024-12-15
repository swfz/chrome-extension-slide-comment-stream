import { sendToBackground } from "@plasmohq/messaging"

import { Role } from "~types/types"

export const initialize = async (role: Role) => {
  const res = await sendToBackground({
    name: "connector",
    body: { role, action: "disconnect" }
  })

  console.warn(res)
}

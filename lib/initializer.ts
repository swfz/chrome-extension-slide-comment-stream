import { sendToBackground } from "@plasmohq/messaging"
import { Roles } from "~types/types"

export const initialize = async (role: Roles) => {
  const res = await sendToBackground({
    name: "connector",
    body: {role, action: 'disconnect'}
  })

  console.warn(res.message)
}
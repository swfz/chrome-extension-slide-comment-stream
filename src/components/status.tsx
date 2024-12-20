import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { Config } from "~src/types/types"

interface Props {
  config: Config
}

function Status({ config }: Props) {
  const [connectionStatus, setConnectionStatus] = useStorage({
    key: "status",
    instance: new Storage({
      area: "local"
    })
  })

  const handleResetConnection = () => {
    setConnectionStatus({})
  }

  return (
    <div className="m-1 p-1 bg-gray-100">
      <p className="text-xl">Status</p>
      <button
        onClick={handleResetConnection}
        className="p-1 rounded border border-gray-400 bg-white hover:bg-gray-100">
        Reset Connection
      </button>
      <div>⬜: Not use, ✅: Ready, ❌: Not Ready</div>
      <div>
        Comment handler:{" "}
        {connectionStatus?.comment_handler
          ? `✅ (${connectionStatus.comment_handler.service})`
          : "❌"}
      </div>
      <div>
        Comment subscriber:{" "}
        {connectionStatus?.comment_subscriber
          ? `✅ (${connectionStatus.comment_subscriber.service})`
          : "❌"}
      </div>
      <div>
        Sakura handler:{" "}
        {config?.selfpost
          ? connectionStatus?.selfpost_handler
            ? `✅ (${connectionStatus.selfpost_handler.service})`
            : "❌"
          : "⬜"}
      </div>
      <div>
        Sakura subscriber:{" "}
        {config?.selfpost
          ? connectionStatus?.selfpost_subscriber
            ? `✅ (${connectionStatus.selfpost_subscriber.service})`
            : "❌"
          : "⬜"}
      </div>
    </div>
  )
}

export default Status

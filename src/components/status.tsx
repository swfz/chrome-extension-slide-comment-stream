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
    <div className="m-1 p-2 bg-gray-100 divide-y divide-gray-700">
      <p className="text-xl">Status</p>
      <div className="flex flex-row p-1">
        <div className="rounded border p-1 bg-white">
          <div>Legend: </div>
          <div>⬜: Not use, ✅: Ready, ❌: Not Ready</div>
        </div>

        <div className="grow"></div>

        <button
          onClick={handleResetConnection}
          className="p-1 rounded border font-bold text-amber-700 border-amber-900 bg-white hover:bg-amber-300">
          Reset Connection
        </button>
      </div>

      <div className="p-2">
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
    </div>
  )
}

export default Status

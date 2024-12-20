import { CheckCircle, RefreshCw, Square, XCircle } from "lucide-react"
import React from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { Config, ConnectedStatus, State } from "~src/types/types"

interface Props {
  config: Config
}

interface StateRowProps {
  children: React.ReactNode
  notUse: boolean
  state: State | null | undefined
}

const StateRow = ({ children, notUse, state }: StateRowProps) => {
  const ready = state !== null && state !== undefined

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{children}</span>
        {state && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold
                ${
                  state.service === "slack"
                    ? "bg-purple-100 text-purple-800"
                    : state.service === "zoom"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}>
            {state.service}
          </span>
        )}
      </div>
      <span
        className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold
            ${
              notUse
                ? "bg-gray-100 text-gray-800"
                : ready
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
            }`}>
        {notUse ? (
          <Square className="w-3 h-3 mr-1" />
        ) : ready ? (
          <CheckCircle className="w-3 h-3 mr-1" />
        ) : (
          <XCircle className="w-3 h-3 mr-1" />
        )}
        {notUse ? "Not Use" : ready ? "Ready" : "Not Ready"}
      </span>
    </div>
  )
}

function Status({ config }: Props) {
  const [connectionStatus, setConnectionStatus] = useStorage<ConnectedStatus>({
    key: "status",
    instance: new Storage({
      area: "local"
    })
  })

  const isCommentReady =
    connectionStatus?.comment_handler && connectionStatus?.comment_subscriber
  const isSakuraReady =
    connectionStatus?.selfpost_handler && connectionStatus?.selfpost_subscriber
  const isReady = config.selfpost ?  isCommentReady && isSakuraReady : isCommentReady

  const handleResetConnection = () => {
    setConnectionStatus({} as ConnectedStatus)
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg mb-6 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isReady ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
            <span className="font-medium">
              {isReady ? "Ready" : "NotReady"}
            </span>
          </div>
          <button
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            onClick={handleResetConnection}>
            <RefreshCw className="w-4 h-4 inline mr-1" />
            Reset Connection
          </button>
        </div>

        <div className="space-y-3">
          <StateRow notUse={false} state={connectionStatus?.comment_handler}>
            Comment handler
          </StateRow>
          <StateRow notUse={false} state={connectionStatus?.comment_subscriber}>
            Comment subscriber
          </StateRow>
          <StateRow
            notUse={config.selfpost === false}
            state={connectionStatus?.selfpost_handler}>
            Sakura handler
          </StateRow>
          <StateRow
            notUse={config.selfpost === false}
            state={connectionStatus?.selfpost_subscriber}>
            Sakura subscriber
          </StateRow>
        </div>
      </div>
    </>
  )
}

export default Status

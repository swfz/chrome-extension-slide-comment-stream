import React, { useEffect, useState } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import "./style.css"

import { detectService, serviceToHandlerFeature } from "~src/lib/service"
import { Feature } from "~src/types/types"

interface Alert {
  error: boolean
  text: string
}
interface AlertProps {
  children: React.ReactNode
  error: boolean
}

const Alert = ({ children, error }: AlertProps) => {
  return (
    <div
      className={`m-1 p-2 rounded-md ${error ? "bg-red-200 text-red-800" : "bg-blue-200 text-blue-800"}`}>
      <p className="font-bold">{error ? "Error:" : "Info:"}</p>
      <p className="">{children}</p>
    </div>
  )
}

function IndexPopup() {
  const [sampleComment, setSampleComment] = useState<string>("")
  const [feature, setFeature] = useState<Feature | null>(null)
  const [alert, setAlert] = useState<Alert | null>(null)

  const [connectionStatus, setConnectionStatus] = useStorage({
    key: "status",
    instance: new Storage({
      area: "local"
    })
  })

  const [config] = useStorage({
    key: "config",
    instance: new Storage({
      area: "local"
    })
  })

  const handleStart = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (tab === undefined) {
      setAlert({ error: true, text: "tab not found" })
      return
    }

    const res = await sendToContentScript({
      action: "Load",
      tabId: tab.id
    })

    console.warn(res)
    if (res.error) {
      setAlert({ error: true, text: res.error })
    } else {
      setAlert({ error: false, text: res.message })
    }
  }

  const streamComment = async () => {
    await sendToBackground({
      name: "forwarder",
      body: { action: "Subscribe", comments: [sampleComment] }
    }).catch((e) => {
      console.warn(e)
    })
  }

  const sakuraComment = async () => {
    await sendToBackground({
      name: "forwarder",
      body: { action: "SakuraComment", comment: sampleComment }
    }).catch((e) => {
      console.warn(e)
    })
  }

  const handleSampleComment = () => {
    if (feature === "selfpost") {
      sakuraComment()
    }
    if (feature === "comment") {
      streamComment()
    }
  }

  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSampleComment()
    }
  }

  const handleResetConnection = () => {
    setConnectionStatus({})
  }

  useEffect(() => {
    ;(async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      const url = tab?.url
      console.log("url", url)

      if (url === undefined) return

      const service = detectService(url)

      console.log("service", service)
      if (service === null) return
      setFeature(serviceToHandlerFeature(service))
    })()
  }, [])

  // TODO: コメントリストのDL機能

  return (
    <>
      {config ? (
        <div className="w-64 m-1 flex flex-col">
          <p>Click "Start" on both the slide side and the comment list side</p>

          <div className="flex flex-row bg-gray-100 m-1">
            <p>This Page available {feature} feature</p>
            <button
              className="p-1 rounded border border-gray-400 bg-white hover:bg-gray-100"
              onClick={() => chrome.runtime.openOptionsPage()}>
              ⚙ Option
            </button>
          </div>

          <div className="m-1 p-1 bg-gray-100">
            <details className="">
              <summary className="">Check Sample Comment</summary>
              <input
                type="text"
                value={sampleComment}
                onChange={(e) => setSampleComment(e.target.value)}
                onKeyDown={handleEnterKey}
                className="border rounded w-full"></input>
              <button
                className="my-1 w-full p-2 rounded border border-gray-400 bg-white hover:bg-gray-100"
                onClick={handleSampleComment}>
                Sample
              </button>
            </details>
          </div>

          <button
            className="m-1 p-2 font-medium rounded border border-gray-400 bg-white hover:bg-gray-100"
            onClick={handleStart}>
            Start!
          </button>

          {alert ? <Alert error={alert.error}>{alert.text}</Alert> : ""}

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
        </div>
      ) : (
        <div className="w-64 -m-1 flex flex-row bg-gray-10 m-1 p-2 rounded-md bg-yellow-200 text-yellow-800">
          <p className="font-bold">Warn:</p>
          <p className="grow">Please set configuration</p>
          <button
            className="p-1 rounded border border-gray-400 bg-white hover:bg-gray-100"
            onClick={() => chrome.runtime.openOptionsPage()}>
            ⚙ Option
          </button>
        </div>
      )}
    </>
  )
}

export default IndexPopup

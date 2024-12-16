import { useEffect, useState } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import "./style.css"

import { detectService, serviceToRole } from "~lib/service"
import { Role } from "~types/types"

interface Alert {
  error: boolean
  text: string
}

const Alert = ({ children, error }) => {
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
  const [role, setRole] = useState<Role | null>(null)
  const [alert, setAlert] = useState<Alert | null>(null)

  const [connectionStatus] = useStorage({
    key: "state",
    instance: new Storage({
      area: "local"
    })
  })

  const handleStart = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
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
    })
  }

  const sakuraComment = async () => {
    await sendToBackground({
      name: "forwarder",
      body: { action: "SakuraComment", comment: sampleComment }
    })
  }

  const handleSampleComment = () => {
    if (role === "subscriber") {
      sakuraComment()
    }
    if (role === "streamer") {
      streamComment()
    }
  }

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      handleSampleComment()
    }
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
      setRole(serviceToRole(service))
    })()
  }, [])

  // TODO: コメントリストのDL機能
  // TODO: sakura機能

  return (
    <div className="w-64 m-1 flex flex-col">
      <p>Click "Start" on both the slide side and the comment list side</p>

      <div className="flex flex-row bg-gray-100 m-1">
        <p>This Page is {role}</p>
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
            Sample(run only {role} page)
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
        <div>Slide ready: {connectionStatus?.streamer ? "✅" : "❌"}</div>
        <div>
          Comment Subscribe ready: {connectionStatus?.subscriber ? "✅" : "❌"}
        </div>
        <div>Sakura ready: {connectionStatus?.poster ? "✅" : "❌"}</div>
      </div>
    </div>
  )
}

export default IndexPopup

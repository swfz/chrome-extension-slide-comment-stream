import React, { useEffect, useState } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import "./style.css"

import { HelpCircle, Play, Send } from "lucide-react"

import { detectService, serviceToHandlerFeature } from "~src/lib/service"
import { Feature } from "~src/types/types"

import ExtHeader from "./components/header"
import Status from "./components/status"

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
      role="alert"
      className={`border px-4 py-3 rounded relative mb-4 ${error ? "border-red-400 bg-red-100 text-red-700" : "border-blue-400 bg-blue-100 text-blue-700"}`}>
      <strong className="font-bold">{error ? "Error:" : "Info:"}</strong>
      <span className="block sm:inline">{children}</span>
    </div>
  )
}

function IndexPopup() {
  const [sampleComment, setSampleComment] = useState<string>("")
  const [feature, setFeature] = useState<Feature | null>(null)
  const [alert, setAlert] = useState<Alert | null>(null)
  const [tab, setTab] = useState<chrome.tabs.Tab>()

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

  useEffect(() => {
    ;(async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      setTab(tab)
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
        <div className="w-96 m-1 flex flex-col">
          <ExtHeader tab={tab}></ExtHeader>
          {alert ? <Alert error={alert.error}>{alert.text}</Alert> : ""}

          <Status config={config}></Status>

          <div className="bg-white shadow rounded-lg p-4">
            <div className="space-y-4">
              <button
                className={`w-full py-2 px-4 rounded font-bold text-white bg-green-500 hover:bg-green-600`}
                onClick={handleStart}>
                <Play className="w-4 h-4 inline mr-2" />
                Start
              </button>

              <div className="space-y-2">
                <label htmlFor="sample-comment" className="font-medium">
                  Sample Comment
                </label>
                <input
                  id="sample-comment"
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                  placeholder="Enter your test comment here..."
                  value={sampleComment}
                  onKeyDown={handleEnterKey}
                  onChange={(e) => setSampleComment(e.target.value)}></input>
                <button
                  className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSampleComment}>
                  <Send className="w-4 h-4 inline mr-2" />
                  Send Sample Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-96 m-1 flex flex-col">
          <ExtHeader tab={tab}></ExtHeader>
          <p className="font-bold">Warn:</p>
          <p className="grow">Please set configuration</p>
        </div>
      )}
    </>
  )
}

export default IndexPopup

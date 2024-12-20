import React, { useEffect, useState } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import "./style.css"

import { detectService, serviceToHandlerFeature } from "~src/lib/service"
import { Feature } from "~src/types/types"

import Alert from "./components/alert"
import ExtHeader from "./components/header"
import Status from "./components/status"

interface Alert {
  error: boolean
  text: string
}

function IndexSidepanel() {
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

export default IndexSidepanel

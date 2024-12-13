import { useState } from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import "./style.css"

function IndexPopup() {
  const [sampleComment, setSampleComment] = useState<string>('');
  const [connectionStatus] = useStorage({
    key: "state",
    instance: new Storage({
      area: "local"
    })
  })

  console.log('state',connectionStatus);

  const handleStart = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const res = await sendToContentScript({
      action: "Load",
      tabId: tab.id
    })
    console.warn(res)
  }

  const handleSampleComment = async () => {
    await sendToBackground({name: "forwarder", body: {action: "Subscribe", comments: [sampleComment]}})
  }

  return (
    <div className="w-64 m-1 flex flex-col">
      <p>
        Click "Start" on both the slide side and the comment list side
      </p>

      <button
        className="m-1 p-2 rounded border border-gray-400 bg-white hover:bg-gray-100"
        onClick={() => chrome.runtime.openOptionsPage()}>
        Open Option
      </button>

      <div className="m-1 p-1 bg-gray-100">
        <details className="">
          <summary className="">
            Check Sample Comment
          </summary>
          <input type="text" value={sampleComment} onChange={(e) => setSampleComment(e.target.value)} className="border rounded w-full"></input>
          <button
            className="my-1 w-full p-2 rounded border border-gray-400 bg-white hover:bg-gray-100"
            onClick={handleSampleComment}>
            Sample(run only slidepage)
          </button>
        </details>

      </div>

      <button className="m-1 p-2 font-medium rounded border border-gray-400 bg-white hover:bg-gray-100" onClick={handleStart}>
        Start!
      </button>

      <div className="m-1 p-1 bg-gray-100">
        <p className="text-xl">Status</p>
        <div>Slide ready: {connectionStatus?.streamer ? '✅' : '❌'}</div>
        <div>Comment Subscribe ready: {connectionStatus?.subscriber ? '✅' : '❌'}</div>
        <div>Sakura ready: {connectionStatus?.poster ? '✅' : '❌'}</div>
      </div>

    </div>
  )
}

export default IndexPopup

import { useEffect, useState } from "react"
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
      name: "hoge",
      action: "Load",
      tabId: tab.id
    })
    console.warn(res)
  }

  // slide上でサンプルコメント流せるようにする
  const handleSampleComment = () => {
    console.log(sampleComment);
  }

  // 各タブとの連携状況
  return (
    <div className="w-64 m-1">
      <p>
        Click "Start" on both the slide side and the presenter user tools side
      </p>
      <button
        className="border p-2"
        onClick={() => chrome.runtime.openOptionsPage()}>
        Open Option
      </button>

      <div className="m-1">
        <div>Stream Sample Comment</div>
        <input type="text" value={sampleComment} onChange={(e) => setSampleComment(e.target.value)} className="border"></input>
        <button
          className="p-2 rounded border border-gray-400 bg-white hover:bg-gray-100"
          onClick={handleSampleComment}>
          Sample(run only slidepage)
        </button>
      </div>

      <div className="m-1">
        <button className="p-2 rounded border border-gray-400 bg-white hover:bg-gray-100" onClick={handleStart}>
          Start!
        </button>
      </div>

      <div className="m-1">
        <p>Status</p>
        <div>Slide ready: {connectionStatus?.streamer ? '✅' : '❌'}</div>
        <div>Comment Subscribe ready: {connectionStatus?.subscriber ? '✅' : '❌'}</div>
        <div>Sakura ready: {connectionStatus?.poster ? '✅' : '❌'}</div>
      </div>

    </div>
  )
}

export default IndexPopup

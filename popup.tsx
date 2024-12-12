import { useEffect, useState } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"

import "./style.css"

function IndexPopup() {
  const handleStart = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const res = await sendToContentScript({
      name: "hoge",
      command: "Load",
      tabId: tab.id
    })
    console.warn(res)
    // sendToBackground({name: 'hoge', body: {tabId}})
  }

  // slide上でサンプルコメント流せるようにする
  // 現在の機能フラグのオンオフ
  // 各タブとの連携状況

  return (
    <div>
      <p>
        Click "Start" on both the slide side and the presenter user tools side
      </p>
      <button
        className="border p-4"
        onClick={() => chrome.runtime.openOptionsPage()}>
        Open Option
      </button>
      <button className="border p-4" onClick={handleStart}>
        Start!
      </button>
    </div>
  )
}

export default IndexPopup

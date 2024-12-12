import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { useState, useEffect } from "react"
import "./style.css"

function IndexPopup() {
  const [data, setData] = useState("");

  const handleClick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const res = await sendToContentScript({name: 'hoge', command: 'Load', tabId: tab.id});
    console.warn(res);
    // sendToBackground({name: 'hoge', body: {tabId}})
  }

  // 速さとか動作の確認
  // 現在の機能フラグのオンオフ
  // 各タブとの連携状況


  return (
    <div>
      <p>Click "Start" on both the slide side and the presenter user tools side</p>
      <h2>
        Welcome to your{" "}
        <a href="https://www.plasmo.com" target="_blank">
          Plasmo
        </a>{" "}
        Extension!
        <button className="bg-indigo-500" onClick={handleClick}>Submit!</button>
      </h2>
      <input onChange={(e) => setData(e.target.value)} value={data} />
      <a href="https://docs.plasmo.com" target="_blank">
        View Docs
      </a>
    </div>
  )
}

export default IndexPopup

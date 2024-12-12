import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import "./style.css"

type Status = {
  slide: boolean;
  comment: boolean;
  sakura: boolean;
}

function IndexPopup() {
  const [sampleComment, setSampleComment] = useState('');
  const [state, setState] = useState({});

  const storage = new Storage({
    area: "local"
  })

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
        <div>Slide ready: </div>
        <div>Comment Subscribe ready:</div>
        <div>Sakura ready: </div>
      </div>


    </div>
  )
}

export default IndexPopup

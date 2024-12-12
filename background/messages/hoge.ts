import { sendToContentScript, type PlasmoMessaging } from "@plasmohq/messaging"

let streamTabId
let subscribeTabId

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log(req)
  if (req.body.command === "Load") {
    if (req.body.from === "Subscriber") {
      subscribeTabId = req.body.tabId
    }
    if (req.body.from === "Streamer") {
      streamTabId = req.body.tabId
    }
  }

  if (req.body.command === "Subscribe") {
    console.log(streamTabId)

    await sendToContentScript({
      name: "hoge",
      command: "Subscribe",
      tabId: streamTabId,
      comments: req.body.comments
    })
  }

  // await sendToContentScript({name: 'aaa', tabId: streamTabId, body: "Heello! from background"})

  res.send({
    message: "Hello from background"
  })
}

export default handler

import type { PlasmoCSConfig } from "plasmo"
import { listen } from "@plasmohq/messaging/message"
import { PlasmoMessaging, sendToBackground } from "@plasmohq/messaging";

export const config: PlasmoCSConfig = {
  matches: ["https://example.com/"],
  all_frames: true
}

type RequestBody = {
  body:{
    command: 'Load'|'Subscribe';
  }
}

type ResponseBody = {
  message: string;
}

const initialHandler: PlasmoMessaging.MessageHandler<
RequestBody,ResponseBody
> = async (req, res) => {
  console.warn('req',req);
  if (req.command === 'Load') {
    await sendToBackground({name: 'hoge', body: {command: 'Load', from: 'Streamer', tabId: req.tabId}})
  }

  if (req.command === 'Subscribe') {
    const boxElement = document.querySelector<HTMLDivElement>('div');
  
    const addComment = (comment: string) => {
      console.log('add comment');
      
      const element = document.createElement('p');
      element.innerText = comment;
  
      boxElement.appendChild(element);
    };
  
    const comments = req.comments.filter((comment) => !comment.match(/^[8８]+$/));
  
    comments.forEach((comment) => addComment(comment));
  }

}

listen(initialHandler);

console.log('sampel example.com ext');
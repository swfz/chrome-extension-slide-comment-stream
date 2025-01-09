import { Send } from "lucide-react";
import { useState } from "react";

import { sendToBackground } from "@plasmohq/messaging";

import type { Feature } from "~src/types/types";

interface Props {
  feature: Feature | null;
}

const Sample = ({ feature }: Props) => {
  const [sampleComment, setSampleComment] = useState<string>("");

  const streamComment = async () => {
    await sendToBackground({
      name: "forwarder",
      body: { action: "Subscribe", comments: [sampleComment] },
    }).catch((e) => {
      console.warn(e);
    });
  };

  const sakuraComment = async () => {
    await sendToBackground({
      name: "forwarder",
      body: { action: "SakuraComment", comment: sampleComment },
    }).catch((e) => {
      console.warn(e);
    });
  };

  const handleSampleComment = () => {
    if (feature === "selfpost") {
      sakuraComment();
    }
    if (feature === "comment") {
      streamComment();
    }
  };

  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSampleComment();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="space-y-4">
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
            onChange={(e) => setSampleComment(e.target.value)}
          ></input>
          <button
            className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSampleComment}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Send Sample Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sample;

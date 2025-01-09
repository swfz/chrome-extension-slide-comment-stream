import { useEffect, useState } from "react";

import { sendToContentScript } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

import "./style.css";

import { Play } from "lucide-react";

import { detectService, serviceToHandlerFeature } from "~src/lib/service";
import type { Feature, LoadParams } from "~src/types/types";

import Alert from "./components/alert";
import ExtHeader from "./components/header";
import Sample from "./components/sample";
import Status from "./components/status";

interface Alert {
  error: boolean;
  text: string;
}

function IndexSidepanel() {
  const [feature, setFeature] = useState<Feature | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [tab, setTab] = useState<chrome.tabs.Tab>();

  const [config] = useStorage({
    key: "config",
    instance: new Storage({
      area: "local",
    }),
  });

  const handleStart = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab === undefined) {
      setAlert({ error: true, text: "tab not found" });
      return;
    }

    const res = await sendToContentScript<LoadParams>({
      name: "Load",
      tabId: tab.id,
    });

    console.warn(res);
    if (res.error) {
      setAlert({ error: true, text: res.error });
    } else {
      setAlert({ error: false, text: res.message });
    }
  };

  useEffect(() => {
    (async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      setTab(tab);
      const url = tab?.url;
      console.log("url", url);

      if (url === undefined) return;

      const service = detectService(url);

      console.log("service", service);
      if (service === null) return;
      setFeature(serviceToHandlerFeature(service));
    })();
  }, []);

  // TODO: コメントリストのDL機能

  return (
    <>
      {config ? (
        <div className="w-96 m-1 flex flex-col">
          <ExtHeader tab={tab} />
          {alert ? <Alert error={alert.error}>{alert.text}</Alert> : ""}

          <Status config={config} />

          <div className="bg-white shadow rounded-lg mb-6 p-4">
            <div className="space-y-4">
              <button
                type="button"
                className={
                  "w-full py-2 px-4 rounded font-bold text-white bg-green-500 hover:bg-green-600"
                }
                onClick={handleStart}
              >
                <Play className="w-4 h-4 inline mr-2" />
                Start
              </button>
            </div>
          </div>

          <Sample feature={feature} />
        </div>
      ) : (
        <div className="w-96 m-1 flex flex-col">
          <ExtHeader tab={tab} />
          <p className="font-bold">Warn:</p>
          <p className="grow">Please set configuration</p>
        </div>
      )}
    </>
  );
}

export default IndexSidepanel;

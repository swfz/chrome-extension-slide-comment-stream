import { PanelRightOpen, Settings } from "lucide-react";

interface Props {
  tab?: chrome.tabs.Tab;
}

const ExtHeader = ({ tab }: Props) => {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Comment Slide Stream</h1>
      <div className="flex gap-2">
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="p-2 rounded-full hover:bg-gray-200"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        {tab && (
          <button
            onClick={() => chrome.sidePanel.open({ windowId: tab.windowId })}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="Open side panel"
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default ExtHeader;

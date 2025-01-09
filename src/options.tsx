import CssFilterConverter from "css-filter-converter";
import { ChangeEvent, useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";

import "./style.css";

import { Check, ChevronDown, ChevronUp, Settings2 } from "lucide-react";

import { Config, SelfpostConfig } from "~src/types/types";

export const defaultConfig = {
  color: "#000000",
  font: "",
  duration: 4,
  sizePx: 50,
  clapColor: "#000000",
  clapSize: 80,
  selfpost: false,
};

const sampleSelfPostConfig = {
  "2": [
    { seconds: 0.5, comment: "looks good" },
    { seconds: 3, comment: "cooooooooooool!!!!" },
  ],
  "3": [{ seconds: 1, comment: "8888888888" }],
  "4": [{ seconds: 2, comment: "wow" }],
};

function OptionsPage() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [selfpostConfig, setSelfpostConfig] = useState<SelfpostConfig>();
  const [selfpostConfigText, setSelfpostConfigText] = useState<string>();
  const [previewBackground, setPreviewBackground] = useState<string>("#FFFFFF");
  const [error, setError] = useState("");
  const [isSelfpostExpanded, setIsSelfpostExpanded] = useState(false);

  const storage = new Storage({
    area: "local",
  });

  const fonts = ["メイリオ", "ＭＳ ゴシック", "ＭＳ 明朝", "HGS行書体", "HGP創英角ﾎﾟｯﾌﾟ体"];

  const handleNumberChange = (key: keyof Config) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setConfig((prev) => ({ ...prev, [key]: parseInt(event.target.value) }));
    };
  };

  const handleSelectChange = (key: keyof Config) => {
    return (event: ChangeEvent<HTMLSelectElement>) => {
      setConfig((prev) => ({ ...prev, [key]: event.target.value }));
    };
  };

  const handleColorChange = (key: keyof Config) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setConfig((prev) => ({ ...prev, [key]: event.target.value }));
    };
  };

  const handleBoolChange = (key: keyof Config) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setConfig((prev) => ({ ...prev, [key]: event.target.checked }));
    };
  };

  const validateJSON = (text: string) => {
    try {
      if (!text.trim()) {
        setError("");
        return;
      }

      JSON.parse(text);
      setError("");
    } catch (e) {
      if (e instanceof Error) {
        setError("Invalid JSON: " + e.message);
      } else {
        console.error("unkown error", e);
      }
    }
  };

  const handleSelfhostConfigChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setSelfpostConfigText(event.target.value);
    validateJSON(event.target.value);
  };

  const handlePaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
    setTimeout(() => {
      validateJSON(e.currentTarget.value);
    }, 0);
  };

  const isError = () => error !== "";

  const handleSubmit = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab === undefined) {
      return;
    }

    await storage.set("config", config);
    await storage.set("selfpost", JSON.parse(selfpostConfigText || "{}"));
  };

  useEffect(() => {
    (async () => {
      const config = await storage.get<Config>("config");
      setConfig(config || defaultConfig);

      const selfpostConfig = await storage.get<SelfpostConfig>("selfpost");
      setSelfpostConfig(selfpostConfig || ({} as SelfpostConfig));
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings2 className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Slide Comment Stream</h1>
          </div>
          <p className="text-gray-600 mt-1">Configure your comment stream settings</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Comment Color
            </label>
            <div className="flex items-center gap-2">
              <input
                id="color"
                type="color"
                className="h-10 w-20 p-1 rounded border border-gray-300"
                value={config.color}
                onChange={handleColorChange("color")}
              />
              <span className="text-sm text-gray-500">{config.color}</span>
            </div>
          </div>

          <div>
            <label htmlFor="font" className="block text-sm font-medium text-gray-700 mb-1">
              Font Family
            </label>
            <select
              id="font"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={config.font}
              onChange={handleSelectChange("font")}
            >
              <option value="">Select a font</option>
              {fonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (seconds)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              className="w-32 p-2 border border-gray-300 rounded-md"
              value={config.duration}
              onChange={handleNumberChange("duration")}
            />
            <p className="text-sm text-gray-500 mt-1">Time until the comment scrolls away</p>
          </div>

          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
              Size (px)
            </label>
            <input
              id="size"
              type="number"
              min="1"
              className="w-32 p-2 border border-gray-300 rounded-md"
              value={config.sizePx}
              onChange={handleNumberChange("sizePx")}
            />
            <p className="text-sm text-gray-500 mt-1">Font size of the comments</p>
          </div>

          <div>
            <label htmlFor="clapColor" className="block text-sm font-medium text-gray-700 mb-1">
              Clap Effect Color
            </label>
            <div className="flex items-center gap-2">
              <input
                id="clapColor"
                type="color"
                className="h-10 w-20 p-1 rounded border border-gray-300"
                value={config.clapColor}
                onChange={handleColorChange("clapColor")}
              />
              <span className="text-sm text-gray-500">{config.clapColor}</span>
            </div>
          </div>

          <div>
            <label htmlFor="clapSize" className="block text-sm font-medium text-gray-700 mb-1">
              Clap Effect Size
            </label>
            <input
              id="clapSize"
              type="number"
              min="1"
              className="w-32 p-2 border border-gray-300 rounded-md"
              value={config.clapSize}
              onChange={handleNumberChange("clapSize")}
            />
            <p className="text-sm text-gray-500 mt-1">Size of the clap effect icon</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="selfpost" className="block text-sm font-medium text-gray-700">
                  Sakura Mode
                </label>
                <p className="text-sm text-gray-500">Enable automatic comment posting</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="selfpost"
                  className="sr-only peer"
                  checked={config.selfpost}
                  onChange={handleBoolChange("selfpost")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {config.selfpost && (
              <div className="mt-4 border border-gray-200 rounded-md">
                <button
                  onClick={() => setIsSelfpostExpanded(!isSelfpostExpanded)}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Sakura Configuration</span>
                  {isSelfpostExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {isSelfpostExpanded && (
                  <div className="p-4 space-y-4">
                    <div className="bg-gray-100 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Example Configuration</h4>
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(sampleSelfPostConfig, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <label
                        htmlFor="selfpostConfig"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Configuration
                      </label>
                      <textarea
                        id="selfpostConfig"
                        className="w-full p-2 border border-gray-300 rounded-md font-mono"
                        rows={10}
                        defaultValue={JSON.stringify(selfpostConfig, null, 2)}
                        onChange={handleSelfhostConfigChange}
                        onPaste={handlePaste}
                      ></textarea>
                      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <hr className="my-6 border-t border-gray-200" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Preview</h3>
              <div className="flex items-center gap-2">
                <label htmlFor="previewBg" className="text-sm">
                  Background
                </label>
                <input
                  id="previewBg"
                  type="color"
                  className="h-8 w-16 p-0 border border-gray-300 rounded"
                  value={previewBackground}
                  onChange={(e) => setPreviewBackground(e.target.value)}
                />
              </div>
            </div>

            <div
              className="flex items-center justify-between rounded-lg border p-6"
              style={{ backgroundColor: previewBackground }}
            >
              <span
                style={{
                  color: config.color,
                  fontSize: `${config.sizePx}px`,
                  fontFamily: config.font,
                }}
              >
                Preview Text
              </span>
              <div
                style={{
                  filter: CssFilterConverter.hexToFilter(config.clapColor).color || "",
                }}
              >
                <img
                  src="assets/sign_language_black_24dp.svg"
                  alt="clap effect"
                  height={config.clapSize}
                  width={config.clapSize}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isError()}
          >
            <Check className="inline-block mr-2 h-4 w-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default OptionsPage;

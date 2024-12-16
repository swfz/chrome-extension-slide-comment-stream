import CssFilterConverter from "css-filter-converter"
import { ChangeEvent, useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import "./style.css"

import { Config } from "~types/types"

export const defaultConfig = {
  color: "#000000",
  font: "",
  duration: 4,
  sizePx: 50,
  clapColor: "#000000",
  clapSize: 80,
  selfpost: false
}

const sampleSelfPostConfig = {
  "2": [
    { seconds: 0.5, comment: "looks good" },
    { seconds: 3, comment: "cooooooooooool!!!!" }
  ],
  "4": [{ seconds: 2, comment: "wow" }]
}

function OptionsPage() {
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [selfpostConfig, setSelfpostConfig] = useState()
  const [selfpostConfigText, setSelfpostConfigText] = useState<string>()
  const [previewBackground, setPreviewBackground] = useState<string>("#FFFFFF")
  const [error, setError] = useState("")

  const storage = new Storage({
    area: "local"
  })

  const fonts = [
    "メイリオ",
    "ＭＳ ゴシック",
    "ＭＳ 明朝",
    "HGS行書体",
    "HGP創英角ﾎﾟｯﾌﾟ体"
  ]

  const handleNumberChange = (key: keyof Config) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setConfig((prev) => ({ ...prev, [key]: parseInt(event.target.value) }))
    }
  }

  const handleSelectChange = (key: keyof Config) => {
    return (event: ChangeEvent<HTMLSelectElement>) => {
      setConfig((prev) => ({ ...prev, [key]: event.target.value }))
    }
  }

  const handleColorChange = (key: keyof Config) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setConfig((prev) => ({ ...prev, [key]: event.target.value }))
    }
  }

  const handleBoolChange = (key: keyof Config) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setConfig((prev) => ({ ...prev, [key]: event.target.checked }))
    }
  }

  const validateJSON = (text) => {
    try {
      if (!text.trim()) {
        setError("")
        return
      }

      JSON.parse(text)
      setError("")
    } catch (e) {
      setError("Invalid JSON: " + e.message)
    }
  }

  const handleSelfhostConfigChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSelfpostConfigText(event.target.value)
    validateJSON(event.target.value)
  }

  const handlePaste = (e) => {
    setTimeout(() => {
      validateJSON(e.target.value)
    }, 0)
  }

  const isError = () => error !== ""

  const handleSubmit = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (tab.id === undefined) {
      return
    }

    await storage.set("config", config)
    await storage.set("selfpost", JSON.parse(selfpostConfigText))
  }

  useEffect(() => {
    ;(async () => {
      const config = await storage.get<Config>("config")
      setConfig(config || defaultConfig)

      const selfpostConfig = await storage.get("selfpost")
      setSelfpostConfig(selfpostConfig || {})
    })()
  }, [])

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md flex flex-col divide-y divide-gray-300">
        <h2 className="p-6 text-2xl font-bold text-gray-900">
          Slide Comment Stream
        </h2>

        <form>
          <div className="flex flex-col p-6 space-y-2">
            <div className="space-y-2">
              <label
                htmlFor="color"
                className="block text-sm font-medium text-gray-700">
                Comment Color:
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="color"
                  type="color"
                  className="w-16 h-8 p-0 border border-gray-300 rounded"
                  onChange={handleColorChange("color")}
                  value={config.color}></input>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="font"
                className="block text-sm font-medium text-gray-700">
                Comment Font:
              </label>
              <select
                value={config.font}
                onChange={handleSelectChange("font")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {fonts.map((font) => {
                  return (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700">
                Duration(seconds):
              </label>
              <p className="text-sm text-gray-500">
                The number of seconds until the comment scrolls away
              </p>
              <input
                id="duration"
                type="number"
                onChange={handleNumberChange("duration")}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={config.duration}></input>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="size"
                className="block text-sm font-medium text-gray-700">
                Size(px):
              </label>
              <p className="text-sm text-gray-500">
                The size of the comment in pixels
              </p>
              <input
                id="size"
                type="number"
                onChange={handleNumberChange("sizePx")}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={config.sizePx}></input>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="clapColor"
                className="block text-sm font-medium text-gray-700">
                Clap(color):
              </label>
              <p className="text-sm text-gray-500">
                The color of the clap effect when a clap comment is posted
              </p>
              <input
                id="clapColor"
                type="color"
                className="w-16 h-8 p-0 border border-gray-300 rounded"
                onChange={handleColorChange("clapColor")}
                value={config.clapColor}></input>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="clapSize"
                className="block text-sm font-medium text-gray-700">
                Clap(size):
              </label>
              <p className="text-sm text-gray-500">
                The image tag size(width and height) of the clap effect when a
                clap comment is posted
              </p>
              <input
                id="clapSize"
                type="number"
                onChange={handleNumberChange("clapSize")}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={config.clapSize}></input>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="selfpost"
                className="block text-sm font-medium text-gray-700">
                Use Selfpost(sakura):
              </label>
              <input
                id="selfpost"
                type="checkbox"
                onChange={handleBoolChange("selfpost")}
                checked={config.selfpost}></input>
              <div className="m-1 p-1">
                <p className="text-sm text-gray-500">
                  A feature to comment on your own presentation in real-time.
                  You need to predefine the content of the comment and its
                  timing.
                </p>

                {config.selfpost ? (
                  <div>
                    <p>
                      This function is used to play a predefined comment at a
                      predetermined timing.
                    </p>
                    <p>The key is the slide number</p>
                    <p>
                      When you transition to the target slide number, a
                      `comment` message is automatically posted after `seconds`
                      seconds of each line
                    </p>
                    <p className="font-bold">For example</p>
                    <pre className="bg-gray-100 text-gray-800 text-xs p-4 rounded-md overflow-x-auto">
                      <code>
                        {JSON.stringify(sampleSelfPostConfig, null, 2)}
                      </code>
                    </pre>
                    <label htmlFor="selfpost">Configuration</label>
                    <textarea
                      defaultValue={JSON.stringify(selfpostConfig, null, 2)}
                      onChange={handleSelfhostConfigChange}
                      onPaste={handlePaste}
                      className="w-full rounded-md border border-gray-600"
                      id="selfpost"
                      rows={20}></textarea>

                    {error && (
                      <div className="p-3 bg-red-100 border border-red-400 rounded-md">
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="p-4 w-full">
          <button
            disabled={isError()}
            className="p-2 w-full rounded border border-gray-400 bg-white hover:bg-gray-100"
            onClick={handleSubmit}>
            Save
          </button>
        </div>

        <div className="flex flex-col p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-90">Preview</h2>
          <p>
            On the left, the style settings for comments are applied, and on the
            right, the style settings for applause are applied
          </p>
          <div className="text-sm font-medium text-gray-700">
            Preview Background Color:
            <input
              type="color"
              className="w-16 h-8 p-0 border border-gray-300 rounded"
              onChange={(e) => setPreviewBackground(e.target.value)}></input>
          </div>

          <div
            className="p-4 flex flex-row border border-gray-900"
            style={{
              backgroundColor: previewBackground
            }}>
            <div
              style={{
                verticalAlign: "bottom",
                color: config.color,
                fontSize: config.sizePx,
                fontFamily: config.font
              }}>
              Preview
            </div>
            <div className="grow"></div>
            <div
              style={{
                filter: CssFilterConverter.hexToFilter(config.clapColor).color
              }}>
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
    </div>
  )
}

export default OptionsPage

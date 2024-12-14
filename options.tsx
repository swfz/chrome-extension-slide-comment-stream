import { ChangeEvent, useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import "./style.css"

type Config = {
  platform: string
  color: string
  font: string
  speedPx: number
  duration: number
  sizePx: number
  clap: string
  plant: boolean
}

const defaultConfig = {
  platform: "slack",
  color: "#000000",
  font: "",
  speedPx: 5,
  duration: 4,
  sizePx: 50,
  clap: "none",
  plant: false
}
// 各種設定
// さくらコメント設定

function OptionsPage() {
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [previewBackground, setPreviewBackground] = useState<string>("#000000")

  const storage = new Storage({
    area: "local"
  })

  const platforms: Config["platform"][] = ["gslide", "zoom", "slack", "meet"]
  const fonts = [
    "メイリオ",
    "ＭＳ ゴシック",
    "ＭＳ 明朝",
    "HGS行書体",
    "HGP創英角ﾎﾟｯﾌﾟ体"
  ]

  const claps = ["none", "black", "white", "pink"]

  const handlePlatformChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setConfig((prev) => ({ ...prev, platform: event.target.value }))
  }
  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, color: event.target.value }))
  }
  const handleFontChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setConfig((prev) => ({ ...prev, font: event.target.value }))
  }
  const handleDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, duration: parseInt(event.target.value) }))
  }
  const handleSpeedPxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, speedPx: parseInt(event.target.value) }))
  }
  const handleSizePxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, sizePx: parseInt(event.target.value) }))
  }
  const handleClapChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setConfig((prev) => ({ ...prev, clap: event.target.value }))
  }
  const handlePlantChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, plant: event.target.checked }))
  }

  const handleSubmit = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (tab.id === undefined) {
      return
    }

    await storage.set("config", config)
  }

  useEffect(() => {
    ;(async () => {
      const config = await storage.get<Config>("config")
      console.log(config)

      setConfig(config || defaultConfig)
    })()
  }, [])

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md flex flex-col divide-y divide-gray-300">
        <h2 className="p-6 text-2xl font-bold text-gray-900">
          Slide Comment Stream
        </h2>

        <form>
          <div className="flex flex-col p-6 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="platform"
                className="block text-sm font-medium text-gray-700">
                Subscribe Platform:
              </label>
              <select
                value={config.platform}
                onChange={handlePlatformChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {platforms.map((platform) => {
                  return (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  )
                })}
              </select>
            </div>

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
                  onChange={handleColorChange}
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
                onChange={handleFontChange}
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
                Duration(seconds):{" "}
              </label>
              <p className="text-sm text-gray-500">
                The number of seconds until the comment scrolls away
              </p>
              <input
                id="duration"
                type="number"
                onChange={handleDurationChange}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={config.duration}></input>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="speed"
                className="block text-sm font-medium text-gray-700">
                Speed(px/frame):{" "}
              </label>
              <input
                id="speed"
                type="number"
                onChange={handleSpeedPxChange}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={config.speedPx}></input>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="size"
                className="block text-sm font-medium text-gray-700">
                Size(px):{" "}
              </label>
              <p className="text-sm text-gray-500">
                The size of the comment in pixels
              </p>
              <input
                id="size"
                type="number"
                onChange={handleSizePxChange}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={config.sizePx}></input>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="clap"
                className="block text-sm font-medium text-gray-700">
                Clap(color):
              </label>
              <p className="text-sm text-gray-500">
                The color of the clap effect when a clap comment is posted
              </p>
              <select
                value={config.clap}
                onChange={handleClapChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {claps.map((value) => {
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="plant"
                className="block text-sm font-medium text-gray-700">
                Use Plant:
              </label>
              <p className="text-sm text-gray-500">
                A feature to comment on your own presentation in real-time. You
                need to predefine the content of the comment and its timing.
              </p>
              <input
                id="plant"
                type="checkbox"
                onChange={handlePlantChange}
                checked={config.plant}></input>
            </div>
          </div>
        </form>

        <div className="p-4 w-full">
          <button
            className="p-2 w-full rounded border border-gray-400 bg-white hover:bg-gray-100"
            onClick={handleSubmit}>
            Save
          </button>
        </div>

        <div className="flex flex-col p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-90">Preview</h2>
          <div className="text-sm font-medium text-gray-700">
            Preview Background Color:
            <input
              type="color"
              className="w-16 h-8 p-0 border border-gray-300 rounded"
              onChange={(e) => setPreviewBackground(e.target.value)}></input>
          </div>

          <div
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptionsPage

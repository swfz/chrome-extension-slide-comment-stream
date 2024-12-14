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
  clapSize: number
  plant: boolean
}

const defaultConfig = {
  platform: "slack",
  color: "#FFFFFF",
  font: "",
  speedPx: 5,
  duration: 4,
  sizePx: 50,
  clap: "black",
  clapSize: 80,
  plant: false
}

function OptionsPage() {
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [previewBackground, setPreviewBackground] = useState<string>("#FFFFFF")

  const storage = new Storage({
    area: "local"
  })

  const clapFilters = {
    black:
      "brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(26%) hue-rotate(88deg) brightness(87%) contrast(105%)",
    white:
      "brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(288deg) brightness(102%) contrast(102%)",
    pink: "brightness(0) saturate(100%) invert(29%) sepia(69%) saturate(6456%) hue-rotate(316deg) brightness(103%) contrast(107%)"
  }

  const platforms: Config["platform"][] = ["zoom", "slack", "meet"]
  const fonts = [
    "メイリオ",
    "ＭＳ ゴシック",
    "ＭＳ 明朝",
    "HGS行書体",
    "HGP創英角ﾎﾟｯﾌﾟ体"
  ]

  const claps = ["black", "white", "pink"]

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
                onChange={handleSelectChange("platform")}
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
                htmlFor="speed"
                className="block text-sm font-medium text-gray-700">
                Speed(px/frame):
              </label>
              <input
                id="speed"
                type="number"
                onChange={handleNumberChange("speedPx")}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={config.speedPx}></input>
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
                htmlFor="clap"
                className="block text-sm font-medium text-gray-700">
                Clap(color):
              </label>
              <p className="text-sm text-gray-500">
                The color of the clap effect when a clap comment is posted
              </p>
              <select
                value={config.clap}
                onChange={handleSelectChange("clap")}
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
                onChange={handleBoolChange("plant")}
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
            <div style={{ filter: clapFilters[config.clap] }}>
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

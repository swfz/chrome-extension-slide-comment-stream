import { ChangeEvent, useEffect, useState } from 'react';
import { Storage } from "@plasmohq/storage"
import "./style.css"

type Config = {
  platform: string;
  color: string;
  font: string;
  speedPx: number;
  sizePx: number;
  clap: string;
  plant: boolean;
};

const defaultConfig = {
  platform: 'slack',
  color: '#000000',
  font: '',
  speedPx: 5,
  sizePx: 50,
  clap: 'none',
  plant: false
}
// 各種設定
// さくらコメント設定

function OptionsPage() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [status, setStatus] = useState<string>();
  const storage = new Storage({
    area: "local"
  });

  const isDev = process.env.NODE_ENV === 'development';
  const platforms: Config['platform'][] = ['gslide', 'zoom', 'slack', 'meet'];
  const fonts = ['メイリオ', 'ＭＳ ゴシック', 'ＭＳ 明朝', 'HGS行書体', 'HGP創英角ﾎﾟｯﾌﾟ体'];

  const claps = ['none', 'black', 'white', 'pink'];

  const handlePlatformChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setConfig((prev) => ({ ...prev, platform: event.target.value }));
  };
  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, color: event.target.value }));
  };
  const handleFontChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setConfig((prev) => ({ ...prev, font: event.target.value }));
  };
  const handleSpeedPxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, speedPx: parseInt(event.target.value) }));
  };
  const handleSizePxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, sizePx: parseInt(event.target.value) }));
  };
  const handleClapChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setConfig((prev) => ({ ...prev, clap: event.target.value }));
  };
  const handlePlantChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, plant: event.target.checked }));
  };

  const handleSubmit = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.id === undefined) {
      return;
    }

    await storage.set('config', config);
  };

  const sampleComments = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.id === undefined) {
      return;
    }

    const comments = [`${Date.now()} サンプルコメント8888`];
    chrome.tabs.sendMessage(tab.id, { command: 'SendSubscribedComments', comments }, (res) => {
      console.log(res);
    });
  };

  useEffect(() => {
    (async () => {
      const config = await storage.get<Config>('config');
      console.log(config);
      
      setConfig(config);
    })();
  }, []);

  return (
    <div className="">
      <h2>GoogleSlide Comment Stream</h2>
      <form>
        <div className="flex flex-col divide-y divide-gray-300">
          <div className="flex flex-row p-4">
            <label htmlFor="platform" className="">
              Subscribe Platform:{' '}
            </label>
            <div className="border">
              <select value={config.platform} onChange={handlePlatformChange}>
                {platforms.map((platform) => {
                  return (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex flex-row p-4">
            <label htmlFor="color" className="">
              Comment Color:{' '}
            </label>
            <div className="">
              <input id="color" type="color" onChange={handleColorChange} value={config.color}></input>
            </div>
          </div>

          <div className="flex flex-row p-4">
            <label htmlFor="font" className="">
              Comment Font:{' '}
            </label>
            <div className="border">
              <select value={config.font} onChange={handleFontChange}>
                {fonts.map((font) => {
                  return (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex flex-row p-4">
            <label htmlFor="speed" className="">
              Speed(px/frame):{' '}
            </label>
            <div className="border">
              <input id="speed" type="number" onChange={handleSpeedPxChange} value={config.speedPx}></input>
            </div>
          </div>

          <div className="flex flex-row p-4">
            <label htmlFor="size" className="">
              Size(px):{' '}
            </label>
            <div className="border">
              <input id="size" type="number" onChange={handleSizePxChange} value={config.sizePx}></input>
            </div>
          </div>

          <div className="flex flex-row p-4">
            <label htmlFor="clap" className="">
              Clap(color):{' '}
            </label>
            <div className="border">
              <select value={config.clap} onChange={handleClapChange}>
                {claps.map((value) => {
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex flex-row p-4">
            <label htmlFor="plant" className="">
              Use Plant(require option configuration):{' '}
            </label>
            <div className="">
              <input id="plant" type="checkbox" onChange={handlePlantChange} checked={config.plant}></input>
            </div>
          </div>
        </div>
      </form>


      <h2>Preview</h2>
      <div className="bg-black">
        <div style={{ verticalAlign: 'bottom', color: config.color, fontSize: config.sizePx, fontFamily: config.font }}>Preview</div>
      </div>

      <br />
      <button className="p-2 rounded border border-gray-400 bg-white hover:bg-gray-100" onClick={handleSubmit}>Submit</button>
      {isDev ? <button className="p-2 rounded border border-gray-400 bg-white hover:bg-gray-100" onClick={sampleComments}>Sample</button> : ''}
      <div>{status}</div>
    </div>
  );
}

export default OptionsPage

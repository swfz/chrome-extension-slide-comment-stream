import CssFilterConverter from "css-filter-converter"
import clapImage from "data-base64:~assets/sign_language_black_24dp.svg"

import { Config } from "~types/types"

const removelinkBar = (iframeElement: HTMLIFrameElement) => {
  const linkBar =
    iframeElement.contentWindow?.document.querySelector<HTMLDivElement>(
      ".punch-viewer-questions-link-bar-container"
    )
  const content =
    iframeElement.contentWindow?.document.querySelector<HTMLDivElement>(
      ".punch-viewer-content"
    )
  const wrapper =
    iframeElement.contentWindow?.document.querySelector<HTMLDivElement>(
      ".punch-viewer-page-wrapper-container"
    )

  if (linkBar != null && wrapper != null && content != null) {
    linkBar.remove()

    content.style.height = `100%`
    content.style.width = `100%`
    content.style.left = "0"
    wrapper.style.height = "100%"
    wrapper.style.width = `100%`
    wrapper.style.top = "0"
    wrapper.style.left = "0"
  }
}

const fixCommentStyles = (config: Config) => {
  const minMs = config.duration * 1000 - 1000
  const maxMs = config.duration * 1000 + 1000
  const verticalPosition = Math.floor(Math.random() * 80 + 10)
  const animationDuration = Math.floor(Math.random() * minMs + maxMs)

  return {
    top: `${verticalPosition}%`,
    position: `absolute`,
    right: `-30%`,
    animation: `slideLeft ${animationDuration}ms linear`,
    color: config.color,
    fontFamily: config.font,
    fontSize: `${config.sizePx}px`,
    whiteSpace: `nowrap`
  }
}

const fixClapStyles = (config: Config, boxElement: HTMLDivElement) => {
  const containerWidth = boxElement.clientWidth
  const clapElementBottom = boxElement.clientHeight * 0.1
  const clapElementRight = containerWidth * 0.1

  const shakeIndex = Math.floor(Math.random() * 5) + 1

  return {
    width: `${config.clapSize}px`,
    height: `${config.clapSize}px`,
    position: "absolute",
    bottom: `${clapElementBottom}px`,
    right: `${clapElementRight}px`,
    filter: CssFilterConverter.hexToFilter(config.clapColor).color,
    animation: `shake${shakeIndex} 0.5s ease-in-out infinite, fadeOut 2s ease-in-out forwards`
  }
}

const renderClap = (
  boxElement: HTMLDivElement,
  config: Config,
  claps: number
): void => {
  const clapElement = document.createElement("div")
  const p = document.createElement("p")
  p.style.margin = "0"

  const img = document.createElement("img")
  img.src = clapImage
  img.width = config.clapSize
  img.height = config.clapSize

  clapElement.appendChild(p)
  clapElement.appendChild(img)

  const clapElementStyles = fixClapStyles(config, boxElement)

  clapElement.style.all = "initial"
  Object.entries(clapElementStyles).forEach(
    ([k, v]) => (clapElement.style[k] = v)
  )
  p.innerText = `+${claps.toString()}`

  clapElement.onanimationend = (e) => {
    const element = e.target
    if (element) {
      element.style.display = `none`
    }
  }
  boxElement.appendChild(clapElement)
}

const renderComment = (
  boxElement: HTMLDivElement,
  config: Config,
  comment: string
) => {
  const commentStyle = fixCommentStyles(config)

  const element = document.createElement("p")
  element.style.all = "initial"
  element.innerText = comment

  element.onanimationend = (e) => {
    const commentElement = e.target
    if (commentElement) {
      commentElement.style.display = `none`
    }
  }
  Object.entries(commentStyle).forEach(([k, v]) => (element.style[k] = v))

  boxElement.appendChild(element)
}

const render = (
  boxElement: HTMLDivElement,
  config: Config,
  comments: string[]
) => {
  const claps = comments.reduce((n, c) => n + c.match(/[8８]/g)?.length, 0)
  if (claps > 0) {
    renderClap(boxElement, config, claps)
  }

  const filteredComments = comments.filter((c) => !c.match(/^[8８]+$/))

  filteredComments.forEach((c) => renderComment(boxElement, config, c))
}

export { removelinkBar, render }

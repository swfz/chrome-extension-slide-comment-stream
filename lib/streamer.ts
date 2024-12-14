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

const clapFilters = {
  black:
    "brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(26%) hue-rotate(88deg) brightness(87%) contrast(105%)",
  white:
    "brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(288deg) brightness(102%) contrast(102%)",
  pink: "brightness(0) saturate(100%) invert(29%) sepia(69%) saturate(6456%) hue-rotate(316deg) brightness(103%) contrast(107%)"
}

const commentElementStyle = (config, windowWidth, top) => {
  return {
    transform: `translateX(${windowWidth}px)`,
    color: config.color || "#000",
    fontFamily: config.font,
    fontSize: `${config.sizePx || 50}px`,
    position: "absolute",
    top: `${top}px`,
    whiteSpace: "nowrap"
  }
}
const clapElementStyle = (bottom, right) => {
  return {
    width: "100px",
    height: "100px",
    position: "absolute",
    bottom: `${bottom}px`,
    right: `${right}px`,
    opacity: "0"
  }
}

const renderClaps = (
  recievedClaps: number,
  p: HTMLElement,
  clapElement: HTMLElement,
  clapElementBottom: number,
  clapElementRight: number,
  config
) => {
  p.innerText = `+${recievedClaps.toString()}`

  clapElement.style.filter = clapFilters[config.clap] || clapFilters["black"]

  const randomMotion = (range) => {
    // + - range分のランダム数値
    return Math.floor(Math.random() * (range - -range + 1)) + -range
  }

  let opacity = 1
  const clapAnimation = () => {
    if (opacity >= 0) {
      opacity = opacity - 0.01
      clapElement.style.opacity = opacity.toString()
      clapElement.style.bottom = clapElementBottom + randomMotion(2) + "px"
      clapElement.style.right = clapElementRight + randomMotion(2) + "px"
      requestAnimationFrame(clapAnimation)
    }
  }
  clapAnimation()
}

const addComment = (
  comment: string,
  boxElement: Element,
  containerHeight: number,
  config
) => {
  console.log("add comment")

  const element = document.createElement("p")
  element.innerText = comment

  boxElement.appendChild(element)

  const random = Math.random()
  const elementTop = (containerHeight - element.clientHeight) * random

  const moveUnit = config.speedPx || 5

  const windowWidth = document.body.clientWidth
  const commentStyles = commentElementStyle(config, windowWidth, elementTop)
  Object.entries(commentStyles).forEach(([k, v]) => (element.style[k] = v))

  let moveX = windowWidth
  const elementWidth = element.clientWidth

  const moveAnimation = () => {
    if (moveX >= -elementWidth) {
      moveX = moveX - moveUnit
      element.style.transform = `translateX(${moveX}px)`
      requestAnimationFrame(moveAnimation)
    }
  }
  moveAnimation()
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
  const clapElementBottom = boxElement.clientHeight * 0.3
  const clapElementRight = containerWidth * 0.2

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

export {
  clapElementStyle,
  commentElementStyle,
  clapFilters,
  removelinkBar,
  addComment,
  renderClaps,
  render
}

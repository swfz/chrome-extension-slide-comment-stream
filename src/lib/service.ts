import { Feature, Service } from "~src/types/types"

const detectService = (url: string): Service | null => {
  if (url.match(/docs.google.com\/presentation/)) {
    return "googleslide"
  }
  if (url.match(/app.slack.com\/client/)) {
    return "slack"
  }
  if (url.match(/tools.swfz.io/)) {
    return "example"
  }
  if (url.match(/app.zoom.us\/wc/)) {
    return "zoom"
  }

  return null
}

const serviceToHandlerFeature = (service: Service | null): Feature | null => {
  if (service === null) return null

  const serviceMap = {
    googleslide: "comment",
    example: "comment",
    slack: "selfpost",
    zoom: "selfpost"
  } as const

  return serviceMap[service]
}

export { detectService, serviceToHandlerFeature }

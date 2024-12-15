import { Role, Service } from "~types/types"

const detectService = (url: string): Service | null => {
  if (url.match(/docs.google.com\/presentation/)) {
    return "googleslide"
  }
  if (url.match(/app.slack.com\/client/)) {
    return "slack"
  }
  if (url.match(/example.com/)) {
    return "example"
  }
  if (url.match(/app.zoom.us\/wc/)) {
    return "zoom"
  }

  return null
}

const serviceToRole = (service: Service | null): Role | null => {
  if (service === null) return null

  const serviceMap = {
    googleslide: "streamer",
    example: "streamer",
    slack: "subscriber",
    zoom: "subscriber"
  } as const

  return serviceMap[service]
}

export { detectService, serviceToRole }

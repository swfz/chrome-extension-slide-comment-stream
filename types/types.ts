export type Roles = 'subscriber'|'streamer'|'poster';
export type ConnectedTabs = {
  [Role in Roles]: number|null;
}

// toBackgroundArgs
// toContentArgs

export type MessageArgs = {
  role: Roles
  action: "Load"|"Subscribe"
  tabId: number|null
  comments?: string[]
}

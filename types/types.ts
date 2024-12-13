export type Roles = 'subscriber'|'streamer'|'poster';
export type ConnectedTabs = {
  [Role in Roles]: number|null;
}

import {
  ContentMessagebase,
  LoadParams,
  SakuraCommentParams,
  SubscribeParams
} from "./types"

function createContentScriptTypeGuard<T extends ContentMessagebase>(
  actionType: T["action"]
) {
  return (message: ContentMessagebase): message is T =>
    message.action === actionType
}

export const isLoadParams = createContentScriptTypeGuard<LoadParams>("Load")
export const isSubscribeParams =
  createContentScriptTypeGuard<SubscribeParams>("Subscribe")
export const isSakuraCommentParams =
  createContentScriptTypeGuard<SakuraCommentParams>("SakuraComment")

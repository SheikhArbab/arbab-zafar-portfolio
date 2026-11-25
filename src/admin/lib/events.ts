/** Fired on window when contact messages change (read/archive/delete), so the sidebar badge refreshes. */
export const MESSAGES_CHANGED = 'az:messages-changed'

export function notifyMessagesChanged() {
  window.dispatchEvent(new Event(MESSAGES_CHANGED))
}

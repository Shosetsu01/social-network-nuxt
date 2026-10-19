type ClickLike = Pick<MouseEvent, 'button' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>

/** A primary-button click without modifiers. Others belong to the browser: new tab, window or download. */
export function isPlainClick(event: ClickLike): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

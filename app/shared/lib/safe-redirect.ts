const HOME_PATH = '/'
const PLACEHOLDER_ORIGIN = 'http://placeholder.invalid'

/**
 * Returns `target` only if it stays on this origin, otherwise the home path.
 * Parsing with URL normalises tricks like `/\evil.com` or tab-injected `//` exactly as the browser would.
 */
export function safeRedirect(target: unknown): string {
  if (typeof target !== 'string' || !target.startsWith('/')) return HOME_PATH
  try {
    const url = new URL(target, PLACEHOLDER_ORIGIN)
    return url.origin === PLACEHOLDER_ORIGIN ? `${url.pathname}${url.search}${url.hash}` : HOME_PATH
  }
  catch {
    // Unparseable input is untrusted by definition.
    return HOME_PATH
  }
}

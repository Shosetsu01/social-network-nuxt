const HOME_PATH = '/'
const PLACEHOLDER_ORIGIN = 'http://placeholder.invalid'
// A path that starts with `//` or `/\` is read by the browser as a protocol-relative URL to another host.
const PROTOCOL_RELATIVE = /^\/[/\\]/

/**
 * Returns `target` only if it stays on this origin, otherwise the home path.
 * Parsing with URL normalises `/\evil.com`, tab-injected `//` and dot segments the way the browser does;
 * the normalised path is then checked again, because `/.//evil.com` collapses to `//evil.com`.
 */
export function safeRedirect(target: unknown): string {
  if (typeof target !== 'string' || !target.startsWith('/')) return HOME_PATH
  try {
    const url = new URL(target, PLACEHOLDER_ORIGIN)
    const path = `${url.pathname}${url.search}${url.hash}`
    return url.origin === PLACEHOLDER_ORIGIN && !PROTOCOL_RELATIVE.test(path) ? path : HOME_PATH
  }
  catch {
    // Unparseable input is untrusted by definition.
    return HOME_PATH
  }
}

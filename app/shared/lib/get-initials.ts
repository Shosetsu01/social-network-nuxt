/** "Allan Paterson" → "AP": first letters of at most the first two words. */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => (Array.from(word)[0] ?? '').toUpperCase())
    .join('')
}

// Fixed locale keeps SSR and client output identical.
const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

/** 1247 → "1.2K", 1500000 → "1.5M". */
export function formatCompactNumber(value: number): string {
  return compactFormatter.format(value)
}

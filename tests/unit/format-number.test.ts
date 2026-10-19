import { describe, expect, it } from 'vitest'
import { formatCompactNumber } from '~/shared/lib/format-number'

describe('formatCompactNumber', () => {
  it.each([
    [0, '0'],
    [892, '892'],
    [1000, '1K'],
    [1247, '1.2K'],
    [15200, '15.2K'],
    [128400, '128.4K'],
    [1_500_000, '1.5M'],
  ])('formats %d as %s', (value, expected) => {
    expect(formatCompactNumber(value)).toBe(expected)
  })
})

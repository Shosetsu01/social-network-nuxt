import { describe, expect, it } from 'vitest'
import { getInitials } from '@shared/lib/get-initials'

describe('getInitials', () => {
  it.each([
    ['Allan Paterson', 'AP'],
    ['Madonna', 'M'],
    ['  sarah   jane  johnson ', 'SJ'],
    ['élodie durand', 'ÉD'],
    ['', ''],
    ['   ', ''],
  ])('turns %j into %j', (name, expected) => {
    expect(getInitials(name)).toBe(expected)
  })
})

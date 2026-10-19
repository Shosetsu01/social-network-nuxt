import { describe, expect, it } from 'vitest'
import { isPlainClick } from '@shared/lib/is-plain-click'

const PLAIN = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }

describe('isPlainClick', () => {
  it('accepts a primary-button click without modifiers', () => {
    expect(isPlainClick(PLAIN)).toBe(true)
  })

  it.each(['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const)('rejects a click with %s', (key) => {
    expect(isPlainClick({ ...PLAIN, [key]: true })).toBe(false)
  })

  it.each([1, 2])('rejects button %i', (button) => {
    expect(isPlainClick({ ...PLAIN, button })).toBe(false)
  })
})

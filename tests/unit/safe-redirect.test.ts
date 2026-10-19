import { describe, expect, it } from 'vitest'
import { safeRedirect } from '@shared/lib/safe-redirect'

describe('safeRedirect', () => {
  it.each([
    ['/x', '/x'],
    ['/users/2', '/users/2'],
    ['/users/2?tab=bio#top', '/users/2?tab=bio#top'],
  ])('keeps internal path %j', (input, expected) => {
    expect(safeRedirect(input)).toBe(expected)
  })

  it.each([
    '//evil.com',
    '/\\evil.com',
    '/\t/evil.com',
    'http://evil.com',
    'https://evil.com/users/2',
    'javascript:alert(1)',
    '/.//evil.com',
    '/a/..//evil.com',
    '/%2e%2e//evil.com',
    '/%2e//evil.com',
    '/./\\evil.com',
    'users/2',
    '',
  ])('falls back to home for unsafe target %j', (input) => {
    expect(safeRedirect(input)).toBe('/')
  })

  it.each([undefined, null, 42, ['/users/2'], { path: '/users/2' }])('falls back to home for non-string %j', (input) => {
    expect(safeRedirect(input)).toBe('/')
  })
})

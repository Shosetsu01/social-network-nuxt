import { describe, expect, it } from 'vitest'
import { isLoginRequest, validateEmail, validatePassword } from '#shared/utils/validation'

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toBe('Please enter your email')
  })

  it.each([
    'allan',
    'allan@',
    'allan@example',
    'allan@example.c',
    'allan@example.museum',
    'allan@exa mple.com',
    ' allan@example.com',
  ])('rejects malformed address %j', (value) => {
    expect(validateEmail(value)).toBe('Please enter a valid email')
  })

  it.each([
    'allan@example.com',
    'first.last-name_1@mail.example.co',
  ])('accepts %j', (value) => {
    expect(validateEmail(value)).toBeNull()
  })
})

describe('validatePassword', () => {
  it('requires a value', () => {
    expect(validatePassword('')).toBe('Please enter your password')
  })

  it('rejects passwords shorter than 6 characters', () => {
    expect(validatePassword('12345')).toBe('Password must be at least 6 characters')
  })

  it('accepts passwords of 6 characters or more', () => {
    expect(validatePassword('123456')).toBeNull()
  })
})

describe('isLoginRequest', () => {
  it('accepts an object with string email and password', () => {
    expect(isLoginRequest({ email: 'a', password: 'b' })).toBe(true)
  })

  it.each([
    null,
    undefined,
    'allan@example.com',
    [],
    { email: 'allan@example.com' },
    { password: 'secret1' },
    { email: 1, password: 'secret1' },
    { email: 'allan@example.com', password: null },
  ])('rejects %j', (value) => {
    expect(isLoginRequest(value)).toBe(false)
  })
})

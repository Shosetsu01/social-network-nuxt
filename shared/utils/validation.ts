import type { LoginRequest } from '../types/api'

// Same rules and messages as the original Flutter login form; no trimming, like the original.
const EMAIL_PATTERN = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/
const PASSWORD_MIN_LENGTH = 6

export function validateEmail(value: string): string | null {
  if (value.length === 0) return 'Please enter your email'
  if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email'
  return null
}

export function validatePassword(value: string): string | null {
  if (value.length === 0) return 'Please enter your password'
  if (value.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  return null
}

export function isLoginRequest(value: unknown): value is LoginRequest {
  return typeof value === 'object'
    && value !== null
    && 'email' in value
    && typeof value.email === 'string'
    && 'password' in value
    && typeof value.password === 'string'
}

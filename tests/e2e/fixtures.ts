import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { LoginPage } from './login.page'

export { expect }

// Mirrors user "1" in server/utils/mock-db.ts: the mock backend signs everybody in as this user.
export const CURRENT_USER = {
  id: '1',
  name: 'Allan Paterson',
  avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  email: 'allan@example.com',
} as const

// Any syntactically valid pair works against the mock backend.
export const VALID_CREDENTIALS = { email: 'allan@example.com', password: 'secret123' } as const

const SESSION_COOKIE = 'socio_session'
// Blocked external images and fonts surface as this console error; they are expected offline.
const BLOCKED_RESOURCE_MESSAGE = /Failed to load resource/

interface Fixtures {
  blockExternalNetwork: undefined
  failOnBrowserErrors: undefined
  authedPage: Page
  loginPage: LoginPage
}

export const test = base.extend<Fixtures>({
  // Tests must not depend on randomuser.me, picsum.photos or Google Fonts.
  blockExternalNetwork: [
    async ({ context }, use) => {
      await context.route(
        url => url.protocol.startsWith('http') && url.hostname !== 'localhost',
        route => route.abort(),
      )
      await use(undefined)
    },
    { auto: true },
  ],

  // Catches what a green UI assertion hides, e.g. hydration mismatches and unhandled rejections.
  failOnBrowserErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
      page.on('console', (message) => {
        if (message.type() === 'error' && !BLOCKED_RESOURCE_MESSAGE.test(message.text())) {
          errors.push(`console.error: ${message.text()}`)
        }
      })
      await use(undefined)
      expect(errors, 'unexpected browser errors').toEqual([])
    },
    { auto: true },
  ],

  // A page whose context already holds the session cookie, in the format the app writes after login.
  authedPage: async ({ context, page }, use) => {
    await context.addCookies([{
      name: SESSION_COOKIE,
      value: encodeURIComponent(JSON.stringify(CURRENT_USER)),
      domain: 'localhost',
      path: '/',
    }])
    await use(page)
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
})

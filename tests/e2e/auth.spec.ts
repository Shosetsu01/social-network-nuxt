import type { Locator } from '@playwright/test'
import { VALID_CREDENTIALS, expect, test } from './fixtures'
import { expectPathname, gotoHydrated } from './helpers'

const LOGIN_API = '**/api/auth/login'
const FEED_API = '**/api/feed'
const FEED_POST_COUNT = 6

/** A request held by `page.route` until the test decides to let it through. */
function createGate() {
  let open = (): void => {}
  const opened = new Promise<void>((resolve) => {
    open = resolve
  })
  return { opened, open }
}

async function expectFieldError(field: Locator, message: string): Promise<void> {
  await expect(field).toHaveAttribute('aria-invalid', 'true')
  await expect(field).toHaveAccessibleDescription(message)
}

test('1. a guest opening / is redirected to /login', async ({ page, loginPage }) => {
  await gotoHydrated(page, '/')

  await expectPathname(page, '/login')
  await expect(loginPage.heading).toBeVisible()
})

test.describe('desktop only', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop-only scenario (plan.md section 6, T5)')

  test('2. the login form shows validation errors for empty, invalid and short input', async ({ page, loginPage }) => {
    const loginRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('/api/auth/login')) loginRequests.push(request.url())
    })
    await loginPage.goto()

    await test.step('empty submit', async () => {
      await loginPage.submit.click()

      await expectFieldError(loginPage.email, 'Please enter your email')
      await expectFieldError(loginPage.password, 'Please enter your password')
    })

    await test.step('invalid email after blur', async () => {
      await loginPage.email.fill('not-an-email')
      await loginPage.password.focus()

      await expectFieldError(loginPage.email, 'Please enter a valid email')
    })

    await test.step('short password after blur', async () => {
      await loginPage.password.fill('12345')
      await loginPage.email.focus()

      await expectFieldError(loginPage.password, 'Password must be at least 6 characters')
    })

    await test.step('invalid input never reaches the API', async () => {
      await loginPage.submit.click()

      await expectFieldError(loginPage.email, 'Please enter a valid email')
      expect(loginRequests).toEqual([])
    })
  })

  test('3. the password visibility toggle switches the field between password and text', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.password.fill(VALID_CREDENTIALS.password)

    await expect(loginPage.password).toHaveAttribute('type', 'password')
    await expect(loginPage.showPassword).toHaveAttribute('aria-pressed', 'false')

    await loginPage.showPassword.click()

    await expect(loginPage.showPassword).toHaveAttribute('aria-pressed', 'true')
    await expect(loginPage.password).toHaveAttribute('type', 'text')
    await expect(loginPage.password).toHaveValue(VALID_CREDENTIALS.password)

    await loginPage.showPassword.click()

    await expect(loginPage.showPassword).toHaveAttribute('aria-pressed', 'false')
    await expect(loginPage.password).toHaveAttribute('type', 'password')
  })

  test('9. a failed login request shows a "Login failed" alert and keeps the form usable', async ({ page, loginPage }) => {
    await page.route(LOGIN_API, route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Mock failure' }),
    }))
    await loginPage.goto()

    await loginPage.login(VALID_CREDENTIALS.email, VALID_CREDENTIALS.password)

    await expect(loginPage.submitError).toHaveText(/^Login failed/)
    await expect(loginPage.submit).toBeEnabled()
    await expect(loginPage.submit).not.toHaveAttribute('aria-busy', 'true')
    await expectPathname(page, '/login')
  })
})

test('4. logging in shows a busy submit button, then the feed with 6 posts', async ({ page, loginPage }) => {
  const loginGate = createGate()
  const feedGate = createGate()
  await page.route(LOGIN_API, async (route) => {
    await loginGate.opened
    await route.continue()
  })
  await page.route(FEED_API, async (route) => {
    await feedGate.opened
    await route.continue()
  })
  await loginPage.goto()

  await loginPage.login(VALID_CREDENTIALS.email, VALID_CREDENTIALS.password)

  await expect(loginPage.submit).toBeDisabled()
  await expect(loginPage.submit).toHaveAttribute('aria-busy', 'true')
  await expect(loginPage.submit).toHaveAccessibleName('Login')

  loginGate.open()
  await expectPathname(page, '/')
  await expect(page.locator('[aria-busy="true"]').filter({ has: page.getByTestId('post-skeleton') })).toBeVisible()

  feedGate.open()
  await expect(page.getByTestId('post-card')).toHaveCount(FEED_POST_COUNT)
  await expect(page.getByTestId('post-skeleton')).toHaveCount(0)
})

test('10. a deep link to /users/2 returns there after logging in', async ({ page, loginPage }) => {
  await gotoHydrated(page, '/users/2')

  await expectPathname(page, '/login')
  await loginPage.login(VALID_CREDENTIALS.email, VALID_CREDENTIALS.password)

  await expectPathname(page, '/users/2')
  await expect(page.getByRole('heading', { level: 1, name: 'Sarah Johnson' })).toBeVisible()
})

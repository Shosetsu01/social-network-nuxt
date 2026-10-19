import type { Locator, Page } from '@playwright/test'
import { CURRENT_USER, expect, test } from './fixtures'
import { expectPathname, gotoHydrated } from './helpers'

// Author of the first feed post (mock-db: post-1).
const FIRST_POST_AUTHOR = { id: '2', name: 'Sarah Johnson' } as const
const AUTHOR_PROFILE_PATH = `/users/${FIRST_POST_AUTHOR.id}`

function backLink(page: Page): Locator {
  return page.getByRole('link', { name: 'Back', exact: true })
}

function authorHeading(page: Page): Locator {
  return page.getByRole('heading', { level: 1, name: FIRST_POST_AUTHOR.name })
}

async function openAuthorFromFeed(page: Page): Promise<void> {
  await gotoHydrated(page, '/')
  await page.getByTestId('post-card').first().getByRole('link', { name: FIRST_POST_AUTHOR.name }).first().click()
  await expectPathname(page, AUTHOR_PROFILE_PATH)
}

// Pagination may append more cards, so only the restored first card is asserted, not the total.
async function expectFeedRestored(page: Page): Promise<void> {
  await expectPathname(page, '/')
  const firstPost = page.getByTestId('post-card').first()
  await expect(firstPost).toBeVisible()
  await expect(firstPost.getByRole('link', { name: FIRST_POST_AUTHOR.name }).first()).toBeVisible()
}

test('16. "Back" on another user\'s profile returns to the feed; the own profile has none', async ({ authedPage: page }) => {
  await openAuthorFromFeed(page)
  await expect(authorHeading(page)).toBeVisible()
  await expect(backLink(page)).toHaveAttribute('href', '/')
  // router.back() keeps the history length; the fallback navigation would push a new entry.
  const historyLength = await page.evaluate(() => window.history.length)

  await backLink(page).click()

  await expectFeedRestored(page)
  expect(await page.evaluate(() => window.history.length)).toBe(historyLength)

  await gotoHydrated(page, `/users/${CURRENT_USER.id}`)

  await expect(page.getByRole('heading', { level: 1, name: CURRENT_USER.name })).toBeVisible()
  await expect(backLink(page)).toHaveCount(0)
})

test('17. "Back" on a directly opened profile falls back to the feed', async ({ authedPage: page }) => {
  await gotoHydrated(page, AUTHOR_PROFILE_PATH)
  await expect(authorHeading(page)).toBeVisible()

  // A modified click is left to the browser: the fallback opens in a new window, this page stays.
  // A Shift+click window has no opener, so Chromium reports it as a new context page, not a 'popup'.
  const newWindowEvent = page.context().waitForEvent('page')
  await backLink(page).click({ modifiers: ['Shift'] })
  const newWindow = await newWindowEvent
  await expect(newWindow).toHaveURL(url => url.pathname === '/')
  await newWindow.close()
  await expectPathname(page, AUTHOR_PROFILE_PATH)

  await backLink(page).click()

  await expectFeedRestored(page)
})

test('18. a slow profile shows the skeleton during client navigation', async ({ authedPage: page }) => {
  // The profile response waits for the gate, so the skeleton is asserted without a timing race.
  // Only the browser request is held: page.route does not reach the SSR fetch inside Nitro.
  const { promise: gate, resolve: release } = Promise.withResolvers<undefined>()
  await page.route(`**/api/users/${FIRST_POST_AUTHOR.id}`, async (route) => {
    await gate
    await route.continue()
  })

  await openAuthorFromFeed(page)

  const skeleton = page.getByTestId('profile-skeleton')
  await expect(skeleton).toBeVisible()
  await expect(skeleton).toHaveAttribute('aria-busy', 'true')
  await expect(skeleton).toContainText('Loading profile…')

  release(undefined)

  await expect(authorHeading(page)).toBeVisible()
  await expect(skeleton).toHaveCount(0)
})

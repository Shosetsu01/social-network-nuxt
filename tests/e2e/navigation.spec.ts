import type { Locator, Page } from '@playwright/test'
import { CURRENT_USER, expect, test } from './fixtures'
import { expectPathname, gotoHydrated } from './helpers'

// Author of the first feed post (mock-db: post-1).
const FIRST_POST_AUTHOR = { id: '2', name: 'Sarah Johnson' } as const
const AUTHOR_PROFILE_PATH = `/users/${FIRST_POST_AUTHOR.id}`
// Long enough to see the skeleton, short enough to keep the test fast.
const PROFILE_RESPONSE_DELAY_MS = 1500

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

  await backLink(page).click()

  await expectFeedRestored(page)

  await gotoHydrated(page, `/users/${CURRENT_USER.id}`)

  await expect(page.getByRole('heading', { level: 1, name: CURRENT_USER.name })).toBeVisible()
  await expect(backLink(page)).toHaveCount(0)
})

test('17. "Back" on a directly opened profile falls back to the feed', async ({ authedPage: page }) => {
  await gotoHydrated(page, AUTHOR_PROFILE_PATH)
  await expect(authorHeading(page)).toBeVisible()

  await backLink(page).click()

  await expectFeedRestored(page)
})

test('18. a slow profile shows the skeleton during client navigation', async ({ authedPage: page }) => {
  // Only the browser request is delayed: page.route does not reach the SSR fetch inside Nitro.
  await page.route(`**/api/users/${FIRST_POST_AUTHOR.id}`, async (route) => {
    await new Promise(resolve => setTimeout(resolve, PROFILE_RESPONSE_DELAY_MS))
    await route.continue()
  })

  await openAuthorFromFeed(page)

  const skeleton = page.getByTestId('profile-skeleton')
  await expect(skeleton).toBeVisible()
  await expect(skeleton).toHaveAttribute('aria-busy', 'true')
  await expect(skeleton).toContainText('Loading profile…')

  await expect(authorHeading(page)).toBeVisible()
  await expect(skeleton).toHaveCount(0)
})

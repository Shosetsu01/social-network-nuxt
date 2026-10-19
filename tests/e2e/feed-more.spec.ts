import { expect, test } from './fixtures'
import { gotoHydrated } from './helpers'

const PAGE_SIZE = 6
const TOTAL_POST_COUNT = 30
const END_OF_FEED = 'You\'re all caught up.'

// The first page is exactly `/api/feed`; only the following pages carry a cursor.
const isNextPageRequest = (url: URL): boolean => url.pathname === '/api/feed' && url.searchParams.has('cursor')

test('12. scrolling to the end loads all 30 posts and says the feed is over', async ({ authedPage: page }) => {
  await gotoHydrated(page, '/')
  const cards = page.getByTestId('post-card')
  const endOfFeed = page.getByText(END_OF_FEED)
  await expect(cards).toHaveCount(PAGE_SIZE)
  await expect(endOfFeed).toHaveCount(0)

  // Every pass brings the current last card into view, which puts the sentinel in range of the next page.
  await expect(async () => {
    await cards.last().scrollIntoViewIfNeeded()
    await expect(endOfFeed).toBeVisible({ timeout: 1_000 })
  }).toPass({ timeout: 20_000 })

  await expect(cards).toHaveCount(TOTAL_POST_COUNT)
  await expect(page.getByRole('status').filter({ hasText: 'more posts' })).toHaveText(`Loaded ${PAGE_SIZE} more posts.`)
  await expect(page.getByTestId('feed-loading-more')).toHaveCount(0)
})

test('12b. a failed next page keeps the loaded posts, and Retry loads it with a busy indicator', async ({ authedPage: page }) => {
  let shouldFail = true
  let releaseRetry = (): void => {}
  const retryReleased = new Promise<void>((resolve) => {
    releaseRetry = resolve
  })
  await page.route(isNextPageRequest, async (route) => {
    if (shouldFail) {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Mock failure' }) })
      return
    }
    await retryReleased
    await route.continue()
  })
  await gotoHydrated(page, '/')
  const cards = page.getByTestId('post-card')
  await expect(cards).toHaveCount(PAGE_SIZE)

  await cards.last().scrollIntoViewIfNeeded()

  await expect(page.getByRole('alert').filter({ hasText: 'Could not load more posts.' })).toBeVisible()
  await expect(cards).toHaveCount(PAGE_SIZE)

  shouldFail = false
  await page.getByRole('button', { name: 'Retry' }).click()

  await expect(page.getByTestId('feed-loading-more')).toHaveAttribute('aria-busy', 'true')

  releaseRetry()

  await expect(cards).toHaveCount(PAGE_SIZE * 2)
  await expect(page.getByText('Could not load more posts.')).toHaveCount(0)
})

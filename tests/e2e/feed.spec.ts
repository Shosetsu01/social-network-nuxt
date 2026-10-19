import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { expectPathname, gotoHydrated } from './helpers'

const FEED_POST_COUNT = 6

// Author of the first feed post (mock-db: post-1), expected on the profile page.
const FIRST_POST_AUTHOR = {
  id: '2',
  name: 'Sarah Johnson',
  bio: 'Designing calm, accessible interfaces. Sketchbook always in my bag.',
  stats: ['Followers', '3.5K', 'Following', '512', 'Posts', '214'],
}

async function openFeed(page: Page): Promise<Locator> {
  await gotoHydrated(page, '/')
  const posts = page.getByTestId('post-card')
  await expect(posts).toHaveCount(FEED_POST_COUNT)
  return posts.first()
}

async function readCount(counter: Locator): Promise<number> {
  await expect(counter).toHaveText(/^\d+$/)
  return Number(await counter.innerText())
}

test('5. liking a post adds one to the counter and a second click takes it back', async ({ authedPage: page }) => {
  const firstPost = await openFeed(page)
  const like = firstPost.getByRole('button', { name: 'Like', exact: true })
  const likeCount = firstPost.getByTestId('like-count')
  const initialCount = await readCount(likeCount)
  await expect(like).toHaveAttribute('aria-pressed', 'false')

  await like.click()

  await expect(like).toHaveAttribute('aria-pressed', 'true')
  await expect(likeCount).toHaveText(String(initialCount + 1))

  await like.click()

  await expect(like).toHaveAttribute('aria-pressed', 'false')
  await expect(likeCount).toHaveText(String(initialCount))
})

test('6. the author link opens the profile and a like survives going back', async ({ authedPage: page }) => {
  const firstPost = await openFeed(page)
  const like = firstPost.getByRole('button', { name: 'Like', exact: true })
  const likeCount = firstPost.getByTestId('like-count')
  const initialCount = await readCount(likeCount)
  await like.click()
  await expect(like).toHaveAttribute('aria-pressed', 'true')

  await firstPost.getByRole('link', { name: FIRST_POST_AUTHOR.name }).first().click()

  await expectPathname(page, `/users/${FIRST_POST_AUTHOR.id}`)
  await expect(page.getByRole('heading', { level: 1, name: FIRST_POST_AUTHOR.name })).toBeVisible()
  await expect(page.getByTestId('profile-bio')).toHaveText(FIRST_POST_AUTHOR.bio)
  for (const text of FIRST_POST_AUTHOR.stats) {
    await expect(page.getByTestId('profile-stats')).toContainText(text)
  }
  // "Log out" belongs to the signed-in user's own profile only.
  await expect(page.getByRole('button', { name: 'Log out' })).toHaveCount(0)

  await page.goBack()

  await expectPathname(page, '/')
  await expect(page.getByTestId('post-card')).toHaveCount(FEED_POST_COUNT)
  await expect(like).toHaveAttribute('aria-pressed', 'true')
  await expect(likeCount).toHaveText(String(initialCount + 1))
})

import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { waitForHydration } from './helpers'

// The first feed post (mock-db: post-1).
const FIRST_POST = {
  path: '/posts/post-1',
  author: { id: '2', name: 'Sarah Johnson' },
  comments: 12,
}

async function expectPostPage(page: Page): Promise<Locator> {
  await expect(page.getByRole('heading', { level: 1, name: `Post by ${FIRST_POST.author.name}` })).toBeAttached()
  const card = page.getByTestId('post-card')
  await expect(card).toHaveCount(1)
  await expect(card.getByTestId('comment-count')).toHaveText(String(FIRST_POST.comments))
  await expect(page.getByRole('heading', { level: 2, name: 'Comments' })).toBeVisible()
  await expect(page.getByRole('list', { name: 'Comments' }).getByTestId('comment')).toHaveCount(FIRST_POST.comments)
  // The card on its own page links nowhere back to itself.
  await expect(card.locator(`a[href="${FIRST_POST.path}"]`)).toHaveCount(0)
  return card
}

test('13b. a direct link renders the post and its comments on the server', async ({ authedPage: page }) => {
  const response = await page.goto(FIRST_POST.path)
  const html = await response?.text()

  expect(response?.status()).toBe(200)
  expect(html).toContain('data-testid="post-card"')
  expect(html).toContain('data-testid="comment"')

  await waitForHydration(page)
  const card = await expectPostPage(page)
  const like = card.getByRole('button', { name: 'Like', exact: true })
  await like.click()
  await expect(like).toHaveAttribute('aria-pressed', 'true')
})

test('15. an unknown post shows the "Page not found" page', async ({ authedPage: page }) => {
  const response = await page.goto('/posts/unknown')
  await waitForHydration(page)

  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
})

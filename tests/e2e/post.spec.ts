import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { expectPathname, gotoHydrated, waitForHydration } from './helpers'

// The first feed post (mock-db: post-1).
const FIRST_POST = {
  path: '/posts/post-1',
  author: { id: '2', name: 'Sarah Johnson' },
  likes: 45,
  comments: 12,
}
const POST_API = '**/api/posts/post-1'

type NuxtWindow = Window & { useNuxtApp?: () => { $router: { push: (path: string) => Promise<unknown> } } }

async function openFirstCard(page: Page): Promise<Locator> {
  await gotoHydrated(page, '/')
  const firstCard = page.getByTestId('post-card').first()
  await expect(firstCard).toBeVisible()
  return firstCard
}

function timeLink(card: Locator): Locator {
  return card.getByRole('link').filter({ has: card.page().locator('time') })
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

test('13. the time of the first card opens its post page, and a like there shows in the feed', async ({ authedPage: page }) => {
  const firstCard = await openFirstCard(page)
  await expect(firstCard.getByTestId('like-count')).toHaveText(String(FIRST_POST.likes))

  await timeLink(firstCard).click()

  await expectPathname(page, FIRST_POST.path)
  const card = await expectPostPage(page)
  await expect(page).toHaveTitle(`Post by ${FIRST_POST.author.name} · Socio Network`)
  const like = card.getByRole('button', { name: 'Like', exact: true })
  await like.click()
  await expect(like).toHaveAttribute('aria-pressed', 'true')
  await expect(card.getByTestId('like-count')).toHaveText(String(FIRST_POST.likes + 1))

  await page.goBack()

  await expectPathname(page, '/')
  await expect(firstCard.getByRole('button', { name: 'Like', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(firstCard.getByTestId('like-count')).toHaveText(String(FIRST_POST.likes + 1))
})

test('13d. a like given in the feed shows on the post page', async ({ authedPage: page }) => {
  const firstCard = await openFirstCard(page)
  await firstCard.getByRole('button', { name: 'Like', exact: true }).click()
  await expect(firstCard.getByTestId('like-count')).toHaveText(String(FIRST_POST.likes + 1))

  await timeLink(firstCard).click()

  await expectPathname(page, FIRST_POST.path)
  const card = await expectPostPage(page)
  await expect(card.getByRole('button', { name: 'Like', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(card.getByTestId('like-count')).toHaveText(String(FIRST_POST.likes + 1))
})

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

test('13c. a failed post request shows an inline error, and Retry loads the post', async ({ authedPage: page }) => {
  let shouldFail = true
  await page.route(POST_API, async (route) => {
    if (shouldFail) {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Mock failure' }) })
      return
    }
    await route.continue()
  })
  const firstCard = await openFirstCard(page)

  await timeLink(firstCard).click()

  await expectPathname(page, FIRST_POST.path)
  await expect(page.getByRole('alert').filter({ hasText: 'Could not load the post.' })).toBeVisible()

  shouldFail = false
  await page.getByRole('button', { name: 'Retry' }).click()

  await expectPostPage(page)
})

test('14. the avatar opens the author profile and is skipped by keyboard', async ({ authedPage: page }) => {
  const firstCard = await openFirstCard(page)
  const avatarLink = firstCard.locator(`a[href="/users/${FIRST_POST.author.id}"][tabindex="-1"]`)
  await expect(avatarLink).toHaveAttribute('aria-hidden', 'true')

  await avatarLink.click()

  await expectPathname(page, `/users/${FIRST_POST.author.id}`)
  await expect(page.getByRole('heading', { level: 1, name: FIRST_POST.author.name })).toBeVisible()
})

test('15. an unknown post shows the "Page not found" page', async ({ authedPage: page }) => {
  const response = await page.goto('/posts/unknown')
  await waitForHydration(page)

  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
})

test('15b. client navigation to an unknown post shows the "Page not found" page', async ({ authedPage: page }) => {
  await gotoHydrated(page, '/')

  await page.evaluate(async () => {
    await (window as NuxtWindow).useNuxtApp?.().$router.push('/posts/unknown')
  })

  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
})

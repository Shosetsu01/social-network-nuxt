import { CURRENT_USER, VALID_CREDENTIALS, expect, test } from './fixtures'
import { expectPathname, gotoHydrated, reloadHydrated, waitForHydration } from './helpers'

const OWN_PROFILE_PATH = `/users/${CURRENT_USER.id}`

test('7. reloading the profile keeps the session alive', async ({ page, loginPage }) => {
  await loginPage.goto()
  await loginPage.login(VALID_CREDENTIALS.email, VALID_CREDENTIALS.password)
  await expectPathname(page, '/')
  const profileLink = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Profile' })
  await profileLink.click()
  await expectPathname(page, OWN_PROFILE_PATH)

  await reloadHydrated(page)

  await expectPathname(page, OWN_PROFILE_PATH)
  await expect(page.getByRole('heading', { level: 1, name: CURRENT_USER.name })).toBeVisible()
  await expect(profileLink).toHaveAttribute('aria-current', 'page')
})

test('8. logging out returns to /login and / redirects there again', async ({ authedPage: page, loginPage }) => {
  await gotoHydrated(page, OWN_PROFILE_PATH)

  await page.getByRole('button', { name: 'Log out' }).click()

  await expectPathname(page, '/login')
  await expect(loginPage.heading).toBeVisible()

  await gotoHydrated(page, '/')

  await expectPathname(page, '/login')
  await expect(loginPage.heading).toBeVisible()
})

test.describe('desktop only', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop-only scenario (plan.md section 6, T5)')

  test('11. an unknown user shows the "Page not found" page with a way back to the feed', async ({ authedPage: page }) => {
    const response = await page.goto('/users/999')
    await waitForHydration(page)

    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()

    await page.getByRole('link', { name: 'Back to feed' }).click()

    await expectPathname(page, '/')
    // The feed heading may be visually hidden, so only its presence is asserted.
    await expect(page.getByRole('heading', { level: 1, name: 'Feed' })).toBeAttached()
  })
})

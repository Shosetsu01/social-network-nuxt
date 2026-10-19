import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

type NuxtWindow = Window & { useNuxtApp?: () => { isHydrating: boolean } }

/**
 * SSR markup is visible long before Vue attaches handlers, and hydration resets v-model inputs,
 * so a click or fill made too early is silently lost. Call this after every full page load.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => (window as NuxtWindow).useNuxtApp?.().isHydrating === false)
}

/** A full page load that resolves once the page is interactive. */
export async function gotoHydrated(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await waitForHydration(page)
}

export async function reloadHydrated(page: Page): Promise<void> {
  await page.reload()
  await waitForHydration(page)
}

/** Asserts the route by pathname, ignoring the query string (`?redirect=...`). */
export async function expectPathname(page: Page, pathname: string): Promise<void> {
  await expect(page).toHaveURL(url => url.pathname === pathname)
}

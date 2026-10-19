import type { Locator, Page } from '@playwright/test'
import { gotoHydrated } from './helpers'

/** Locators follow the UI contract (docs/agents/rules.md section 6). */
export class LoginPage {
  readonly heading: Locator
  readonly email: Locator
  readonly password: Locator
  readonly showPassword: Locator
  readonly submit: Locator
  // Nuxt may add its own role="alert" route announcer, so match by text.
  readonly submitError: Locator

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Log in' })
    this.email = page.getByLabel('Email address', { exact: true })
    // exact: the "Show password" toggle also matches a substring label query.
    this.password = page.getByLabel('Password', { exact: true })
    this.showPassword = page.getByRole('button', { name: 'Show password' })
    this.submit = page.getByRole('button', { name: 'Login', exact: true })
    this.submitError = page.getByRole('alert').filter({ hasText: 'Login failed' })
  }

  async goto(): Promise<void> {
    await gotoHydrated(this.page, '/login')
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.email.fill(email)
    await this.password.fill(password)
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password)
    await this.submit.click()
  }
}
